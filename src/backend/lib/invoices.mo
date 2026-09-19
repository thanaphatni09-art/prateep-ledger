import Map "mo:core/Map";
import List "mo:core/List";
import Nat "mo:core/Nat";
import Time "mo:core/Time";
import Common "../types/common";
import Customers "../types/customers";
import Invoices "../types/invoices";
import Products "../types/products";
import Payments "../types/payments";

module {
  /// Derive an invoice's lifecycle status from its paid amount and due date.
  public func deriveStatus(invoice : Invoices.Invoice, now : Common.Timestamp) : Common.InvoiceStatus {
    if (invoice.amountPaid >= invoice.total) {
      #paid;
    } else if (invoice.dueAt < now) {
      #overdue;
    } else if (invoice.amountPaid > 0) {
      #partiallyPaid;
    } else {
      #unpaid;
    };
  };

  /// Recompute an invoice's paid amount, outstanding balance, and status.
  public func recalculate(
    invoices : Map.Map<Common.InvoiceId, Invoices.Invoice>,
    payments : Map.Map<Common.PaymentId, Payments.Payment>,
    id : Common.InvoiceId,
  ) : ?Invoices.Invoice {
    switch (invoices.get(id)) {
      case null { null };
      case (?invoice) {
        var paid = 0;
        for (payment in payments.values()) {
          if (payment.invoiceId == id and payment.status == #approved) {
            paid += payment.amount;
          };
        };
        let outstanding = Nat.sub(invoice.total, paid);
        let updated : Invoices.Invoice = {
          id = invoice.id;
          number = invoice.number;
          customerId = invoice.customerId;
          customerName = invoice.customerName;
          lines = invoice.lines;
          subtotal = invoice.subtotal;
          total = invoice.total;
          amountPaid = paid;
          outstanding;
          status = deriveStatus({ invoice with amountPaid = paid; outstanding }, Time.now());
          issuedAt = invoice.issuedAt;
          dueAt = invoice.dueAt;
          notes = invoice.notes;
        };
        invoices.add(id, updated);
        ?updated;
      };
    };
  };

  /// List invoices matching the query.
  public func listInvoices(
    invoices : Map.Map<Common.InvoiceId, Invoices.Invoice>,
    filter : Invoices.InvoiceQuery,
  ) : [Invoices.Invoice] {
    let term = switch (filter.search) {
      case (?s) { ?s.toLower() };
      case null { null };
    };
    let rows = List.empty<Invoices.Invoice>();
    for (invoice in invoices.values()) {
      let matchesSearch = switch (term) {
        case (?t) {
          invoice.number.toLower().contains(#text t) or invoice.customerName.toLower().contains(#text t);
        };
        case null { true };
      };
      let matchesStatus = switch (filter.status) {
        case (?s) { invoice.status == s };
        case null { true };
      };
      let matchesCustomer = switch (filter.customerId) {
        case (?c) { invoice.customerId == c };
        case null { true };
      };
      let matchesFrom = switch (filter.fromDate) {
        case (?d) { invoice.issuedAt >= d };
        case null { true };
      };
      let matchesTo = switch (filter.toDate) {
        case (?d) { invoice.issuedAt <= d };
        case null { true };
      };
      if (matchesSearch and matchesStatus and matchesCustomer and matchesFrom and matchesTo) {
        rows.add(invoice);
      };
    };
    rows.toArray().sort(func(a, b) = Int.compare(b.issuedAt, a.issuedAt));
  };

  /// Fetch a single invoice.
  public func getInvoice(
    invoices : Map.Map<Common.InvoiceId, Invoices.Invoice>,
    id : Common.InvoiceId,
  ) : ?Invoices.Invoice {
    invoices.get(id);
  };

  /// Create an invoice, computing line totals and grand total in THB.
  public func createInvoice(
    invoices : Map.Map<Common.InvoiceId, Invoices.Invoice>,
    products : Map.Map<Common.ProductId, Products.Product>,
    customers : Map.Map<Common.CustomerId, Customers.Customer>,
    counters : { var nextInvoiceId : Nat },
    settings : Common.ShopSettings,
    input : Invoices.InvoiceInput,
  ) : Invoices.Invoice {
    let id = counters.nextInvoiceId;
    counters.nextInvoiceId := id + 1;

    let lines = List.empty<Invoices.InvoiceLine>();
    var subtotal = 0;
    for (lineInput in input.lines.values()) {
      switch (products.get(lineInput.productId)) {
        case (?product) {
          let lineTotal = product.unitPrice * lineInput.quantity;
          subtotal += lineTotal;
          lines.add({
            productId = product.id;
            productName = product.name;
            unit = product.unit;
            quantity = lineInput.quantity;
            unitPrice = product.unitPrice;
            lineTotal;
          });
        };
        case null {};
      };
    };

    let customerName = switch (customers.get(input.customerId)) {
      case (?customer) { customer.name };
      case null { "" };
    };

    let invoice : Invoices.Invoice = {
      id;
      number = settings.invoicePrefix # "-" # id.toText();
      customerId = input.customerId;
      customerName;
      lines = lines.toArray();
      subtotal;
      total = subtotal;
      amountPaid = 0;
      outstanding = subtotal;
      status = #unpaid;
      issuedAt = input.issuedAt;
      dueAt = input.dueAt;
      notes = input.notes;
    };
    invoices.add(id, invoice);
    invoice;
  };

  /// List invoices belonging to one customer.
  public func listInvoicesForCustomer(
    invoices : Map.Map<Common.InvoiceId, Invoices.Invoice>,
    customerId : Common.CustomerId,
  ) : [Invoices.Invoice] {
    let rows = List.empty<Invoices.Invoice>();
    for (invoice in invoices.values()) {
      if (invoice.customerId == customerId) { rows.add(invoice) };
    };
    rows.toArray().sort(func(a, b) = Int.compare(b.issuedAt, a.issuedAt));
  };
};
