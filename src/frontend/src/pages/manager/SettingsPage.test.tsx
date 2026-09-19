import { SettingsPage } from "@/pages/manager/SettingsPage";
import {
  resetCoreInfraMock,
  setActor,
  setIdentity,
} from "@/test/core-infra-mock";
import { createMockBackend } from "@/test/mock-backend";
import { renderWithProviders } from "@/test/render";
import type { ShopSettings } from "@/types/app";
import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@caffeineai/core-infrastructure", async () => {
  const { coreInfraMock } = await import("@/test/core-infra-mock");
  return coreInfraMock;
});

const SETTINGS: ShopSettings = {
  shopName: "ร้านกาแฟดอย",
  address: "123 ถนนนิมมาน เชียงใหม่",
  taxId: "0-0000-00000-00-0",
  phone: "02-123-4567",
  bankName: "ธนาคารกสิกรไทย",
  accountName: "ร้านกาแฟดอย",
  accountNumber: "000-0-00000-0",
  promptPayRef: "0812345678",
  invoicePrefix: "INV",
  receiptPrefix: "REC",
  defaultPaymentTermsDays: 30n,
};

beforeEach(() => {
  resetCoreInfraMock();
  setIdentity({ isAuthenticated: true });
});

describe("SettingsPage", () => {
  it("loads the shop profile, bank details, and numbering prefixes", async () => {
    setActor(
      createMockBackend({
        getCallerUserRole: vi.fn(async () => "admin"),
        getSettings: vi.fn(async () => SETTINGS),
      }),
    );

    renderWithProviders(<SettingsPage />);

    expect(await screen.findByLabelText("ชื่อร้านค้า")).toHaveValue("ร้านกาแฟดอย");
    expect(screen.getByLabelText("ธนาคาร")).toHaveValue("ธนาคารกสิกรไทย");
    expect(screen.getByLabelText("คำนำหน้าเลขใบแจ้งหนี้")).toHaveValue("INV");
    expect(screen.getByLabelText("คำนำหน้าเลขใบเสร็จ")).toHaveValue("REC");
    expect(screen.getByLabelText("เครดิตเริ่มต้น (วัน)")).toHaveValue("30");
  });

  it("saves the edited shop profile and bank details", async () => {
    const user = userEvent.setup();
    const updateSettings = vi.fn(async () => SETTINGS);
    setActor(
      createMockBackend({
        getCallerUserRole: vi.fn(async () => "admin"),
        getSettings: vi.fn(async () => SETTINGS),
        updateSettings,
      }),
    );

    renderWithProviders(<SettingsPage />);

    const shopName = await screen.findByLabelText("ชื่อร้านค้า");
    await user.clear(shopName);
    await user.type(shopName, "ร้านกาแฟดอยสาขาใหม่");

    const bankName = screen.getByLabelText("ธนาคาร");
    await user.clear(bankName);
    await user.type(bankName, "ธนาคารไทยพาณิชย์");

    await user.click(screen.getByTestId("settings.submit_button"));

    await waitFor(() => {
      expect(updateSettings).toHaveBeenCalledTimes(1);
    });
    expect(updateSettings).toHaveBeenCalledWith(
      expect.objectContaining({
        shopName: "ร้านกาแฟดอยสาขาใหม่",
        bankName: "ธนาคารไทยพาณิชย์",
        invoicePrefix: "INV",
        receiptPrefix: "REC",
        defaultPaymentTermsDays: 30n,
      }),
    );
  });

  it("shows a success message after the settings are saved", async () => {
    const user = userEvent.setup();
    setActor(
      createMockBackend({
        getCallerUserRole: vi.fn(async () => "admin"),
        getSettings: vi.fn(async () => SETTINGS),
        updateSettings: vi.fn(async () => SETTINGS),
      }),
    );

    renderWithProviders(<SettingsPage />);
    await screen.findByLabelText("ชื่อร้านค้า");

    await user.click(screen.getByTestId("settings.submit_button"));

    expect(
      await screen.findByText("บันทึกการตั้งค่าเรียบร้อยแล้ว"),
    ).toBeInTheDocument();
  });

  it("rejects a negative credit term before submitting", async () => {
    const user = userEvent.setup();
    const updateSettings = vi.fn();
    setActor(
      createMockBackend({
        getCallerUserRole: vi.fn(async () => "admin"),
        getSettings: vi.fn(async () => SETTINGS),
        updateSettings,
      }),
    );

    renderWithProviders(<SettingsPage />);
    await screen.findByLabelText("ชื่อร้านค้า");

    const terms = screen.getByLabelText("เครดิตเริ่มต้น (วัน)");
    await user.clear(terms);
    await user.type(terms, "-5");
    await user.click(screen.getByTestId("settings.submit_button"));

    expect(
      await screen.findByText("กรุณาระบุจำนวนวันเครดิตเป็นตัวเลขตั้งแต่ 0 ขึ้นไป"),
    ).toBeInTheDocument();
    expect(updateSettings).not.toHaveBeenCalled();
  });
});
