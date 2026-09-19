import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";
import { useNavigate } from "@tanstack/react-router";
import {
  AlertCircle,
  Loader2,
  ScrollText,
  ShieldCheck,
  Users,
} from "lucide-react";
import { useEffect } from "react";

const HIGHLIGHTS = [
  {
    icon: Users,
    title: "บัญชีลูกค้าโดยผู้จัดการ",
    body: "ผู้จัดการร้านเป็นผู้เปิดบัญชีให้ลูกค้าแต่ละราย ลูกค้าเข้าสู่ระบบด้วยบัญชีของตนเอง",
  },
  {
    icon: ShieldCheck,
    title: "ตรวจสอบหลักฐานการโอน",
    body: "ลูกค้าแนบหลักฐานการโอนเงิน ผู้จัดการเป็นผู้อนุมัติหรือปฏิเสธก่อนปรับยอด",
  },
  {
    icon: ScrollText,
    title: "เอกสารภาษาไทยพร้อมพิมพ์",
    body: "ใบแจ้งหนี้ ใบเสร็จ และหนังสือทวงถาม แสดงยอดเป็นบาทและพิมพ์หรือบันทึกเป็น PDF ได้",
  },
];

/** Sign-in page for both the manager and customers. */
export function LoginPage() {
  const {
    isAuthenticated,
    isInitializing,
    isLoggingIn,
    loginError,
    area,
    login,
  } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (isInitializing || !isAuthenticated || !area) return;
    void navigate({
      to: area === "manager" ? "/manager" : "/customer",
      replace: true,
    });
  }, [isInitializing, isAuthenticated, area, navigate]);

  return (
    <div className="grid min-h-dvh bg-background lg:grid-cols-[1.05fr_1fr]">
      <section className="relative hidden flex-col justify-between overflow-hidden border-r border-border bg-sidebar p-10 lg:flex">
        <div
          className="absolute inset-0 bg-gradient-subtle"
          aria-hidden="true"
        />
        <div className="relative space-y-3">
          <span className="flex size-10 items-center justify-center rounded-md bg-gradient-primary text-primary-foreground">
            <ScrollText className="size-5" aria-hidden="true" />
          </span>
          <p className="font-display text-lg font-semibold text-foreground">
            สมุดบัญชีร้าน
          </p>
          <p className="max-w-sm text-sm text-muted-foreground">
            ระบบบัญชีลูกหนี้สำหรับร้านค้าเดียว จัดการใบแจ้งหนี้ การชำระเงิน
            และยอดค้างชำระในที่เดียว
          </p>
        </div>
        <ul className="relative space-y-5">
          {HIGHLIGHTS.map((item) => {
            const Icon = item.icon;
            return (
              <li key={item.title} className="flex gap-3">
                <span className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-md border border-border bg-card text-primary">
                  <Icon className="size-4" aria-hidden="true" />
                </span>
                <div className="space-y-0.5">
                  <p className="text-sm font-medium text-foreground">
                    {item.title}
                  </p>
                  <p className="max-w-sm text-xs text-muted-foreground">
                    {item.body}
                  </p>
                </div>
              </li>
            );
          })}
        </ul>
        <p className="relative text-xs text-muted-foreground">
          ยอดเงินทั้งหมดแสดงเป็นบาท (THB) · ระบบไม่รับชำระเงินออนไลน์
        </p>
      </section>

      <section className="flex items-center justify-center px-4 py-12 sm:px-8">
        <div className="w-full max-w-sm space-y-6" data-ocid="auth.login_panel">
          <div className="space-y-2 lg:hidden">
            <span className="flex size-10 items-center justify-center rounded-md bg-gradient-primary text-primary-foreground">
              <ScrollText className="size-5" aria-hidden="true" />
            </span>
            <h1 className="font-display text-xl font-semibold text-foreground">
              สมุดบัญชีร้าน
            </h1>
          </div>

          <div className="space-y-1.5">
            <h2 className="text-2xl font-semibold tracking-tight text-foreground">
              เข้าสู่ระบบ
            </h2>
            <p className="text-sm text-muted-foreground">
              ใช้บัญชี Internet Identity ของคุณ ทั้งผู้จัดการร้านและลูกค้าเข้าสู่ระบบจากหน้านี้
            </p>
          </div>

          {loginError ? (
            <div
              className="flex items-start gap-2 rounded-md border border-destructive/40 bg-destructive/10 px-3 py-2.5 text-sm text-destructive"
              role="alert"
              data-ocid="auth.error_state"
            >
              <AlertCircle
                className="mt-0.5 size-4 shrink-0"
                aria-hidden="true"
              />
              <span>เข้าสู่ระบบไม่สำเร็จ กรุณาลองใหม่อีกครั้ง</span>
            </div>
          ) : null}

          <Button
            size="lg"
            className="w-full gap-2"
            onClick={login}
            disabled={isLoggingIn || isInitializing}
            data-ocid="auth.login_button"
          >
            {isLoggingIn || isInitializing ? (
              <Loader2 className="size-4 animate-spin" aria-hidden="true" />
            ) : null}
            {isLoggingIn ? "กำลังเข้าสู่ระบบ…" : "เข้าสู่ระบบด้วย Internet Identity"}
          </Button>

          <p className="text-center text-xs text-muted-foreground">
            ยังไม่มีบัญชีลูกค้า? ผู้จัดการร้านเป็นผู้สร้างบัญชีให้คุณ
          </p>
        </div>
      </section>
    </div>
  );
}
