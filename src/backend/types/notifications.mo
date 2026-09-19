import Common "common";

module {
  public type NotificationId = Common.NotificationId;
  public type Notification = Common.Notification;
  public type NotificationKind = Common.NotificationKind;
  public type Timestamp = Common.Timestamp;

  /// Search and filter options for the notification list.
  public type NotificationQuery = {
    unreadOnly : ?Bool;
    limit : ?Nat;
  };
};
