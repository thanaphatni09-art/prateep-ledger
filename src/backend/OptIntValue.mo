/// Implicit instance: `?Int -> Value`. Absence renders as the `0` sentinel
/// so the column keeps a single stable schema type.

import Types "mo:caffeineai-oql/Types";

module {
  public func _toRow(self : ?Int) : Types.Value =
    switch self {
      case null { #int 0 };
      case (?i) { #int i };
    };
};
