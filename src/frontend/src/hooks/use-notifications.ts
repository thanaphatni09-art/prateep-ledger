import { createActor } from "@/backend";
import { queryKeys } from "@/lib/query-keys";
import type {
  Notification,
  NotificationId,
  NotificationQuery,
} from "@/types/app";
import { useActor } from "@caffeineai/core-infrastructure";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

/** Manager notification feed. */
export function useManagerNotifications(filter: NotificationQuery = {}) {
  const { actor, isFetching } = useActor(createActor);
  return useQuery<Notification[]>({
    queryKey: queryKeys.notifications.manager(filter),
    queryFn: async () => {
      if (!actor) return [];
      return actor.listManagerNotifications(filter);
    },
    enabled: !!actor && !isFetching,
  });
}

/** Unread manager notification count, used for the sidebar badge. */
export function useManagerUnreadCount() {
  const { actor, isFetching } = useActor(createActor);
  return useQuery<bigint>({
    queryKey: queryKeys.notifications.managerUnread,
    queryFn: async () => {
      if (!actor) return 0n;
      return actor.countUnreadManagerNotifications();
    },
    enabled: !!actor && !isFetching,
  });
}

/** Signed-in customer's notification feed. */
export function useMyNotifications(filter: NotificationQuery = {}) {
  const { actor, isFetching } = useActor(createActor);
  return useQuery<Notification[]>({
    queryKey: queryKeys.notifications.mine(filter),
    queryFn: async () => {
      if (!actor) return [];
      return actor.listMyNotifications(filter);
    },
    enabled: !!actor && !isFetching,
  });
}

/** Unread count for the signed-in customer. */
export function useMyUnreadCount() {
  const { actor, isFetching } = useActor(createActor);
  return useQuery<bigint>({
    queryKey: queryKeys.notifications.mineUnread,
    queryFn: async () => {
      if (!actor) return 0n;
      return actor.countUnreadMyNotifications();
    },
    enabled: !!actor && !isFetching,
  });
}

function invalidateManagerNotifications(
  queryClient: ReturnType<typeof useQueryClient>,
) {
  void queryClient.invalidateQueries({
    queryKey: ["notifications", "manager"],
  });
}

function invalidateMyNotifications(
  queryClient: ReturnType<typeof useQueryClient>,
) {
  void queryClient.invalidateQueries({ queryKey: ["notifications", "mine"] });
}

export function useMarkManagerNotificationRead() {
  const { actor } = useActor(createActor);
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: NotificationId) => {
      if (!actor) throw new Error("ยังเชื่อมต่อระบบไม่ได้");
      return actor.markManagerNotificationRead(id);
    },
    onSuccess: () => {
      invalidateManagerNotifications(queryClient);
    },
  });
}

export function useMarkAllManagerNotificationsRead() {
  const { actor } = useActor(createActor);
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      if (!actor) throw new Error("ยังเชื่อมต่อระบบไม่ได้");
      return actor.markAllManagerNotificationsRead();
    },
    onSuccess: () => {
      invalidateManagerNotifications(queryClient);
    },
  });
}

export function useMarkMyNotificationRead() {
  const { actor } = useActor(createActor);
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: NotificationId) => {
      if (!actor) throw new Error("ยังเชื่อมต่อระบบไม่ได้");
      return actor.markMyNotificationRead(id);
    },
    onSuccess: () => {
      invalidateMyNotifications(queryClient);
    },
  });
}

export function useMarkAllMyNotificationsRead() {
  const { actor } = useActor(createActor);
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      if (!actor) throw new Error("ยังเชื่อมต่อระบบไม่ได้");
      return actor.markAllMyNotificationsRead();
    },
    onSuccess: () => {
      invalidateMyNotifications(queryClient);
    },
  });
}
