import Map "mo:core/Map";
import List "mo:core/List";
import Nat "mo:core/Nat";
import Runtime "mo:core/Runtime";
import Time "mo:core/Time";
import Common "../types/common";
import Customers "../types/customers";
import Invoices "../types/invoices";
import Payments "../types/payments";
import InvoicesLib "invoices";
import NotificationsLib "notifications";

module {
  /// List payments matching the query.
  public func listPayments(
    payments : Map.Map<Common.PaymentId, Payments.Payment>,
    filter : Payments.PaymentQuery,
  ) : [Payments.Payment] {
    let term = switch (filter.search) {
      case (?s) { ?s.toLower() };
      case null { null };
    };
    let rows = List.empty<Payments.Payment>();
    for (payment in payments.values()) {
      let matchesSearch = switch (term) {
        case (?t) {
          payment.invoiceNumber.toLower().contains(#text t)
          or payment.customerName.toLower().contains(#text t)
          or payment.reference.toLower().contains(#text t);
        };
        case null { true };
      };
      let matchesStatus = switch (filter.status) {
        case (?s) { payment.status == s };
        case null { true };
      };
      let matchesCustomer = switch (filter.customerId) {
        case (?c) { payment.customerId == c };
        case null { true };
      };
      if (matchesSearch and matchesStatus and matchesCustomer) {
        rows.add(payment);
      };
    };
    rows.toArray().sort(func(a, b) = Int.compare(b.createdAt, a.createdAt));
  };

  /// Fetch a single payment.
  public func getPayment(
    payments : Map.Map<Common.PaymentId, Payments.Payment>,
    id : Common.PaymentId,
  ) : ?Payments.Payment {
    payments.get(id);
  };

  /// Record a manual payment against an invoice.
  public func recordPayment(
    payments : Map.Map<Common.PaymentId, Payments.Payment>,
    invoices : Map.Map<Common.InvoiceId, Invoices.Invoice>,
    receipts : Map.Map<Common.ReceiptId, Payments.Receipt>,
    managerNotifications : List.List<Common.Notification>,
    counters : {
      var nextPaymentId : Nat;
      var nextReceiptId : Nat;
      var nextNotificationId : Nat;
    },
    settings : Common.ShopSettings,
    input : Payments.PaymentInput,
  ) : Payments.Payment {
    let id = counters.nextPaymentId;
    counters.nextPaymentId := id + 1;

    let invoice = invoices.get(input.invoiceId);
    let invoiceNumber = switch (invoice) {
      case (?inv) { inv.number };
      case null { "" };
    };
    let customerId = switch (invoice) {
      case (?inv) { inv.customerId };
      case null { 0 };
    };
    let customerName = switch (invoice) {
      case (?inv) { inv.customerName };
      case null { "" };
    };

    let payment : Payments.Payment = {
      id;
      invoiceId = input.invoiceId;
      invoiceNumber;
      customerId;
      customerName;
      amount = input.amount;
      paidAt = input.paidAt;
      method = input.method;
      reference = input.reference;
      status = #approved;
      proofId = null;
      createdAt = Time.now();
    };
    payments.add(id, payment);

    let receiptId = counters.nextReceiptId;
    counters.nextReceiptId := receiptId + 1;
    receipts.add(receiptId, {
      id = receiptId;
      number = settings.receiptPrefix # "-" # receiptId.toText();
      paymentId = id;
      invoiceId = input.invoiceId;
      invoiceNumber;
      customerId;
      customerName;
      amount = input.amount;
      paidAt = input.paidAt;
      method = input.method;
      reference = input.reference;
      issuedAt = Time.now();
    });

    ignore InvoicesLib.recalculate(invoices, payments, input.invoiceId);

    ignore NotificationsLib.pushManager(
      managerNotifications,
      counters,
      #paymentRecorded,
      "บันทึกการชำระเงิน",
      "บันทึกการชำระเงิน " # input.amount.toText() # " สตางค์ สำหรับใบแจ้งหนี้ " # invoiceNumber,
    );

    payment;
  };

  /// List payments belonging to one customer.
  public func listPaymentsForCustomer(
    payments : Map.Map<Common.PaymentId, Payments.Payment>,
    customerId : Common.CustomerId,
  ) : [Payments.Payment] {
    let rows = List.empty<Payments.Payment>();
    for (payment in payments.values()) {
      if (payment.customerId == customerId) { rows.add(payment) };
    };
    rows.toArray().sort(func(a, b) = Int.compare(b.createdAt, a.createdAt));
  };

  /// List transfer proofs matching the query.
  public func listProofs(
    proofs : Map.Map<Common.ProofId, Payments.TransferProof>,
    filter : Payments.ProofQuery,
  ) : [Payments.TransferProof] {
    let rows = List.empty<Payments.TransferProof>();
    for (proof in proofs.values()) {
      let matchesStatus = switch (filter.status) {
        case (?s) { proof.status == s };
        case null { true };
      };
      let matchesCustomer = switch (filter.customerId) {
        case (?c) { proof.customerId == c };
        case null { true };
      };
      if (matchesStatus and matchesCustomer) { rows.add(proof) };
    };
    rows.toArray().sort(func(a, b) = Int.compare(b.uploadedAt, a.uploadedAt));
  };

  /// Fetch a single transfer proof.
  public func getProof(
    proofs : Map.Map<Common.ProofId, Payments.TransferProof>,
    id : Common.ProofId,
  ) : ?Payments.TransferProof {
    proofs.get(id);
  };

  /// Store a customer-uploaded transfer proof.
  public func uploadProof(
    proofs : Map.Map<Common.ProofId, Payments.TransferProof>,
    invoices : Map.Map<Common.InvoiceId, Invoices.Invoice>,
    customers : Map.Map<Common.CustomerId, Customers.Customer>,
    managerNotifications : List.List<Common.Notification>,
    counters : { var nextProofId : Nat; var nextNotificationId : Nat },
    customerId : Common.CustomerId,
    input : Payments.ProofInput,
  ) : Payments.TransferProof {
    let invoice = invoices.get(input.invoiceId);
    switch (invoice) {
      case (?inv) {
        if (inv.customerId != customerId) {
          Runtime.trap("Unauthorized: This invoice does not belong to the caller");
        };
      };
      case null {
        Runtime.trap("Invoice not found");
      };
    };

    let id = counters.nextProofId;
    counters.nextProofId := id + 1;

    let invoiceNumber = switch (invoice) {
      case (?inv) { inv.number };
      case null { "" };
    };
    let customerName = switch (customers.get(customerId)) {
      case (?customer) { customer.name };
      case null { "" };
    };

    let proof : Payments.TransferProof = {
      id;
      invoiceId = input.invoiceId;
      invoiceNumber;
      customerId;
      customerName;
      amount = input.amount;
      transferredAt = input.transferredAt;
      imageKey = input.imageKey;
      note = input.note;
      status = #pending;
      uploadedAt = Time.now();
      reviewedAt = null;
      reviewNote = "";
      paymentId = null;
    };
    proofs.add(id, proof);

    ignore NotificationsLib.pushManager(
      managerNotifications,
      counters,
      #proofUploaded,
      "มีหลักฐานการโอนเงินใหม่",
      customerName # " อัปโหลดหลักฐานการโอนเงินสำหรับใบแจ้งหนี้ " # invoiceNumber,
    );

    proof;
  };

  /// Approve a proof, creating the linked payment and updating the balance.
  public func approveProof(
    proofs : Map.Map<Common.ProofId, Payments.TransferProof>,
    payments : Map.Map<Common.PaymentId, Payments.Payment>,
    invoices : Map.Map<Common.InvoiceId, Invoices.Invoice>,
    receipts : Map.Map<Common.ReceiptId, Payments.Receipt>,
    _managerNotifications : List.List<Common.Notification>,
    customerNotifications : Map.Map<Common.CustomerId, List.List<Common.Notification>>,
    counters : {
      var nextPaymentId : Nat;
      var nextReceiptId : Nat;
      var nextNotificationId : Nat;
    },
    settings : Common.ShopSettings,
    id : Common.ProofId,
  ) : ?Payments.TransferProof {
    switch (proofs.get(id)) {
      case null { null };
      case (?proof) {
        if (proof.status != #pending) { return ?proof };

        let paymentId = counters.nextPaymentId;
        counters.nextPaymentId := paymentId + 1;

        let payment : Payments.Payment = {
          id = paymentId;
          invoiceId = proof.invoiceId;
          invoiceNumber = proof.invoiceNumber;
          customerId = proof.customerId;
          customerName = proof.customerName;
          amount = proof.amount;
          paidAt = proof.transferredAt;
          method = #bankTransfer;
          reference = proof.note;
          status = #approved;
          proofId = ?id;
          createdAt = Time.now();
        };
        payments.add(paymentId, payment);

        let receiptId = counters.nextReceiptId;
        counters.nextReceiptId := receiptId + 1;
        receipts.add(receiptId, {
          id = receiptId;
          number = settings.receiptPrefix # "-" # receiptId.toText();
          paymentId;
          invoiceId = proof.invoiceId;
          invoiceNumber = proof.invoiceNumber;
          customerId = proof.customerId;
          customerName = proof.customerName;
          amount = proof.amount;
          paidAt = proof.transferredAt;
          method = #bankTransfer;
          reference = proof.note;
          issuedAt = Time.now();
        });

        let updated : Payments.TransferProof = {
          id = proof.id;
          invoiceId = proof.invoiceId;
          invoiceNumber = proof.invoiceNumber;
          customerId = proof.customerId;
          customerName = proof.customerName;
          amount = proof.amount;
          transferredAt = proof.transferredAt;
          imageKey = proof.imageKey;
          note = proof.note;
          status = #approved;
          uploadedAt = proof.uploadedAt;
          reviewedAt = ?Time.now();
          reviewNote = proof.reviewNote;
          paymentId = ?paymentId;
        };
        proofs.add(id, updated);

        ignore InvoicesLib.recalculate(invoices, payments, proof.invoiceId);

        ignore NotificationsLib.pushCustomer(
          customerNotifications,
          counters,
          proof.customerId,
          #proofApproved,
          "หลักฐานการโอนเงินได้รับการอนุมัติ",
          "หลักฐานการโอนเงินสำหรับใบแจ้งหนี้ " # proof.invoiceNumber # " ได้รับการอนุมัติแล้ว",
        );

        ?updated;
      };
    };
  };

  /// Reject a proof, leaving the invoice balance unchanged.
  public func rejectProof(
    proofs : Map.Map<Common.ProofId, Payments.TransferProof>,
    customerNotifications : Map.Map<Common.CustomerId, List.List<Common.Notification>>,
    counters : { var nextNotificationId : Nat },
    id : Common.ProofId,
    note : Text,
  ) : ?Payments.TransferProof {
    switch (proofs.get(id)) {
      case null { null };
      case (?proof) {
        if (proof.status != #pending) { return ?proof };

        let updated : Payments.TransferProof = {
          id = proof.id;
          invoiceId = proof.invoiceId;
          invoiceNumber = proof.invoiceNumber;
          customerId = proof.customerId;
          customerName = proof.customerName;
          amount = proof.amount;
          transferredAt = proof.transferredAt;
          imageKey = proof.imageKey;
          note = proof.note;
          status = #rejected;
          uploadedAt = proof.uploadedAt;
          reviewedAt = ?Time.now();
          reviewNote = note;
          paymentId = proof.paymentId;
        };
        proofs.add(id, updated);

        ignore NotificationsLib.pushCustomer(
          customerNotifications,
          counters,
          proof.customerId,
          #proofRejected,
          "หลักฐานการโอนเงินถูกปฏิเสธ",
          "หลักฐานการโอนเงินสำหรับใบแจ้งหนี้ " # proof.invoiceNumber # " ถูกปฏิเสธ: " # note,
        );

        ?updated;
      };
    };
  };

  /// List receipts belonging to one customer.
  public func listReceiptsForCustomer(
    receipts : Map.Map<Common.ReceiptId, Payments.Receipt>,
    customerId : Common.CustomerId,
  ) : [Payments.Receipt] {
    let rows = List.empty<Payments.Receipt>();
    for (receipt in receipts.values()) {
      if (receipt.customerId == customerId) { rows.add(receipt) };
    };
    rows.toArray().sort(func(a, b) = Int.compare(b.issuedAt, a.issuedAt));
  };

  /// Fetch a single receipt.
  public func getReceipt(
    receipts : Map.Map<Common.ReceiptId, Payments.Receipt>,
    id : Common.ReceiptId,
  ) : ?Payments.Receipt {
    receipts.get(id);
  };
};
