import { cn } from "@/lib/utils";
import type { AppArea } from "@/types/app";
import { Link, useRouterState } from "@tanstack/react-router";
import {
  BadgeCheck,
  Bell,
  FileText,
  LayoutDashboard,
  Package,
  Receipt,
  ScrollText,
  Settings,
  ShieldCheck,
  Upload,
  Users,
  Wallet,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

interface NavEntry {
  label: string;
  to: string;
  icon: LucideIcon;
  badge?: number;
}

const MANAGER_NAV: NavEntry[] = [
  { label: "ภาพรวม", to: "/manager", icon: LayoutDashboard },
  { label: "ลูกค้า", to: "/manager/customers", icon: Users },
  { label: "สินค้า", to: "/manager/products", icon: Package },
  { label: "ใบแจ้งหนี้", to: "/manager/invoices", icon: FileText },
  { label: "การชำระเงิน", to: "/manager/payments", icon: Wallet },
  { label: "หลักฐานโอนเงิน", to: "/manager/proofs", icon: BadgeCheck },
  { label: "ลูกหนี้คงค้าง", to: "/manager/debts", icon: ScrollText },
  { label: "การแจ้งเตือน", to: "/manager/notifications", icon: Bell },
  { label: "ตั้งค่าร้าน", to: "/manager/settings", icon: Settings },
];

const CUSTOMER_NAV: NavEntry[] = [
  { label: "ภาพรวม", to: "/customer", icon: LayoutDashboard },
  { label: "ใบแจ้งหนี้ของฉัน", to: "/customer/invoices", icon: FileText },
  { label: "แจ้งชำระเงิน", to: "/customer/proofs", icon: Upload },
  { label: "ใบเสร็จของฉัน", to: "/customer/receipts", icon: Receipt },
  { label: "ยอดค้างชำระ", to: "/customer/debt", icon: ScrollText },
  { label: "การแจ้งเตือน", to: "/customer/notifications", icon: Bell },
];

interface AppSidebarProps {
  area: AppArea;
  unreadCount?: number;
  onNavigate?: () => void;
  className?: string;
}

/** Fixed ledger sidebar. Jade marks the active entry; brass marks unread work. */
export function AppSidebar({
  area,
  unreadCount = 0,
  onNavigate,
  className,
}: AppSidebarProps) {
  const pathname = useRouterState({
    select: (state) => state.location.pathname,
  });
  const entries = area === "manager" ? MANAGER_NAV : CUSTOMER_NAV;

  return (
    <nav
      aria-label={area === "manager" ? "เมนูผู้จัดการ" : "เมนูลูกค้า"}
      className={cn(
        "flex h-full flex-col gap-1 overflow-y-auto p-3",
        className,
      )}
      data-ocid="nav.sidebar"
    >
      <p className="px-3 pb-2 pt-1 text-[0.68rem] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
        {area === "manager" ? "มุมผู้จัดการ" : "มุมลูกค้า"}
      </p>
      {entries.map((entry) => {
        const isActive =
          entry.to === pathname ||
          (entry.to !== "/manager" &&
            entry.to !== "/customer" &&
            pathname.startsWith(`${entry.to}/`));
        const Icon = entry.icon;
        const showBadge =
          entry.to.endsWith("/notifications") && unreadCount > 0;
        return (
          <Link
            key={entry.to}
            to={entry.to}
            onClick={onNavigate}
            aria-current={isActive ? "page" : undefined}
            className={cn(
              "group flex min-h-11 items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-smooth",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-sidebar",
              isActive
                ? "bg-sidebar-primary text-sidebar-primary-foreground shadow-subtle"
                : "text-sidebar-foreground/80 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
            )}
            data-ocid={`nav.link.${entry.to.replace(/\//g, "-").replace(/^-/, "")}`}
          >
            <Icon className="size-4 shrink-0" aria-hidden="true" />
            <span className="min-w-0 flex-1 truncate">{entry.label}</span>
            {showBadge ? (
              <span
                className="ledger-figure inline-flex min-w-5 items-center justify-center rounded-full bg-accent px-1.5 text-[0.68rem] font-semibold text-accent-foreground"
                data-ocid="nav.unread_badge"
              >
                {unreadCount > 99 ? "99+" : unreadCount}
              </span>
            ) : null}
          </Link>
        );
      })}
      <div className="mt-auto flex items-center gap-2 px-3 pt-4 text-[0.68rem] text-muted-foreground">
        <ShieldCheck className="size-3.5 shrink-0" aria-hidden="true" />
        <span>ระบบบัญชีร้านค้า</span>
      </div>
    </nav>
  );
}
