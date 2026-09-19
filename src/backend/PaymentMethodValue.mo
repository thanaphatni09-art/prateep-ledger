/// Implicit instance: `PaymentMethod -> Value`. The variant renders as its
/// tag text so the column stays queryable by equality.

import Common "types/common";
import Types "mo:caffeineai-oql/Types";

module {
  public func _toRow(self : Common.PaymentMethod) : Types.Value =
    #text(
      switch self {
        case (#cash) { "cash" };
        case (#bankTransfer) { "bankTransfer" };
        case (#other) { "other" };
      }
    );
};
