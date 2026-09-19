/// Implicit instance: `PaymentStatus -> Value`. The variant renders as its
/// tag text so the column stays queryable by equality.

import Common "types/common";
import Types "mo:caffeineai-oql/Types";

module {
  public func _toRow(self : Common.PaymentStatus) : Types.Value =
    #text(
      switch self {
        case (#pending) { "pending" };
        case (#approved) { "approved" };
        case (#rejected) { "rejected" };
      }
    );
};
