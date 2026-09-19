import Common "common";

module {
  public type ShopSettings = Common.ShopSettings;

  /// Input for updating the shop profile and bank details.
  public type SettingsInput = {
    shopName : Text;
    address : Text;
    taxId : Text;
    phone : Text;
    bankName : Text;
    accountName : Text;
    accountNumber : Text;
    promptPayRef : Text;
    invoicePrefix : Text;
    receiptPrefix : Text;
    defaultPaymentTermsDays : Nat;
  };
};
