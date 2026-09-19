import Map "mo:core/Map";
import List "mo:core/List";
import Principal "mo:core/Principal";
import Runtime "mo:core/Runtime";
import AccessControl "mo:caffeineai-authorization/access-control";
import Common "../types/common";
import Customers "../types/customers";
import Invoices "../types/invoices";
import Payments "../types/payments";
import Products "../types/products";
import InvoicesLib "../lib/invoices";
import CustomersLib "../lib/customers";

mixin (
  accessControlState : AccessControl.AccessControlState,
  customers : Map.Map<Common.CustomerId, Customers.Customer>,
  products : Map.Map<Common.ProductId, Products.Product>,
  invoices : Map.Map<Common.InvoiceId, Invoices.Invoice>,
  payments : Map.Map<Common.PaymentId, Payments.Payment>,
  proofs : Map.Map<Common.ProofId, Payments.TransferProof>,
  settings : { var value : Common.ShopSettings },
  counters : { var nextInvoiceId : Nat },
) {
  func requireManagerInvoices(caller : Principal) {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only the manager can perform this action");
    };
  };

  func requireCustomerInvoices(caller : Principal) : Customers.Customer {
    CustomersLib.customerForPrincipal(customers, caller)
      ?? Runtime.trap("Unauthorized: No customer account is linked to this caller");
  };

  /// List invoices with search, status, and date-range filters applied.
  public query ({ caller }) func listInvoices(
    filter : Invoices.InvoiceQuery,
  ) : async [Invoices.Invoice] {
    requireManagerInvoices(caller);
    InvoicesLib.listInvoices(invoices, filter);
  };

  /// Fetch an invoice detail view.
  public query ({ caller }) func getInvoice(
    id : Common.InvoiceId,
  ) : async ?Invoices.InvoiceDetail {
    requireManagerInvoices(caller);
    switch (InvoicesLib.getInvoice(invoices, id)) {
      case null { null };
      case (?invoice) {
        let linkedPayments = List.empty<Payments.Payment>();
        for (payment in payments.values()) {
          if (payment.invoiceId == id) { linkedPayments.add(payment) };
        };
        let proofIds = List.empty<Common.ProofId>();
        for (proof in proofs.values()) {
          if (proof.invoiceId == id) { proofIds.add(proof.id) };
        };
        ?{
          invoice;
          payments = linkedPayments.toArray();
          proofIds = proofIds.toArray();
        };
      };
    };
  };

  /// Create an invoice for a customer.
  public shared ({ caller }) func createInvoice(
    input : Invoices.InvoiceInput,
  ) : async Invoices.Invoice {
    requireManagerInvoices(caller);
    InvoicesLib.createInvoice(invoices, products, customers, counters, settings.value, input);
  };

  /// List the signed-in customer's own invoices.
  public query ({ caller }) func listMyInvoices() : async [Invoices.Invoice] {
    let customer = requireCustomerInvoices(caller);
    InvoicesLib.listInvoicesForCustomer(invoices, customer.id);
  };

  /// Fetch one of the signed-in customer's own invoices.
  public query ({ caller }) func getMyInvoice(
    id : Common.InvoiceId,
  ) : async ?Invoices.Invoice {
    let customer = requireCustomerInvoices(caller);
    switch (InvoicesLib.getInvoice(invoices, id)) {
      case (?invoice) {
        if (invoice.customerId == customer.id) { ?invoice } else { null };
      };
      case null { null };
    };
  };
};
