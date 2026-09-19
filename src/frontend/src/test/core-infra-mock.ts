import type { MockBackend } from "@/test/mock-backend";
import { vi } from "vitest";

/**
 * Mutable stand-in for `@caffeineai/core-infrastructure`.
 *
 * Test files mock the real module with this object:
 *
 * ```ts
 * vi.mock("@caffeineai/core-infrastructure", async () => {
 *   const { coreInfraMock } = await import("@/test/core-infra-mock");
 *   return coreInfraMock;
 * });
 * ```
 *
 * `useActor` then returns whatever actor `setActor` last installed, and
 * `useInternetIdentity` returns the auth state `setIdentity` describes. This is
 * the seam that lets a component test drive the app without a real canister or
 * an Internet Identity popup.
 */

export interface MockIdentity {
  isAuthenticated: boolean;
  isInitializing: boolean;
  isLoggingIn: boolean;
  loginError?: Error;
  principalText?: string;
}

const DEFAULT_IDENTITY: MockIdentity = {
  isAuthenticated: false,
  isInitializing: false,
  isLoggingIn: false,
};

let currentActor: MockBackend | null = null;
let currentIdentity: MockIdentity = { ...DEFAULT_IDENTITY };

export const loginSpy = vi.fn();
export const clearSpy = vi.fn();

export function setActor(actor: MockBackend | null): void {
  currentActor = actor;
}

export function setIdentity(identity: Partial<MockIdentity>): void {
  currentIdentity = { ...DEFAULT_IDENTITY, ...identity };
}

export function resetCoreInfraMock(): void {
  currentActor = null;
  currentIdentity = { ...DEFAULT_IDENTITY };
  loginSpy.mockClear();
  clearSpy.mockClear();
}

function buildIdentityContext() {
  const principalText = currentIdentity.principalText ?? "aaaaa-aa";
  return {
    identity: currentIdentity.isAuthenticated
      ? {
          getPrincipal: () => ({ toText: () => principalText }),
        }
      : undefined,
    login: loginSpy,
    clear: clearSpy,
    loginStatus: currentIdentity.isLoggingIn
      ? "logging-in"
      : currentIdentity.isAuthenticated
        ? "success"
        : "idle",
    isInitializing: currentIdentity.isInitializing,
    isLoginIdle: !currentIdentity.isLoggingIn,
    isLoggingIn: currentIdentity.isLoggingIn,
    isLoginSuccess: currentIdentity.isAuthenticated,
    isLoginError: Boolean(currentIdentity.loginError),
    isAuthenticated: currentIdentity.isAuthenticated,
    loginError: currentIdentity.loginError,
  };
}

export const coreInfraMock = {
  useActor: () => ({ actor: currentActor, isFetching: false }),
  useInternetIdentity: () => buildIdentityContext(),
  InternetIdentityProvider: ({ children }: { children: unknown }) => children,
  loadConfig: vi.fn(async () => ({
    storage_gateway_url: "nogateway",
    backend_canister_id: "aaaaa-aa",
    project_id: "test-project",
  })),
  createActorWithConfig: vi.fn(),
  loadMockBackendFromModules: vi.fn(),
};
