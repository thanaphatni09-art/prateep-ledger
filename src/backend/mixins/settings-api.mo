import Principal "mo:core/Principal";
import Runtime "mo:core/Runtime";
import AccessControl "mo:caffeineai-authorization/access-control";
import Common "../types/common";
import Settings "../types/settings";
import SettingsLib "../lib/settings";

mixin (
  accessControlState : AccessControl.AccessControlState,
  settings : { var value : Common.ShopSettings },
) {
  func requireManagerSettings(caller : Principal) {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only the manager can perform this action");
    };
  };

  /// Read the shop profile and bank details.
  public query ({ caller }) func getSettings() : async Common.ShopSettings {
    ignore caller;
    SettingsLib.getSettings(settings);
  };

  /// Update the shop profile, bank details, and numbering settings.
  public shared ({ caller }) func updateSettings(
    input : Settings.SettingsInput,
  ) : async Common.ShopSettings {
    requireManagerSettings(caller);
    SettingsLib.updateSettings(settings, input);
  };
};
