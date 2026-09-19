import Common "../types/common";
import Settings "../types/settings";

module {
  /// Read the shop profile and bank details.
  public func getSettings(
    settings : { var value : Common.ShopSettings },
  ) : Common.ShopSettings {
    settings.value;
  };

  /// Update the shop profile, bank details, and numbering settings.
  public func updateSettings(
    settings : { var value : Common.ShopSettings },
    input : Settings.SettingsInput,
  ) : Common.ShopSettings {
    let updated : Common.ShopSettings = {
      shopName = input.shopName;
      address = input.address;
      taxId = input.taxId;
      phone = input.phone;
      bankName = input.bankName;
      accountName = input.accountName;
      accountNumber = input.accountNumber;
      promptPayRef = input.promptPayRef;
      invoicePrefix = input.invoicePrefix;
      receiptPrefix = input.receiptPrefix;
      defaultPaymentTermsDays = input.defaultPaymentTermsDays;
    };
    settings.value := updated;
    updated;
  };
};
