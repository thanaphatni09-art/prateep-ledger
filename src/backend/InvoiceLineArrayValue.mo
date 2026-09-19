/// Implicit instance: `[InvoiceLine] -> Value`. `Value` has no array
/// variant, so the lines render as a JSON-ish text summary that keeps the
/// column queryable without inventing a nested schema.

import Invoices "types/invoices";
import Types "mo:caffeineai-oql/Types";

module {
  public func _toRow(self : [Invoices.InvoiceLine]) : Types.Value =
    #text(
      self
        .map(func line = line.productName # " x" # line.quantity.toText())
        .values()
        .join("; ")
    );
};
