import { AppSidebar } from "@/components/AppSidebar";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { useAuth } from "@/hooks/use-auth";
import {
  useManagerUnreadCount,
  useMyUnreadCount,
} from "@/hooks/use-notifications";
import { cn } from "@/lib/utils";
import type { AppArea } from "@/types/app";
import { Link } from "@tanstack/react-router";
import { LogOut, Menu, ScrollText } from "lucide-react";
import { type ReactNode, useState } from "react";

interface LayoutProps {
  area: AppArea;
  children: ReactNode;
}

function useUnreadCount(area: AppArea): number {
  const manager = useManagerUnreadCount();
  const customer = useMyUnreadCount();
  const value = area === "manager" ? manager.data : customer.data;
  return value === undefined ? 0 : Number(value);
}

/** Shared shell: fixed sidebar on desktop, sheet navigation on mobile. */
export function Layout({ area, children }: LayoutProps) {
  const { logout, customer } = useAuth();
  const unreadCount = useUnreadCount(area);
  const [mobileOpen, setMobileOpen] = useState(false);

  const areaLabel = area === "manager" ? "มุมผู้จัดการ" : "มุมลูกค้า";
  const identityLabel =
    area === "manager" ? "ผู้จัดการร้าน" : (customer?.name ?? "บัญชีลูกค้า");

  return (
    <div className="min-h-dvh bg-background">
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 border-r border-sidebar-border bg-sidebar lg:flex lg:flex-col">
        <Link
          to={area === "manager" ? "/manager" : "/customer"}
          className="flex items-center gap-2.5 border-b border-sidebar-border px-5 py-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          data-ocid="nav.brand_link"
        >
          <span className="flex size-8 items-center justify-center rounded-md bg-gradient-primary text-primary-foreground">
            <ScrollText className="size-4" aria-hidden="true" />
          </span>
          <span className="min-w-0">
            <span className="block truncate font-display text-sm font-semibold text-sidebar-foreground">
              สมุดบัญชีร้าน
            </span>
            <span className="block truncate text-[0.68rem] text-muted-foreground">
              {areaLabel}
            </span>
          </span>
        </Link>
        <AppSidebar area={area} unreadCount={unreadCount} className="flex-1" />
      </aside>

      <div className="lg:pl-64">
        <header className="sticky top-0 z-20 flex h-14 items-center gap-3 border-b border-border bg-card px-4 shadow-subtle sm:px-6">
          <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
            <SheetTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="lg:hidden"
                aria-label="เปิดเมนูนำทาง"
                data-ocid="nav.open_modal_button"
              >
                <Menu className="size-5" aria-hidden="true" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-72 bg-sidebar p-0">
              <SheetTitle className="border-b border-sidebar-border px-5 py-4 text-left font-display text-sm font-semibold">
                สมุดบัญชีร้าน · {areaLabel}
              </SheetTitle>
              <AppSidebar
                area={area}
                unreadCount={unreadCount}
                onNavigate={() => setMobileOpen(false)}
              />
            </SheetContent>
          </Sheet>

          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium text-foreground">
              {identityLabel}
            </p>
            <p className="truncate text-[0.68rem] text-muted-foreground">
              {areaLabel}
            </p>
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={logout}
            className="gap-2"
            data-ocid="auth.logout_button"
          >
            <LogOut className="size-4" aria-hidden="true" />
            <span className="hidden sm:inline">ออกจากระบบ</span>
          </Button>
        </header>

        <main
          className={cn("mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 sm:py-8")}
        >
          {children}
        </main>

        <footer className="border-t border-border bg-card px-4 py-4 sm:px-6">
          <p className="text-center text-xs text-muted-foreground">
            © {new Date().getFullYear()}. Built with love using{" "}
            <a
              href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname)}`}
              target="_blank"
              rel="noreferrer"
              className="underline underline-offset-2 transition-smooth hover:text-foreground"
            >
              caffeine.ai
            </a>
          </p>
        </footer>
      </div>
    </div>
  );
}
