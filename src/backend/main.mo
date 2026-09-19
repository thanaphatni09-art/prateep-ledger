import Map "mo:core/Map";
import List "mo:core/List";
import AccessControl "mo:caffeineai-authorization/access-control";
import MixinAuthorization "mo:caffeineai-authorization/MixinAuthorization";
import Expose "mo:caffeineai-oql/Expose";
import MapEntity "mo:caffeineai-oql/MapEntity";
import Entity "mo:caffeineai-oql/Entity";
import RecordValue "mo:caffeineai-oql/RecordValue";
import NatValue "mo:caffeineai-oql/NatValue";
import IntValue "mo:caffeineai-oql/IntValue";
import TextValue "mo:caffeineai-oql/TextValue";
import BoolValue "mo:caffeineai-oql/BoolValue";
import OptPrincipalValue "OptPrincipalValue";
import OptNatValue "OptNatValue";
import OptIntValue "OptIntValue";
import InvoiceStatusValue "InvoiceStatusValue";
import PaymentMethodValue "PaymentMethodValue";
import PaymentStatusValue "PaymentStatusValue";
import InvoiceLineArrayValue "InvoiceLineArrayValue";
import Common "types/common";
import Customers "types/customers";
import Products "types/products";
import Invoices "types/invoices";
import Payments "types/payments";
import CustomersApi "mixins/customers-api";
import ProductsApi "mixins/products-api";
import InvoicesApi "mixins/invoices-api";
import PaymentsApi "mixins/payments-api";
import DebtsApi "mixins/debts-api";
import SettingsApi "mixins/settings-api";
import NotificationsApi "mixins/notifications-api";
import DocumentsApi "mixins/documents-api";
import ApiDocMixin "mixins/api-doc";

actor {
  let accessControlState : AccessControl.AccessControlState;
  include MixinAuthorization(accessControlState, null);

  let customers : Map.Map<Common.CustomerId, Customers.Customer>;
  let products : Map.Map<Common.ProductId, Products.Product>;
  let invoices : Map.Map<Common.InvoiceId, Invoices.Invoice>;
  let payments : Map.Map<Common.PaymentId, Payments.Payment>;
  let proofs : Map.Map<Common.ProofId, Payments.TransferProof>;
  let receipts : Map.Map<Common.ReceiptId, Payments.Receipt>;
  let managerNotifications : List.List<Common.Notification>;
  let customerNotifications : Map.Map<Common.CustomerId, List.List<Common.Notification>>;
  let settings : { var value : Common.ShopSettings };
  let counters : {
    var nextCustomerId : Nat;
    var nextProductId : Nat;
    var nextInvoiceId : Nat;
    var nextPaymentId : Nat;
    var nextProofId : Nat;
    var nextReceiptId : Nat;
    var nextNotificationId : Nat;
  };

  include CustomersApi(accessControlState, customers, invoices, payments, counters);
  include ProductsApi(accessControlState, products, counters);
  include InvoicesApi(
    accessControlState,
    customers,
    products,
    invoices,
    payments,
    proofs,
    settings,
    counters,
  );
  include PaymentsApi(
    accessControlState,
    customers,
    invoices,
    payments,
    proofs,
    receipts,
    managerNotifications,
    customerNotifications,
    settings,
    counters,
  );
  include DebtsApi(accessControlState, customers, invoices);
  include SettingsApi(accessControlState, settings);
  include NotificationsApi(
    accessControlState,
    customers,
    managerNotifications,
    customerNotifications,
  );
  include DocumentsApi(accessControlState, customers, invoices, receipts, settings);
  include ApiDocMixin();

  include Expose({
    entities = [
      customers.toEntity("customer", "Customer", "id")
        .sample({
          id = 0;
          name = "";
          phone = "";
          address = "";
          creditLimit = 0;
          notes = "";
          loginPrincipal = null;
          active = true;
          createdAt = 0;
        })
        .controllerOnly()
        .build(),
      products.toEntity("product", "Product", "id")
        .sample({
          id = 0;
          name = "";
          sku = "";
          unit = "";
          unitPrice = 0;
          category = "";
          active = true;
          createdAt = 0;
        })
        .controllerOnly()
        .build(),
      invoices.toEntity("invoice", "Invoice", "id")
        .sample({
          id = 0;
          number = "";
          customerId = 0;
          customerName = "";
          lines = [];
          subtotal = 0;
          total = 0;
          amountPaid = 0;
          outstanding = 0;
          status = #unpaid;
          issuedAt = 0;
          dueAt = 0;
          notes = "";
        })
        .controllerOnly()
        .build(),
      payments.toEntity("payment", "Payment", "id")
        .sample({
          id = 0;
          invoiceId = 0;
          invoiceNumber = "";
          customerId = 0;
          customerName = "";
          amount = 0;
          paidAt = 0;
          method = #cash;
          reference = "";
          status = #pending;
          proofId = null;
          createdAt = 0;
        })
        .controllerOnly()
        .build(),
      proofs.toEntity("proof", "TransferProof", "id")
        .sample({
          id = 0;
          invoiceId = 0;
          invoiceNumber = "";
          customerId = 0;
          customerName = "";
          amount = 0;
          transferredAt = 0;
          imageKey = "";
          note = "";
          status = #pending;
          uploadedAt = 0;
          reviewedAt = null;
          reviewNote = "";
          paymentId = null;
        })
        .controllerOnly()
        .build(),
      receipts.toEntity("receipt", "Receipt", "id")
        .sample({
          id = 0;
          number = "";
          paymentId = 0;
          invoiceId = 0;
          invoiceNumber = "";
          customerId = 0;
          customerName = "";
          amount = 0;
          paidAt = 0;
          method = #cash;
          reference = "";
          issuedAt = 0;
        })
        .controllerOnly()
        .build(),
    ];
  });
};
