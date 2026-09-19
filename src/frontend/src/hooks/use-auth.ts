import { createActor } from "@/backend";
import { queryKeys } from "@/lib/query-keys";
import type { AppArea, Customer, UserRole } from "@/types/app";
import { useActor, useInternetIdentity } from "@caffeineai/core-infrastructure";
import { useQuery } from "@tanstack/react-query";

/**
 * Resolve the signed-in caller's role.
 *
 * `getCallerUserRole` traps for a signed-in but unregistered principal, so the
 * query is only enabled for an authenticated identity and a trap surfaces as a
 * query error rather than an unhandled rejection.
 */
export function useUserRole() {
  const { actor, isFetching } = useActor(createActor);
  const { isAuthenticated } = useInternetIdentity();

  return useQuery<UserRole>({
    queryKey: queryKeys.auth.role,
    queryFn: async () => {
      if (!actor) return "guest" as UserRole;
      return actor.getCallerUserRole();
    },
    enabled: !!actor && !isFetching && isAuthenticated,
    retry: false,
  });
}

/** Resolve the signed-in customer's own account record. */
export function useMyCustomer() {
  const { actor, isFetching } = useActor(createActor);
  const { isAuthenticated } = useInternetIdentity();

  return useQuery<Customer | null>({
    queryKey: queryKeys.auth.myCustomer,
    queryFn: async () => {
      if (!actor) return null;
      return actor.getMyCustomer();
    },
    enabled: !!actor && !isFetching && isAuthenticated,
    retry: false,
  });
}

export interface AuthState {
  isAuthenticated: boolean;
  isInitializing: boolean;
  isLoggingIn: boolean;
  loginError?: Error;
  role: UserRole | undefined;
  isRoleLoading: boolean;
  isRoleError: boolean;
  area: AppArea | null;
  customer: Customer | null;
  isCustomerLoading: boolean;
  login: () => void;
  logout: () => void;
}

/**
 * Single source of truth for "who is signed in and where do they belong".
 * `area` is null while the role is still resolving or when the principal is
 * signed in but not registered with the shop.
 */
export function useAuth(): AuthState {
  const {
    isAuthenticated,
    isInitializing,
    isLoggingIn,
    loginError,
    login,
    clear,
  } = useInternetIdentity();
  const roleQuery = useUserRole();
  const customerQuery = useMyCustomer();

  const role = roleQuery.data;
  const area: AppArea | null =
    role === "admin" ? "manager" : role === "user" ? "customer" : null;

  return {
    isAuthenticated,
    isInitializing,
    isLoggingIn,
    loginError,
    role,
    isRoleLoading: isAuthenticated && roleQuery.isLoading,
    isRoleError: roleQuery.isError,
    area,
    customer: customerQuery.data ?? null,
    isCustomerLoading: isAuthenticated && customerQuery.isLoading,
    login: () => login(),
    logout: () => clear(),
  };
}
