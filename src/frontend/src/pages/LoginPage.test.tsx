import { LoginPage } from "@/pages/LoginPage";
import {
  loginSpy,
  resetCoreInfraMock,
  setActor,
  setIdentity,
} from "@/test/core-infra-mock";
import { createMockBackend } from "@/test/mock-backend";
import { renderWithProviders } from "@/test/render";
import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@caffeineai/core-infrastructure", async () => {
  const { coreInfraMock } = await import("@/test/core-infra-mock");
  return coreInfraMock;
});

beforeEach(() => {
  resetCoreInfraMock();
});

describe("LoginPage", () => {
  it("renders the sign-in page for both roles without a blank screen", async () => {
    setIdentity({ isAuthenticated: false });
    setActor(createMockBackend());

    renderWithProviders(<LoginPage />);

    expect(
      await screen.findByRole("button", {
        name: "เข้าสู่ระบบด้วย Internet Identity",
      }),
    ).toBeInTheDocument();
    expect(screen.getByText("เข้าสู่ระบบ")).toBeInTheDocument();
  });

  it("starts the Internet Identity login when the button is pressed", async () => {
    const user = userEvent.setup();
    setIdentity({ isAuthenticated: false });
    setActor(createMockBackend());

    renderWithProviders(<LoginPage />);
    await user.click(
      await screen.findByRole("button", {
        name: "เข้าสู่ระบบด้วย Internet Identity",
      }),
    );

    expect(loginSpy).toHaveBeenCalledTimes(1);
  });

  it("routes a signed-in manager to the manager area", async () => {
    setIdentity({ isAuthenticated: true });
    setActor(
      createMockBackend({ getCallerUserRole: vi.fn(async () => "admin") }),
    );

    const { router } = renderWithProviders(<LoginPage />);

    await waitFor(() => {
      expect(router.state.location.pathname).toBe("/manager");
    });
  });

  it("routes a signed-in customer to the customer area", async () => {
    setIdentity({ isAuthenticated: true });
    setActor(
      createMockBackend({ getCallerUserRole: vi.fn(async () => "user") }),
    );

    const { router } = renderWithProviders(<LoginPage />);

    await waitFor(() => {
      expect(router.state.location.pathname).toBe("/customer");
    });
  });

  it("shows a sign-in error message when login fails", async () => {
    setIdentity({
      isAuthenticated: false,
      loginError: new Error("popup closed"),
    });
    setActor(createMockBackend());

    renderWithProviders(<LoginPage />);

    expect(await screen.findByRole("alert")).toHaveTextContent(
      "เข้าสู่ระบบไม่สำเร็จ กรุณาลองใหม่อีกครั้ง",
    );
  });
});
