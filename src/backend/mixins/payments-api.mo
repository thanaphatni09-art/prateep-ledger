import Map "mo:core/Map";
import List "mo:core/List";
import Principal "mo:core/Principal";
import Runtime "mo:core/Runtime";
import AccessControl "mo:caffeineai-authorization/access-control";
import Common "../types/common";
import Customers "../types/customers";
import Invoices "../types/invoices";
import Payments "../types/payments";
import PaymentsLib "../lib/payments";
import CustomersLib "../lib/customers";

mixin (
  accessControlState : AccessControl.AccessControlState,
  customers : Map.Map<Common.CustomerId, Customers.Customer>,
  invoices : Map.Map<Common.InvoiceId, Invoices.Invoice>,
  payments : Map.Map<Common.PaymentId, Payments.Payment>,
  proofs : Map.Map<Common.ProofId, Payments.TransferProof>,
  receipts : Map.Map<Common.ReceiptId, Payments.Receipt>,
  managerNotifications : List.List<Common.Notification>,
  customerNotifications : Map.Map<Common.CustomerId, List.List<Common.Notification>>,
  settings : { var value : Common.ShopSettings },
  counters : {
    var nextPaymentId : Nat;
    var nextProofId : Nat;
    var nextReceiptId : Nat;
    var nextNotificationId : Nat;
  },
) {
  func requireManagerPayments(caller : Principal) {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only the manager can perform this action");
    };
  };

  func requireCustomerPayments(caller : Principal) : Customers.Customer {
    CustomersLib.customerForPrincipal(customers, caller)
      ?? Runtime.trap("Unauthorized: No customer account is linked to this caller");
  };

  /// List payments with search and status filter applied.
  public query ({ caller }) func listPayments(
    filter : Payments.PaymentQuery,
  ) : async [Payments.Payment] {
    requireManagerPayments(caller);
    PaymentsLib.listPayments(payments, filter);
  };

  /// Fetch a single payment.
  public query ({ caller }) func getPayment(
    id : Common.PaymentId,
  ) : async ?Payments.Payment {
    requireManagerPayments(caller);
    PaymentsLib.getPayment(payments, id);
  };

  /// Record a manual payment against an invoice.
  public shared ({ caller }) func recordPayment(
    input : Payments.PaymentInput,
  ) : async Payments.Payment {
    requireManagerPayments(caller);
    PaymentsLib.recordPayment(
      payments,
      invoices,
      receipts,
      managerNotifications,
      counters,
      settings.value,
      input,
    );
  };

  /// List transfer proofs awaiting or already reviewed.
  public query ({ caller }) func listProofs(
    filter : Payments.ProofQuery,
  ) : async [Payments.TransferProof] {
    requireManagerPayments(caller);
    PaymentsLib.listProofs(proofs, filter);
  };

  /// Fetch a single transfer proof.
  public query ({ caller }) func getProof(
    id : Common.ProofId,
  ) : async ?Payments.TransferProof {
    requireManagerPayments(caller);
    PaymentsLib.getProof(proofs, id);
  };

  /// Upload a bank-transfer proof against an invoice.
  public shared ({ caller }) func uploadProof(
    input : Payments.ProofInput,
  ) : async Payments.TransferProof {
    let customer = requireCustomerPayments(caller);
    PaymentsLib.uploadProof(
      proofs,
      invoices,
      customers,
      managerNotifications,
      counters,
      customer.id,
      input,
    );
  };

  /// Approve a proof, creating the linked payment.
  public shared ({ caller }) func approveProof(
    id : Common.ProofId,
  ) : async ?Payments.TransferProof {
    requireManagerPayments(caller);
    PaymentsLib.approveProof(
      proofs,
      payments,
      invoices,
      receipts,
      managerNotifications,
      customerNotifications,
      counters,
      settings.value,
      id,
    );
  };

  /// Reject a proof, leaving the invoice balance unchanged.
  public shared ({ caller }) func rejectProof(
    id : Common.ProofId,
    note : Text,
  ) : async ?Payments.TransferProof {
    requireManagerPayments(caller);
    PaymentsLib.rejectProof(proofs, customerNotifications, counters, id, note);
  };

  /// List the signed-in customer's own payments.
  public query ({ caller }) func listMyPayments() : async [Payments.Payment] {
    let customer = requireCustomerPayments(caller);
    PaymentsLib.listPaymentsForCustomer(payments, customer.id);
  };

  /// List the signed-in customer's own receipts.
  public query ({ caller }) func listMyReceipts() : async [Payments.Receipt] {
    let customer = requireCustomerPayments(caller);
    PaymentsLib.listReceiptsForCustomer(receipts, customer.id);
  };

  /// Fetch one of the signed-in customer's own receipts.
  public query ({ caller }) func getMyReceipt(
    id : Common.ReceiptId,
  ) : async ?Payments.Receipt {
    let customer = requireCustomerPayments(caller);
    switch (PaymentsLib.getReceipt(receipts, id)) {
      case (?receipt) {
        if (receipt.customerId == customer.id) { ?receipt } else { null };
      };
      case null { null };
    };
  };
};
