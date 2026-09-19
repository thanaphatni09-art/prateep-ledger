/// Implicit instance: `?Principal -> Value`. `Value` has no `#principal`,
/// so a present principal renders through its canonical textual form and
/// absence renders as the empty-text sentinel.

import Principal "mo:core/Principal";
import Types "mo:caffeineai-oql/Types";

module {
  public func _toRow(self : ?Principal) : Types.Value =
    switch self {
      case null { #text("") };
      case (?p) { #text(p.toText()) };
    };
};
