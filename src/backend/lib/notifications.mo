import Map "mo:core/Map";
import List "mo:core/List";
import Time "mo:core/Time";
import Common "../types/common";
import Notifications "../types/notifications";

module {
  /// Append a notification to the manager's list.
  public func pushManager(
    managerNotifications : List.List<Common.Notification>,
    counters : { var nextNotificationId : Nat },
    kind : Common.NotificationKind,
    title : Text,
    body : Text,
  ) : Common.Notification {
    let id = counters.nextNotificationId;
    counters.nextNotificationId := id + 1;
    let notification : Common.Notification = {
      id;
      kind;
      title;
      body;
      createdAt = Time.now();
      read = false;
    };
    managerNotifications.add(notification);
    notification;
  };

  /// Append a notification to one customer's list.
  public func pushCustomer(
    customerNotifications : Map.Map<Common.CustomerId, List.List<Common.Notification>>,
    counters : { var nextNotificationId : Nat },
    customerId : Common.CustomerId,
    kind : Common.NotificationKind,
    title : Text,
    body : Text,
  ) : Common.Notification {
    let id = counters.nextNotificationId;
    counters.nextNotificationId := id + 1;
    let notification : Common.Notification = {
      id;
      kind;
      title;
      body;
      createdAt = Time.now();
      read = false;
    };
    let list = switch (customerNotifications.get(customerId)) {
      case (?existing) { existing };
      case null {
        let fresh = List.empty<Common.Notification>();
        customerNotifications.add(customerId, fresh);
        fresh;
      };
    };
    list.add(notification);
    notification;
  };

  /// List notifications for the manager.
  public func listManagerNotifications(
    managerNotifications : List.List<Common.Notification>,
    filter : Notifications.NotificationQuery,
  ) : [Common.Notification] {
    let unreadOnly = filter.unreadOnly ?? false;
    let rows = List.empty<Common.Notification>();
    for (notification in managerNotifications.values()) {
      if ((not unreadOnly) or (not notification.read)) { rows.add(notification) };
    };
    let sorted = rows.toArray().sort(func(a, b) = Int.compare(b.createdAt, a.createdAt));
    switch (filter.limit) {
      case (?n) { sorted.sliceToArray(0, n) };
      case null { sorted };
    };
  };

  /// List notifications for one customer.
  public func listCustomerNotifications(
    customerNotifications : Map.Map<Common.CustomerId, List.List<Common.Notification>>,
    customerId : Common.CustomerId,
    filter : Notifications.NotificationQuery,
  ) : [Common.Notification] {
    let unreadOnly = filter.unreadOnly ?? false;
    let rows = List.empty<Common.Notification>();
    switch (customerNotifications.get(customerId)) {
      case (?list) {
        for (notification in list.values()) {
          if ((not unreadOnly) or (not notification.read)) { rows.add(notification) };
        };
      };
      case null {};
    };
    let sorted = rows.toArray().sort(func(a, b) = Int.compare(b.createdAt, a.createdAt));
    switch (filter.limit) {
      case (?n) { sorted.sliceToArray(0, n) };
      case null { sorted };
    };
  };

  /// Count unread notifications for the manager.
  public func countUnreadManager(
    managerNotifications : List.List<Common.Notification>,
  ) : Nat {
    var count = 0;
    for (notification in managerNotifications.values()) {
      if (not notification.read) { count += 1 };
    };
    count;
  };

  /// Count unread notifications for one customer.
  public func countUnreadCustomer(
    customerNotifications : Map.Map<Common.CustomerId, List.List<Common.Notification>>,
    customerId : Common.CustomerId,
  ) : Nat {
    var count = 0;
    switch (customerNotifications.get(customerId)) {
      case (?list) {
        for (notification in list.values()) {
          if (not notification.read) { count += 1 };
        };
      };
      case null {};
    };
    count;
  };

  /// Mark one manager notification as read.
  public func markManagerRead(
    managerNotifications : List.List<Common.Notification>,
    id : Common.NotificationId,
  ) : ?Common.Notification {
    switch (managerNotifications.find(func(notification) = notification.id == id)) {
      case null { null };
      case (?notification) {
        let updated : Common.Notification = {
          id = notification.id;
          kind = notification.kind;
          title = notification.title;
          body = notification.body;
          createdAt = notification.createdAt;
          read = true;
        };
        managerNotifications.mapInPlace(func(existing) {
          if (existing.id == id) { updated } else { existing };
        });
        ?updated;
      };
    };
  };

  /// Mark one customer notification as read.
  public func markCustomerRead(
    customerNotifications : Map.Map<Common.CustomerId, List.List<Common.Notification>>,
    customerId : Common.CustomerId,
    id : Common.NotificationId,
  ) : ?Common.Notification {
    switch (customerNotifications.get(customerId)) {
      case null { null };
      case (?list) {
        switch (list.find(func(notification) = notification.id == id)) {
          case null { null };
          case (?notification) {
            let updated : Common.Notification = {
              id = notification.id;
              kind = notification.kind;
              title = notification.title;
              body = notification.body;
              createdAt = notification.createdAt;
              read = true;
            };
            list.mapInPlace(func(existing) {
              if (existing.id == id) { updated } else { existing };
            });
            ?updated;
          };
        };
      };
    };
  };

  /// Mark every manager notification as read.
  public func markAllManagerRead(
    managerNotifications : List.List<Common.Notification>,
  ) : Nat {
    var count = 0;
    managerNotifications.mapInPlace(func(notification) {
      if (notification.read) {
        notification;
      } else {
        count += 1;
        {
          id = notification.id;
          kind = notification.kind;
          title = notification.title;
          body = notification.body;
          createdAt = notification.createdAt;
          read = true;
        };
      };
    });
    count;
  };

  /// Mark every notification of one customer as read.
  public func markAllCustomerRead(
    customerNotifications : Map.Map<Common.CustomerId, List.List<Common.Notification>>,
    customerId : Common.CustomerId,
  ) : Nat {
    var count = 0;
    switch (customerNotifications.get(customerId)) {
      case (?list) {
        list.mapInPlace(func(notification) {
          if (notification.read) {
            notification;
          } else {
            count += 1;
            {
              id = notification.id;
              kind = notification.kind;
              title = notification.title;
              body = notification.body;
              createdAt = notification.createdAt;
              read = true;
            };
          };
        });
      };
      case null {};
    };
    count;
  };
};
