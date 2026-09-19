import Map "mo:core/Map";
import Principal "mo:core/Principal";
import Runtime "mo:core/Runtime";
import Time "mo:core/Time";
import AccessControl "mo:caffeineai-authorization/access-control";
import Common "../types/common";
import Customers "../types/customers";
import Invoices "../types/invoices";
import Debts "../types/debts";
import DebtsLib "../lib/debts";
import CustomersLib "../lib/customers";

mixin (
  accessControlState : AccessControl.AccessControlState,
  customers : Map.Map<Common.CustomerId, Customers.Customer>,
  invoices : Map.Map<Common.InvoiceId, Invoices.Invoice>,
) {
  func requireManagerDebts(caller : Principal) {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only the manager can perform this action");
    };
  };

  func requireCustomerDebts(caller : Principal) : Customers.Customer {
    CustomersLib.customerForPrincipal(customers, caller)
      ?? Runtime.trap("Unauthorized: No customer account is linked to this caller");
  };

  /// List every customer with an outstanding balance.
  public query ({ caller }) func listDebts() : async [Debts.DebtRow] {
    requireManagerDebts(caller);
    DebtsLib.listDebts(customers, invoices, Time.now());
  };

  /// Aggregate outstanding balance and aging across all customers.
  public query ({ caller }) func getDebtSummary() : async Debts.DebtSummary {
    requireManagerDebts(caller);
    DebtsLib.getDebtSummary(customers, invoices, Time.now());
  };

  /// Fetch one customer's debt detail.
  public query ({ caller }) func getCustomerDebt(
    customerId : Common.CustomerId,
  ) : async ?Debts.DebtDetail {
    requireManagerDebts(caller);
    DebtsLib.getCustomerDebt(customers, invoices, customerId, Time.now());
  };

  /// Fetch the signed-in customer's own debt detail.
  public query ({ caller }) func getMyDebt() : async ?Debts.DebtDetail {
    let customer = requireCustomerDebts(caller);
    DebtsLib.getCustomerDebt(customers, invoices, customer.id, Time.now());
  };
};
