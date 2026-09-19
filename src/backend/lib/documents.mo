import Map "mo:core/Map";
import List "mo:core/List";
import Time "mo:core/Time";
import Common "../types/common";
import Customers "../types/customers";
import Invoices "../types/invoices";
import Payments "../types/payments";
import Documents "../types/documents";
import DebtsLib "debts";

module {
  let thaiDigits = ["ศูนย์", "หนึ่ง", "สอง", "สาม", "สี่", "ห้า", "หก", "เจ็ด", "แปด", "เก้า"];
  let thaiPositions = ["", "สิบ", "ร้อย", "พัน", "หมื่น", "แสน"];

  /// Render a non-negative integer below one million as Thai text.
  func belowMillion(n : Nat) : Text {
    if (n == 0) { return "ศูนย์" };
    var remaining = n;
    var position = 0;
    var result = "";
    while (remaining > 0) {
      let digit = remaining % 10;
      if (digit != 0) {
        let prefix = if (position == 1 and digit == 1) {
          "";
        } else if (position == 1 and digit == 2) {
          "ยี่";
        } else if (position == 0 and digit == 1 and n >= 10) {
          "เอ็ด";
        } else {
          thaiDigits[digit];
        };
        result := prefix # thaiPositions[position] # result;
      };
      remaining := remaining / 10;
      position += 1;
    };
    result;
  };

  /// Render a non-negative integer as Thai text.
  func integerToThai(n : Nat) : Text {
    if (n == 0) { return "ศูนย์" };
    if (n < 1_000_000) { return belowMillion(n) };
    let millions = n / 1_000_000;
    let rest = n % 1_000_000;
    let head = integerToThai(millions) # "ล้าน";
    if (rest == 0) { head } else { head # belowMillion(rest) };
  };

  /// Render a satang amount as Thai baht text.
  public func amountInWords(amount : Common.Satang) : Text {
    let baht = amount / 100;
    let satang = amount % 100;
    let bahtText = integerToThai(baht) # "บาท";
    if (satang == 0) {
      bahtText # "ถ้วน";
    } else {
      bahtText # integerToThai(satang) # "สตางค์";
    };
  };

  func header(settings : Common.ShopSettings) : Documents.DocumentHeader {
    {
      shopName = settings.shopName;
      address = settings.address;
      taxId = settings.taxId;
      phone = settings.phone;
    };
  };

  /// Build the printable invoice document for an invoice.
  public func buildInvoiceDocument(
    invoices : Map.Map<Common.InvoiceId, Invoices.Invoice>,
    customers : Map.Map<Common.CustomerId, Customers.Customer>,
    settings : { var value : Common.ShopSettings },
    id : Common.InvoiceId,
  ) : ?Documents.InvoiceDocument {
    switch (invoices.get(id)) {
      case null { null };
      case (?invoice) {
        let customer = customers.get(invoice.customerId);
        let customerAddress = switch (customer) {
          case (?c) { c.address };
          case null { "" };
        };
        let customerPhone = switch (customer) {
          case (?c) { c.phone };
          case null { "" };
        };
        ?{
          header = header(settings.value);
          number = invoice.number;
          issuedAt = invoice.issuedAt;
          dueAt = invoice.dueAt;
          customerName = invoice.customerName;
          customerAddress;
          customerPhone;
          lines = invoice.lines.map(func(line) = {
            description = line.productName;
            unit = line.unit;
            quantity = line.quantity;
            unitPrice = line.unitPrice;
            lineTotal = line.lineTotal;
          });
          subtotal = invoice.subtotal;
          total = invoice.total;
          amountPaid = invoice.amountPaid;
          outstanding = invoice.outstanding;
          amountInWords = amountInWords(invoice.total);
          notes = invoice.notes;
        };
      };
    };
  };

  /// Build the printable receipt document for a receipt.
  public func buildReceiptDocument(
    receipts : Map.Map<Common.ReceiptId, Payments.Receipt>,
    customers : Map.Map<Common.CustomerId, Customers.Customer>,
    settings : { var value : Common.ShopSettings },
    id : Common.ReceiptId,
  ) : ?Documents.ReceiptDocument {
    switch (receipts.get(id)) {
      case null { null };
      case (?receipt) {
        let customer = customers.get(receipt.customerId);
        let customerAddress = switch (customer) {
          case (?c) { c.address };
          case null { "" };
        };
        ?{
          header = header(settings.value);
          number = receipt.number;
          issuedAt = receipt.issuedAt;
          customerName = receipt.customerName;
          customerAddress;
          invoiceNumber = receipt.invoiceNumber;
          amount = receipt.amount;
          amountInWords = amountInWords(receipt.amount);
          method = receipt.method;
          reference = receipt.reference;
        };
      };
    };
  };

  /// Build the printable debt notice document for a customer.
  public func buildDebtNoticeDocument(
    customers : Map.Map<Common.CustomerId, Customers.Customer>,
    invoices : Map.Map<Common.InvoiceId, Invoices.Invoice>,
    settings : { var value : Common.ShopSettings },
    customerId : Common.CustomerId,
  ) : ?Documents.DebtNoticeDocument {
    switch (customers.get(customerId)) {
      case null { null };
      case (?customer) {
        let rows = List.empty<Documents.DocumentLine>();
        for (invoice in invoices.values()) {
          if (invoice.customerId == customerId and invoice.outstanding > 0) {
            rows.add({
              description = "ใบแจ้งหนี้ " # invoice.number;
              unit = "ใบ";
              quantity = 1;
              unitPrice = invoice.outstanding;
              lineTotal = invoice.outstanding;
            });
          };
        };
        let outstanding = DebtsLib.customerOutstanding(invoices, customerId);
        ?{
          header = header(settings.value);
          customerName = customer.name;
          customerAddress = customer.address;
          customerPhone = customer.phone;
          issuedAt = Time.now();
          outstandingBalance = outstanding;
          amountInWords = amountInWords(outstanding);
          aging = DebtsLib.customerAging(invoices, customerId, Time.now());
          invoices = rows.toArray();
          bankName = settings.value.bankName;
          accountName = settings.value.accountName;
          accountNumber = settings.value.accountNumber;
          promptPayRef = settings.value.promptPayRef;
        };
      };
    };
  };
};
