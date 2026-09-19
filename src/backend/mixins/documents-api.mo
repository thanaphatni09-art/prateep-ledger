import Map "mo:core/Map";
import Principal "mo:core/Principal";
import Runtime "mo:core/Runtime";
import AccessControl "mo:caffeineai-authorization/access-control";
import Common "../types/common";
import Customers "../types/customers";
import Invoices "../types/invoices";
import Payments "../types/payments";
import Documents "../types/documents";
import DocumentsLib "../lib/documents";
import CustomersLib "../lib/customers";

mixin (
  accessControlState : AccessControl.AccessControlState,
  customers : Map.Map<Common.CustomerId, Customers.Customer>,
  invoices : Map.Map<Common.InvoiceId, Invoices.Invoice>,
  receipts : Map.Map<Common.ReceiptId, Payments.Receipt>,
  settings : { var value : Common.ShopSettings },
) {
  func requireManagerDocuments(caller : Principal) {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only the manager can perform this action");
    };
  };

  func requireCustomerDocuments(caller : Principal) : Customers.Customer {
    CustomersLib.customerForPrincipal(customers, caller)
      ?? Runtime.trap("Unauthorized: No customer account is linked to this caller");
  };

  /// Build the printable invoice document for an invoice.
  public query ({ caller }) func getInvoiceDocument(
    id : Common.InvoiceId,
  ) : async ?Documents.InvoiceDocument {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      let customer = requireCustomerDocuments(caller);
      switch (invoices.get(id)) {
        case (?invoice) {
          if (invoice.customerId != customer.id) {
            Runtime.trap("Unauthorized: This invoice does not belong to you");
          };
        };
        case null {};
      };
    };
    DocumentsLib.buildInvoiceDocument(invoices, customers, settings, id);
  };

  /// Build the printable receipt document for a receipt.
  public query ({ caller }) func getReceiptDocument(
    id : Common.ReceiptId,
  ) : async ?Documents.ReceiptDocument {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      let customer = requireCustomerDocuments(caller);
      switch (receipts.get(id)) {
        case (?receipt) {
          if (receipt.customerId != customer.id) {
            Runtime.trap("Unauthorized: This receipt does not belong to you");
          };
        };
        case null {};
      };
    };
    DocumentsLib.buildReceiptDocument(receipts, customers, settings, id);
  };

  /// Build the printable debt notice document for a customer.
  public query ({ caller }) func getDebtNoticeDocument(
    customerId : Common.CustomerId,
  ) : async ?Documents.DebtNoticeDocument {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      let customer = requireCustomerDocuments(caller);
      if (customer.id != customerId) {
        Runtime.trap("Unauthorized: This debt notice does not belong to you");
      };
    };
    DocumentsLib.buildDebtNoticeDocument(customers, invoices, settings, customerId);
  };
};
