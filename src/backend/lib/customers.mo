import Map "mo:core/Map";
import List "mo:core/List";
import Nat "mo:core/Nat";
import Principal "mo:core/Principal";
import Time "mo:core/Time";
import Common "../types/common";
import Customers "../types/customers";
import Invoices "../types/invoices";
import Payments "../types/payments";
import DebtsLib "debts";

module {
  /// List customers matching the query, with derived balances.
  public func listCustomers(
    customers : Map.Map<Common.CustomerId, Customers.Customer>,
    invoices : Map.Map<Common.InvoiceId, Invoices.Invoice>,
    filter : Customers.CustomerQuery,
  ) : [Customers.CustomerSummary] {
    let term = switch (filter.search) {
      case (?s) { ?s.toLower() };
      case null { null };
    };
    let descending = filter.descending ?? false;
    let sortBy = filter.sortBy ?? "name";

    let rows = List.empty<Customers.CustomerSummary>();
    for (customer in customers.values()) {
      let matches = switch (term) {
        case (?t) {
          customer.name.toLower().contains(#text t) or customer.phone.contains(#text t);
        };
        case null { true };
      };
      if (matches) {
        let outstanding = DebtsLib.customerOutstanding(invoices, customer.id);
        let invoiceCount = DebtsLib.customerInvoiceCount(invoices, customer.id);
        rows.add({
          id = customer.id;
          name = customer.name;
          phone = customer.phone;
          address = customer.address;
          creditLimit = customer.creditLimit;
          notes = customer.notes;
          loginPrincipal = customer.loginPrincipal;
          active = customer.active;
          createdAt = customer.createdAt;
          outstandingBalance = outstanding;
          invoiceCount;
        });
      };
    };

    let sorted = rows.toArray().sort(func(a, b) {
      let order = switch (sortBy) {
        case "phone" { a.phone.compare(b.phone) };
        case "outstanding" { Nat.compare(a.outstandingBalance, b.outstandingBalance) };
        case "createdAt" { Int.compare(a.createdAt, b.createdAt) };
        case _ { a.name.compare(b.name) };
      };
      if (descending) {
        switch (order) {
          case (#less) { #greater };
          case (#equal) { #equal };
          case (#greater) { #less };
        };
      } else {
        order;
      };
    });
    sorted;
  };

  /// Fetch a single customer with derived balance figures.
  public func getCustomer(
    customers : Map.Map<Common.CustomerId, Customers.Customer>,
    invoices : Map.Map<Common.InvoiceId, Invoices.Invoice>,
    payments : Map.Map<Common.PaymentId, Payments.Payment>,
    id : Common.CustomerId,
  ) : ?Customers.CustomerDetail {
    switch (customers.get(id)) {
      case null { null };
      case (?customer) {
        var paymentCount = 0;
        for (payment in payments.values()) {
          if (payment.customerId == id) { paymentCount += 1 };
        };
        ?{
          customer;
          outstandingBalance = DebtsLib.customerOutstanding(invoices, id);
          aging = DebtsLib.customerAging(invoices, id, Time.now());
          invoiceCount = DebtsLib.customerInvoiceCount(invoices, id);
          paymentCount;
        };
      };
    };
  };

  /// Create a customer account and provision its login principal.
  public func createCustomer(
    customers : Map.Map<Common.CustomerId, Customers.Customer>,
    counters : { var nextCustomerId : Nat },
    input : Customers.CustomerInput,
  ) : Customers.Customer {
    let id = counters.nextCustomerId;
    counters.nextCustomerId := id + 1;
    let customer : Customers.Customer = {
      id;
      name = input.name;
      phone = input.phone;
      address = input.address;
      creditLimit = input.creditLimit;
      notes = input.notes;
      loginPrincipal = null;
      active = true;
      createdAt = Time.now();
    };
    customers.add(id, customer);
    customer;
  };

  /// Edit an existing customer account.
  public func updateCustomer(
    customers : Map.Map<Common.CustomerId, Customers.Customer>,
    id : Common.CustomerId,
    input : Customers.CustomerUpdate,
  ) : ?Customers.Customer {
    switch (customers.get(id)) {
      case null { null };
      case (?existing) {
        let updated : Customers.Customer = {
          id = existing.id;
          name = input.name;
          phone = input.phone;
          address = input.address;
          creditLimit = input.creditLimit;
          notes = input.notes;
          loginPrincipal = existing.loginPrincipal;
          active = input.active;
          createdAt = existing.createdAt;
        };
        customers.add(id, updated);
        ?updated;
      };
    };
  };

  /// Resolve the customer account bound to a login principal.
  public func customerForPrincipal(
    customers : Map.Map<Common.CustomerId, Customers.Customer>,
    p : Principal,
  ) : ?Customers.Customer {
    customers.values().find(func(customer) {
      switch (customer.loginPrincipal) {
        case (?lp) { Principal.equal(lp, p) };
        case null { false };
      };
    });
  };

  /// Bind a login principal to a customer account, clearing any prior binding
  /// on that principal so a principal maps to at most one customer.
  public func bindLoginPrincipal(
    customers : Map.Map<Common.CustomerId, Customers.Customer>,
    id : Common.CustomerId,
    principal : Principal,
  ) : ?Customers.Customer {
    switch (customers.get(id)) {
      case null { null };
      case (?target) {
        for (customer in customers.values()) {
          switch (customer.loginPrincipal) {
            case (?lp) {
              if (Principal.equal(lp, principal) and customer.id != id) {
                customers.add(customer.id, { customer with loginPrincipal = null });
              };
            };
            case null {};
          };
        };
        let updated : Customers.Customer = { target with loginPrincipal = ?principal };
        customers.add(id, updated);
        ?updated;
      };
    };
  };

  /// Bind the signed-in caller's own principal to a customer account that has
  /// no login principal yet.
  public func claimCustomer(
    customers : Map.Map<Common.CustomerId, Customers.Customer>,
    id : Common.CustomerId,
    principal : Principal,
  ) : ?Customers.Customer {
    switch (customers.get(id)) {
      case null { null };
      case (?target) {
        switch (target.loginPrincipal) {
          case (?_) { null };
          case null {
            let updated : Customers.Customer = { target with loginPrincipal = ?principal };
            customers.add(id, updated);
            ?updated;
          };
        };
      };
    };
  };
};
