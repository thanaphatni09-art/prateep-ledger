import Map "mo:core/Map";
import List "mo:core/List";
import Principal "mo:core/Principal";
import Runtime "mo:core/Runtime";
import AccessControl "mo:caffeineai-authorization/access-control";
import Common "../types/common";
import Customers "../types/customers";
import Notifications "../types/notifications";
import NotificationsLib "../lib/notifications";
import CustomersLib "../lib/customers";

mixin (
  accessControlState : AccessControl.AccessControlState,
  customers : Map.Map<Common.CustomerId, Customers.Customer>,
  managerNotifications : List.List<Common.Notification>,
  customerNotifications : Map.Map<Common.CustomerId, List.List<Common.Notification>>,
) {
  func requireManagerNotifications(caller : Principal) {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only the manager can perform this action");
    };
  };

  func requireCustomerNotifications(caller : Principal) : Customers.Customer {
    CustomersLib.customerForPrincipal(customers, caller)
      ?? Runtime.trap("Unauthorized: No customer account is linked to this caller");
  };

  /// List notifications for the manager.
  public query ({ caller }) func listManagerNotifications(
    filter : Notifications.NotificationQuery,
  ) : async [Common.Notification] {
    requireManagerNotifications(caller);
    NotificationsLib.listManagerNotifications(managerNotifications, filter);
  };

  /// Count unread manager notifications.
  public query ({ caller }) func countUnreadManagerNotifications() : async Nat {
    requireManagerNotifications(caller);
    NotificationsLib.countUnreadManager(managerNotifications);
  };

  /// Mark one manager notification as read.
  public shared ({ caller }) func markManagerNotificationRead(
    id : Common.NotificationId,
  ) : async ?Common.Notification {
    requireManagerNotifications(caller);
    NotificationsLib.markManagerRead(managerNotifications, id);
  };

  /// Mark every manager notification as read.
  public shared ({ caller }) func markAllManagerNotificationsRead() : async Nat {
    requireManagerNotifications(caller);
    NotificationsLib.markAllManagerRead(managerNotifications);
  };

  /// List notifications for the signed-in customer.
  public query ({ caller }) func listMyNotifications(
    filter : Notifications.NotificationQuery,
  ) : async [Common.Notification] {
    let customer = requireCustomerNotifications(caller);
    NotificationsLib.listCustomerNotifications(customerNotifications, customer.id, filter);
  };

  /// Count unread notifications for the signed-in customer.
  public query ({ caller }) func countUnreadMyNotifications() : async Nat {
    let customer = requireCustomerNotifications(caller);
    NotificationsLib.countUnreadCustomer(customerNotifications, customer.id);
  };

  /// Mark one of the signed-in customer's notifications as read.
  public shared ({ caller }) func markMyNotificationRead(
    id : Common.NotificationId,
  ) : async ?Common.Notification {
    let customer = requireCustomerNotifications(caller);
    NotificationsLib.markCustomerRead(customerNotifications, customer.id, id);
  };

  /// Mark every notification of the signed-in customer as read.
  public shared ({ caller }) func markAllMyNotificationsRead() : async Nat {
    let customer = requireCustomerNotifications(caller);
    NotificationsLib.markAllCustomerRead(customerNotifications, customer.id);
  };
};
