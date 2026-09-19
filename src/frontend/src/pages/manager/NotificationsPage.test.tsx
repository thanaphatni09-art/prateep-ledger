import { NotificationsPage } from "@/pages/manager/NotificationsPage";
import {
  resetCoreInfraMock,
  setActor,
  setIdentity,
} from "@/test/core-infra-mock";
import { createMockBackend } from "@/test/mock-backend";
import { renderWithProviders } from "@/test/render";
import { type Notification, NotificationKind } from "@/types/app";
import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@caffeineai/core-infrastructure", async () => {
  const { coreInfraMock } = await import("@/test/core-infra-mock");
  return coreInfraMock;
});

function makeNotification(overrides: Partial<Notification> = {}): Notification {
  return {
    id: 1n,
    kind: NotificationKind.proofUploaded,
    title: "มีหลักฐานการโอนใหม่",
    body: "ร้านกาแฟดอยแนบหลักฐานการโอน",
    createdAt: 0n,
    read: false,
    ...overrides,
  };
}

beforeEach(() => {
  resetCoreInfraMock();
  setIdentity({ isAuthenticated: true });
});

describe("NotificationsPage", () => {
  it("shows the unread indicator and count for unread notifications", async () => {
    setActor(
      createMockBackend({
        getCallerUserRole: vi.fn(async () => "admin"),
        listManagerNotifications: vi.fn(async () => [
          makeNotification(),
          makeNotification({ id: 2n, read: true, title: "อ่านแล้ว" }),
        ]),
      }),
    );

    renderWithProviders(<NotificationsPage />);

    expect(await screen.findByText("มีหลักฐานการโอนใหม่")).toBeInTheDocument();
    expect(screen.getByTestId("notifications.unread_count")).toHaveTextContent(
      "ยังไม่ได้อ่าน 1 รายการ",
    );
    expect(screen.getByLabelText("ยังไม่ได้อ่าน")).toBeInTheDocument();
  });

  it("marks a single notification as read", async () => {
    const user = userEvent.setup();
    const markManagerNotificationRead = vi.fn(async () => null);
    setActor(
      createMockBackend({
        getCallerUserRole: vi.fn(async () => "admin"),
        listManagerNotifications: vi.fn(async () => [makeNotification()]),
        markManagerNotificationRead,
      }),
    );

    renderWithProviders(<NotificationsPage />);

    await user.click(
      await screen.findByTestId("notifications.mark_read_button.1"),
    );

    await waitFor(() => {
      expect(markManagerNotificationRead).toHaveBeenCalledWith(1n);
    });
  });

  it("marks all notifications as read", async () => {
    const user = userEvent.setup();
    const markAllManagerNotificationsRead = vi.fn(async () => 1n);
    setActor(
      createMockBackend({
        getCallerUserRole: vi.fn(async () => "admin"),
        listManagerNotifications: vi.fn(async () => [makeNotification()]),
        markAllManagerNotificationsRead,
      }),
    );

    renderWithProviders(<NotificationsPage />);

    await user.click(
      await screen.findByTestId("notifications.mark_all_button"),
    );

    await waitFor(() => {
      expect(markAllManagerNotificationsRead).toHaveBeenCalledTimes(1);
    });
  });

  it("shows an empty state when there are no notifications", async () => {
    setActor(
      createMockBackend({
        getCallerUserRole: vi.fn(async () => "admin"),
        listManagerNotifications: vi.fn(async () => []),
      }),
    );

    renderWithProviders(<NotificationsPage />);

    expect(await screen.findByText("ยังไม่มีการแจ้งเตือน")).toBeInTheDocument();
  });
});
