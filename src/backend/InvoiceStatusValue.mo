/// Implicit instance: `InvoiceStatus -> Value`. The variant renders as its
/// tag text so the column stays queryable by equality.

import Common "types/common";
import Types "mo:caffeineai-oql/Types";

module {
  public func _toRow(self : Common.InvoiceStatus) : Types.Value =
    #text(
      switch self {
        case (#unpaid) { "unpaid" };
        case (#partiallyPaid) { "partiallyPaid" };
        case (#paid) { "paid" };
        case (#overdue) { "overdue" };
      }
    );
};
