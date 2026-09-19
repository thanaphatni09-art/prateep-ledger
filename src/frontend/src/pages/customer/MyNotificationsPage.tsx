import { EmptyState } from "@/components/EmptyState";
import { Layout } from "@/components/Layout";
import { LoadingState } from "@/components/LoadingState";
import { PageHeader } from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  useMarkAllMyNotificationsRead,
  useMarkMyNotificationRead,
  useMyNotifications,
} from "@/hooks/use-notifications";
import { formatThaiDateTime } from "@/lib/format";
import { cn } from "@/lib/utils";
import { NotificationKind } from "@/types/app";
import {
  BadgeCheck,
  Bell,
  BellRing,
  CheckCheck,
  FileWarning,
  Wallet,
  XCircle,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { useState } from "react";

function kindIcon(kind: NotificationKind): LucideIcon {
  switch (kind) {
    case NotificationKind.proofApproved:
      return BadgeCheck;
    case NotificationKind.proofRejected:
      return XCircle;
    case NotificationKind.paymentRecorded:
      return Wallet;
    case NotificationKind.invoiceOverdue:
      return FileWarning;
    default:
      return BellRing;
  }
}

/** The signed-in customer's notification feed with unread markers. */
export function MyNotificationsPage() {
  const [unreadOnly, setUnreadOnly] = useState(false);
  const { data: notifications, isLoading } = useMyNotifications(
    unreadOnly ? { unreadOnly: true } : {},
  );
  const markRead = useMarkMyNotificationRead();
  const markAllRead = useMarkAllMyNotificationsRead();

  const unreadCount = (notifications ?? []).filter((row) => !row.read).length;

  return (
    <Layout area="customer">
      <div className="space-y-6">
        <PageHeader
          title="การแจ้งเตือน"
          description="ความเคลื่อนไหวเกี่ยวกับใบแจ้งหนี้ การชำระเงิน และการตรวจสอบหลักฐาน"
          actions={
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="gap-2"
              onClick={() => markAllRead.mutate()}
              disabled={markAllRead.isPending || unreadCount === 0}
              data-ocid="customer.mark_all_read_button"
            >
              <CheckCheck className="size-4" aria-hidden="true" />
              อ่านทั้งหมด
            </Button>
          }
        />

        <fieldset
          className="flex flex-wrap gap-1.5"
          aria-label="กรองการแจ้งเตือน"
          data-ocid="customer.notification_filter"
        >
          <legend className="sr-only">กรองการแจ้งเตือน</legend>
          <Button
            type="button"
            size="sm"
            variant={unreadOnly ? "outline" : "default"}
            onClick={() => setUnreadOnly(false)}
            data-ocid="customer.notification_filter.all"
          >
            ทั้งหมด
          </Button>
          <Button
            type="button"
            size="sm"
            variant={unreadOnly ? "default" : "outline"}
            onClick={() => setUnreadOnly(true)}
            data-ocid="customer.notification_filter.unread"
          >
            ยังไม่อ่าน
          </Button>
        </fieldset>

        {isLoading ? (
          <LoadingState rows={6} />
        ) : (notifications ?? []).length === 0 ? (
          <EmptyState
            icon={Bell}
            title={unreadOnly ? "ไม่มีการแจ้งเตือนที่ยังไม่อ่าน" : "ยังไม่มีการแจ้งเตือน"}
            description={
              unreadOnly
                ? "คุณอ่านการแจ้งเตือนทั้งหมดแล้ว"
                : "เมื่อมีความเคลื่อนไหวในบัญชีของคุณ การแจ้งเตือนจะแสดงที่นี่"
            }
          />
        ) : (
          <Card data-ocid="customer.notification_list">
            <CardContent className="p-0">
              <ul className="divide-y divide-border">
                {(notifications ?? []).map((notification, index) => {
                  const Icon = kindIcon(notification.kind);
                  return (
                    <li
                      key={notification.id.toString()}
                      className={cn(
                        "flex items-start gap-3 px-4 py-4 transition-smooth",
                        !notification.read && "bg-primary/5",
                      )}
                      data-ocid={`customer.notification_item.${index + 1}`}
                    >
                      <span
                        className={cn(
                          "mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-full",
                          notification.read
                            ? "bg-muted text-muted-foreground"
                            : "bg-primary/15 text-primary",
                        )}
                      >
                        <Icon className="size-4" aria-hidden="true" />
                      </span>
                      <div className="min-w-0 flex-1 space-y-1">
                        <div className="flex items-start justify-between gap-3">
                          <p
                            className={cn(
                              "text-sm text-foreground",
                              !notification.read && "font-semibold",
                            )}
                          >
                            {notification.title}
                          </p>
                          {!notification.read ? (
                            <span
                              className="mt-1.5 size-2 shrink-0 rounded-full bg-accent"
                              aria-label="ยังไม่อ่าน"
                              data-ocid="customer.unread_indicator"
                            />
                          ) : null}
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {notification.body}
                        </p>
                        <div className="flex items-center justify-between gap-3 pt-1">
                          <span className="text-xs text-muted-foreground">
                            {formatThaiDateTime(notification.createdAt)}
                          </span>
                          {!notification.read ? (
                            <Button
                              type="button"
                              variant="link"
                              size="sm"
                              className="h-auto gap-1 px-0 text-xs"
                              onClick={() => markRead.mutate(notification.id)}
                              disabled={markRead.isPending}
                              data-ocid={`customer.mark_read_button.${index + 1}`}
                            >
                              ทำเครื่องหมายว่าอ่านแล้ว
                            </Button>
                          ) : null}
                        </div>
                      </div>
                    </li>
                  );
                })}
              </ul>
            </CardContent>
          </Card>
        )}
      </div>
    </Layout>
  );
}
