import Map "mo:core/Map";
import List "mo:core/List";
import Nat "mo:core/Nat";
import Common "../types/common";
import Customers "../types/customers";
import Invoices "../types/invoices";
import Debts "../types/debts";

module {
  /// The five aging buckets in display order.
  public func emptyAging() : [Common.AgingBucketAmount] {
    [
      { bucket = #current; amount = 0 },
      { bucket = #days1to30; amount = 0 },
      { bucket = #days31to60; amount = 0 },
      { bucket = #days61to90; amount = 0 },
      { bucket = #over90; amount = 0 },
    ];
  };

  /// Bucket an invoice's outstanding balance by how long it has been due.
  public func bucketFor(dueAt : Common.Timestamp, now : Common.Timestamp) : Common.AgingBucket {
    if (dueAt >= now) { return #current };
    let days = (now - dueAt) / 86_400_000_000_000;
    if (days <= 30) { #days1to30 }
    else if (days <= 60) { #days31to60 }
    else if (days <= 90) { #days61to90 }
    else { #over90 };
  };

  /// Sum the outstanding balance of one customer's unpaid invoices.
  public func customerOutstanding(
    invoices : Map.Map<Common.InvoiceId, Invoices.Invoice>,
    customerId : Common.CustomerId,
  ) : Common.Satang {
    var total = 0;
    for (invoice in invoices.values()) {
      if (invoice.customerId == customerId) { total += invoice.outstanding };
    };
    total;
  };

  /// Count one customer's invoices.
  public func customerInvoiceCount(
    invoices : Map.Map<Common.InvoiceId, Invoices.Invoice>,
    customerId : Common.CustomerId,
  ) : Nat {
    var count = 0;
    for (invoice in invoices.values()) {
      if (invoice.customerId == customerId) { count += 1 };
    };
    count;
  };

  /// The oldest due date among one customer's unpaid invoices.
  public func customerOldestDueAt(
    invoices : Map.Map<Common.InvoiceId, Invoices.Invoice>,
    customerId : Common.CustomerId,
  ) : ?Common.Timestamp {
    var oldest : ?Common.Timestamp = null;
    for (invoice in invoices.values()) {
      if (invoice.customerId == customerId and invoice.outstanding > 0) {
        oldest := switch (oldest) {
          case null { ?invoice.dueAt };
          case (?current) { if (invoice.dueAt < current) { ?invoice.dueAt } else { ?current } };
        };
      };
    };
    oldest;
  };

  /// Aging breakdown of one customer's outstanding balance.
  public func customerAging(
    invoices : Map.Map<Common.InvoiceId, Invoices.Invoice>,
    customerId : Common.CustomerId,
    now : Common.Timestamp,
  ) : [Common.AgingBucketAmount] {
    var current = 0;
    var d1to30 = 0;
    var d31to60 = 0;
    var d61to90 = 0;
    var over90 = 0;
    for (invoice in invoices.values()) {
      if (invoice.customerId == customerId and invoice.outstanding > 0) {
        switch (bucketFor(invoice.dueAt, now)) {
          case (#current) { current += invoice.outstanding };
          case (#days1to30) { d1to30 += invoice.outstanding };
          case (#days31to60) { d31to60 += invoice.outstanding };
          case (#days61to90) { d61to90 += invoice.outstanding };
          case (#over90) { over90 += invoice.outstanding };
        };
      };
    };
    [
      { bucket = #current; amount = current },
      { bucket = #days1to30; amount = d1to30 },
      { bucket = #days31to60; amount = d31to60 },
      { bucket = #days61to90; amount = d61to90 },
      { bucket = #over90; amount = over90 },
    ];
  };

  /// List every customer with an outstanding balance.
  public func listDebts(
    customers : Map.Map<Common.CustomerId, Customers.Customer>,
    invoices : Map.Map<Common.InvoiceId, Invoices.Invoice>,
    now : Common.Timestamp,
  ) : [Debts.DebtRow] {
    let rows = List.empty<Debts.DebtRow>();
    for (customer in customers.values()) {
      let outstanding = customerOutstanding(invoices, customer.id);
      if (outstanding > 0) {
        rows.add({
          customerId = customer.id;
          customerName = customer.name;
          phone = customer.phone;
          outstandingBalance = outstanding;
          aging = customerAging(invoices, customer.id, now);
          oldestDueAt = customerOldestDueAt(invoices, customer.id);
          invoiceCount = customerInvoiceCount(invoices, customer.id);
        });
      };
    };
    rows.toArray().sort(func(a, b) = Nat.compare(b.outstandingBalance, a.outstandingBalance));
  };

  /// Aggregate outstanding balance and aging across all customers.
  public func getDebtSummary(
    customers : Map.Map<Common.CustomerId, Customers.Customer>,
    invoices : Map.Map<Common.InvoiceId, Invoices.Invoice>,
    now : Common.Timestamp,
  ) : Debts.DebtSummary {
    var total = 0;
    var customerCount = 0;
    var current = 0;
    var d1to30 = 0;
    var d31to60 = 0;
    var d61to90 = 0;
    var over90 = 0;
    for (customer in customers.values()) {
      let outstanding = customerOutstanding(invoices, customer.id);
      if (outstanding > 0) {
        customerCount += 1;
        total += outstanding;
        for (bucket in customerAging(invoices, customer.id, now).values()) {
          switch (bucket.bucket) {
            case (#current) { current += bucket.amount };
            case (#days1to30) { d1to30 += bucket.amount };
            case (#days31to60) { d31to60 += bucket.amount };
            case (#days61to90) { d61to90 += bucket.amount };
            case (#over90) { over90 += bucket.amount };
          };
        };
      };
    };
    {
      totalOutstanding = total;
      customerCount;
      aging = [
        { bucket = #current; amount = current },
        { bucket = #days1to30; amount = d1to30 },
        { bucket = #days31to60; amount = d31to60 },
        { bucket = #days61to90; amount = d61to90 },
        { bucket = #over90; amount = over90 },
      ];
    };
  };

  /// Fetch one customer's debt detail.
  public func getCustomerDebt(
    customers : Map.Map<Common.CustomerId, Customers.Customer>,
    invoices : Map.Map<Common.InvoiceId, Invoices.Invoice>,
    customerId : Common.CustomerId,
    now : Common.Timestamp,
  ) : ?Debts.DebtDetail {
    switch (customers.get(customerId)) {
      case null { null };
      case (?customer) {
        let rows = List.empty<Invoices.Invoice>();
        for (invoice in invoices.values()) {
          if (invoice.customerId == customerId) { rows.add(invoice) };
        };
        ?{
          customerId = customer.id;
          customerName = customer.name;
          phone = customer.phone;
          outstandingBalance = customerOutstanding(invoices, customerId);
          aging = customerAging(invoices, customerId, now);
          invoices = rows.toArray().sort(func(a, b) = Int.compare(b.issuedAt, a.issuedAt));
        };
      };
    };
  };
};
