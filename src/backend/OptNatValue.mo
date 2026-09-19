/// Implicit instance: `?Nat -> Value`. Absence renders as the `0` sentinel
/// so the column keeps a single stable schema type.

import Types "mo:caffeineai-oql/Types";

module {
  public func _toRow(self : ?Nat) : Types.Value =
    switch self {
      case null { #nat 0 };
      case (?n) { #nat n };
    };
};
