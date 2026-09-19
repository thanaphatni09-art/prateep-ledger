import { EmptyState } from "@/components/EmptyState";
import { Layout } from "@/components/Layout";
import { LoadingState } from "@/components/LoadingState";
import { PageHeader } from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import { useManagerNotifications } from "@/hooks/use-notifications";
import { useMarkAllManagerNotificationsRead } from "@/hooks/use-notifications";
import { useMarkManagerNotificationRead } from "@/hooks/use-notifications";
import { formatThaiDateTime } from "@/lib/format";
import { type Notification, NotificationKind } from "@/types/app";
import { Bell, BellRing, CheckCheck, FileWarning, Wallet } from "lucide-react";
import type { LucideIcon } from "lucide-react";

const KIND_ICONS: Record<NotificationKind, LucideIcon> = {
  [NotificationKind.proofUploaded]: BellRing,
  [NotificationKind.proofApproved]: CheckCheck,
  [NotificationKind.proofRejected]: FileWarning,
  [NotificationKind.invoiceOverdue]: FileWarning,
  [NotificationKind.paymentRecorded]: Wallet,
};

function NotificationRow({
  notification,
  index,
  onMarkRead,
  isMarking,
}: {
  notification: Notification;
  index: number;
  onMarkRead: (id: bigint) => void;
  isMarking: boolean;
}) {
  const Icon = KIND_ICONS[notification.kind] ?? Bell;
  return (
    <li
      className={
        notification.read
          ? "flex items-start gap-3 px-4 py-4"
          : "flex items-start gap-3 bg-accent/5 px-4 py-4"
      }
      data-ocid={`notifications.item.${index + 1}`}
    >
      <span
        className={
          notification.read
            ? "mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-md bg-muted text-muted-foreground"
            : "mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-md bg-accent/15 text-accent"
        }
      >
        <Icon className="size-4" aria-hidden="true" />
      </span>
      <div className="min-w-0 flex-1 space-y-0.5">
        <div className="flex items-center gap-2">
          <p className="truncate text-sm font-medium text-foreground">
            {notification.title}
          </p>
          {!notification.read ? (
            <span
              className="size-2 shrink-0 rounded-full bg-accent"
              aria-label="ยังไม่ได้อ่าน"
            />
          ) : null}
        </div>
        <p className="text-sm text-muted-foreground">{notification.body}</p>
        <p className="text-xs text-muted-foreground">
          {formatThaiDateTime(notification.createdAt)}
        </p>
      </div>
      {!notification.read ? (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onMarkRead(notification.id)}
          disabled={isMarking}
          data-ocid={`notifications.mark_read_button.${index + 1}`}
        >
          ทำเครื่องหมายว่าอ่านแล้ว
        </Button>
      ) : null}
    </li>
  );
}

/** Manager notification feed with unread indicators and mark-as-read. */
export function NotificationsPage() {
  const notifications = useManagerNotifications();
  const markRead = useMarkManagerNotificationRead();
  const markAllRead = useMarkAllManagerNotificationsRead();

  const rows = notifications.data ?? [];
  const unreadCount = rows.filter((item) => !item.read).length;

  return (
    <Layout area="manager">
      <div className="space-y-6" data-ocid="notifications.page">
        <PageHeader
          title="การแจ้งเตือน"
          description="เหตุการณ์สำคัญของร้าน ทั้งหลักฐานใหม่ ใบแจ้งหนี้เกินกำหนด และการรับชำระ"
          actions={
            <Button
              variant="outline"
              className="gap-1.5"
              onClick={() => markAllRead.mutate()}
              disabled={markAllRead.isPending || unreadCount === 0}
              data-ocid="notifications.mark_all_button"
            >
              <CheckCheck className="size-4" aria-hidden="true" />
              อ่านทั้งหมด
            </Button>
          }
        />

        {notifications.isLoading ? (
          <LoadingState rows={6} />
        ) : rows.length === 0 ? (
          <EmptyState
            icon={Bell}
            title="ยังไม่มีการแจ้งเตือน"
            description="เมื่อมีความเคลื่อนไหวในร้าน รายการจะปรากฏที่นี่"
          />
        ) : (
          <div className="overflow-hidden rounded-lg border border-border bg-card">
            <div className="flex items-center justify-between gap-3 border-b border-border px-4 py-3">
              <p className="text-sm text-muted-foreground">
                ทั้งหมด {rows.length} รายการ
              </p>
              {unreadCount > 0 ? (
                <span
                  className="ledger-figure text-xs font-medium text-accent"
                  data-ocid="notifications.unread_count"
                >
                  ยังไม่ได้อ่าน {unreadCount} รายการ
                </span>
              ) : (
                <span className="text-xs text-muted-foreground">อ่านครบแล้ว</span>
              )}
            </div>
            <ul
              className="divide-y divide-border"
              data-ocid="notifications.list"
            >
              {rows.map((notification, index) => (
                <NotificationRow
                  key={notification.id.toString()}
                  notification={notification}
                  index={index}
                  onMarkRead={(id) => markRead.mutate(id)}
                  isMarking={markRead.isPending}
                />
              ))}
            </ul>
          </div>
        )}
      </div>
    </Layout>
  );
}
