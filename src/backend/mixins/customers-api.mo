import Map "mo:core/Map";
import Principal "mo:core/Principal";
import Runtime "mo:core/Runtime";
import AccessControl "mo:caffeineai-authorization/access-control";
import Common "../types/common";
import Customers "../types/customers";
import Invoices "../types/invoices";
import Payments "../types/payments";
import CustomersLib "../lib/customers";

mixin (
  accessControlState : AccessControl.AccessControlState,
  customers : Map.Map<Common.CustomerId, Customers.Customer>,
  invoices : Map.Map<Common.InvoiceId, Invoices.Invoice>,
  payments : Map.Map<Common.PaymentId, Payments.Payment>,
  counters : { var nextCustomerId : Nat },
) {
  func requireManagerCustomers(caller : Principal) {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only the manager can perform this action");
    };
  };

  /// List customers with search and sort applied.
  public query ({ caller }) func listCustomers(
    filter : Customers.CustomerQuery,
  ) : async [Customers.CustomerSummary] {
    requireManagerCustomers(caller);
    CustomersLib.listCustomers(customers, invoices, filter);
  };

  /// Fetch a customer detail view.
  public query ({ caller }) func getCustomer(
    id : Common.CustomerId,
  ) : async ?Customers.CustomerDetail {
    requireManagerCustomers(caller);
    CustomersLib.getCustomer(customers, invoices, payments, id);
  };

  /// Create a customer account with a provisioned login.
  public shared ({ caller }) func createCustomer(
    input : Customers.CustomerInput,
  ) : async Customers.Customer {
    requireManagerCustomers(caller);
    CustomersLib.createCustomer(customers, counters, input);
  };

  /// Edit an existing customer account.
  public shared ({ caller }) func updateCustomer(
    id : Common.CustomerId,
    input : Customers.CustomerUpdate,
  ) : async ?Customers.Customer {
    requireManagerCustomers(caller);
    CustomersLib.updateCustomer(customers, id, input);
  };

  /// Resolve the signed-in caller's own customer account.
  public query ({ caller }) func getMyCustomer() : async ?Customers.Customer {
    CustomersLib.customerForPrincipal(customers, caller);
  };

  /// Bind a login principal to a customer account (manager only).
  public shared ({ caller }) func bindCustomerLogin(
    id : Common.CustomerId,
    principal : Principal,
  ) : async ?Customers.Customer {
    requireManagerCustomers(caller);
    CustomersLib.bindLoginPrincipal(customers, id, principal);
  };

  /// Bind the signed-in caller's own principal to an unclaimed customer account.
  public shared ({ caller }) func claimCustomerAccount(
    id : Common.CustomerId,
  ) : async ?Customers.Customer {
    CustomersLib.claimCustomer(customers, id, caller);
  };
};
