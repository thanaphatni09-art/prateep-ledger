import { ProtectedRoute } from "@/components/ProtectedRoute";
import {
  resetCoreInfraMock,
  setActor,
  setIdentity,
} from "@/test/core-infra-mock";
import { createMockBackend } from "@/test/mock-backend";
import { renderWithProviders } from "@/test/render";
import { screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@caffeineai/core-infrastructure", async () => {
  const { coreInfraMock } = await import("@/test/core-infra-mock");
  return coreInfraMock;
});

beforeEach(() => {
  resetCoreInfraMock();
});

describe("ProtectedRoute", () => {
  it("redirects an unauthenticated caller to the login page", async () => {
    setIdentity({ isAuthenticated: false });
    setActor(createMockBackend());

    const { router } = renderWithProviders(
      <ProtectedRoute area="manager">
        <p>manager content</p>
      </ProtectedRoute>,
    );

    await waitFor(() => {
      expect(router.state.location.pathname).toBe("/login");
    });
    expect(screen.queryByText("manager content")).not.toBeInTheDocument();
  });

  it("renders children for a manager on the manager area", async () => {
    setIdentity({ isAuthenticated: true });
    setActor(
      createMockBackend({ getCallerUserRole: vi.fn(async () => "admin") }),
    );

    renderWithProviders(
      <ProtectedRoute area="manager">
        <p>manager content</p>
      </ProtectedRoute>,
    );

    expect(await screen.findByText("manager content")).toBeInTheDocument();
  });

  it("redirects a manager away from the customer area", async () => {
    setIdentity({ isAuthenticated: true });
    setActor(
      createMockBackend({ getCallerUserRole: vi.fn(async () => "admin") }),
    );

    const { router } = renderWithProviders(
      <ProtectedRoute area="customer">
        <p>customer content</p>
      </ProtectedRoute>,
    );

    await waitFor(() => {
      expect(router.state.location.pathname).toBe("/manager");
    });
    expect(screen.queryByText("customer content")).not.toBeInTheDocument();
  });

  it("redirects a customer away from the manager area", async () => {
    setIdentity({ isAuthenticated: true });
    setActor(
      createMockBackend({ getCallerUserRole: vi.fn(async () => "user") }),
    );

    const { router } = renderWithProviders(
      <ProtectedRoute area="manager">
        <p>manager content</p>
      </ProtectedRoute>,
    );

    await waitFor(() => {
      expect(router.state.location.pathname).toBe("/customer");
    });
    expect(screen.queryByText("manager content")).not.toBeInTheDocument();
  });

  it("shows the claim-account panel to a signed-in principal with no role on the customer area", async () => {
    setIdentity({ isAuthenticated: true, principalText: "abcd-efgh" });
    setActor(
      createMockBackend({ getCallerUserRole: vi.fn(async () => "guest") }),
    );

    renderWithProviders(
      <ProtectedRoute area="customer">
        <p>customer content</p>
      </ProtectedRoute>,
    );

    expect(await screen.findByText("บัญชีนี้ยังไม่ได้รับสิทธิ์")).toBeInTheDocument();
    expect(screen.getByText("abcd-efgh")).toBeInTheDocument();
    expect(screen.queryByText("customer content")).not.toBeInTheDocument();
  });

  it("does not offer the claim panel to an unregistered manager-area caller", async () => {
    setIdentity({ isAuthenticated: true });
    setActor(
      createMockBackend({ getCallerUserRole: vi.fn(async () => "guest") }),
    );

    renderWithProviders(
      <ProtectedRoute area="manager">
        <p>manager content</p>
      </ProtectedRoute>,
    );

    expect(await screen.findByText("บัญชีนี้ยังไม่ได้รับสิทธิ์")).toBeInTheDocument();
    expect(screen.queryByText("ยืนยันบัญชีของฉัน")).not.toBeInTheDocument();
  });
});
