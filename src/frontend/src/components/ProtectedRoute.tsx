import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/hooks/use-auth";
import { useClaimCustomerAccount } from "@/hooks/use-backend";
import type { AppArea } from "@/types/app";
import { useInternetIdentity } from "@caffeineai/core-infrastructure";
import { useNavigate } from "@tanstack/react-router";
import { Check, Copy, Loader2, ShieldAlert } from "lucide-react";
import { type FormEvent, type ReactNode, useEffect, useState } from "react";

interface ProtectedRouteProps {
  /** The area this subtree belongs to. */
  area: AppArea;
  children: ReactNode;
}

/**
 * Self-service account claim for a signed-in principal with no linked customer.
 *
 * The customer enters the account number the manager gave them; the backend
 * binds the caller's own principal to that unclaimed account.
 */
function ClaimAccountPanel() {
  const { identity } = useInternetIdentity();
  const claim = useClaimCustomerAccount();
  const [accountId, setAccountId] = useState("");
  const [inputError, setInputError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const principalText = identity?.getPrincipal().toText() ?? "";

  async function copyPrincipal() {
    if (!principalText) return;
    try {
      await navigator.clipboard.writeText(principalText);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const trimmed = accountId.trim();
    if (!/^\d+$/.test(trimmed)) {
      setInputError("กรุณากรอกเลขที่บัญชีลูกค้าเป็นตัวเลข");
      return;
    }
    setInputError(null);
    claim.mutate(BigInt(trimmed), {
      onSuccess: (result) => {
        if (result === null) {
          setInputError("ไม่พบบัญชีนี้ หรือบัญชีนี้ถูกผูกกับผู้ใช้อื่นแล้ว กรุณาติดต่อผู้จัดการร้าน");
        }
      },
    });
  }

  return (
    <div className="space-y-4 text-left">
      <div className="space-y-1.5 rounded-md border border-border bg-muted/40 px-3 py-2.5">
        <p className="text-xs font-medium text-foreground">
          Principal ของคุณ (ส่งให้ผู้จัดการร้าน)
        </p>
        <div className="flex items-center gap-2">
          <code
            className="min-w-0 flex-1 break-all font-mono text-[0.68rem] text-muted-foreground"
            data-ocid="auth.claim_principal"
          >
            {principalText || "—"}
          </code>
          <Button
            type="button"
            variant="outline"
            size="icon"
            className="size-7 shrink-0"
            onClick={() => void copyPrincipal()}
            aria-label="คัดลอก Principal"
            data-ocid="auth.copy_principal_button"
          >
            {copied ? (
              <Check className="size-3.5" aria-hidden="true" />
            ) : (
              <Copy className="size-3.5" aria-hidden="true" />
            )}
          </Button>
        </div>
      </div>

      <form
        onSubmit={handleSubmit}
        className="space-y-3"
        data-ocid="auth.claim_form"
      >
        <div className="space-y-1.5">
          <Label htmlFor="claim-account-id">เลขที่บัญชีลูกค้า</Label>
          <Input
            id="claim-account-id"
            value={accountId}
            onChange={(event) => setAccountId(event.target.value)}
            placeholder="เช่น 1"
            inputMode="numeric"
            autoComplete="off"
            aria-invalid={inputError ? true : undefined}
            aria-describedby={inputError ? "claim-account-error" : undefined}
            data-ocid="auth.claim_account_input"
          />
          <p className="text-xs text-muted-foreground">
            ขอเลขที่บัญชีจากผู้จัดการร้าน แล้วกรอกเพื่อผูกบัญชีนี้กับคุณ
          </p>
        </div>

        {inputError ? (
          <p
            id="claim-account-error"
            className="text-xs text-destructive"
            data-ocid="auth.claim_error"
          >
            {inputError}
          </p>
        ) : null}

        {claim.isError ? (
          <p
            className="rounded-md border border-destructive/40 bg-destructive/10 px-3 py-2 text-xs text-destructive"
            data-ocid="auth.claim_request_error"
          >
            ยืนยันบัญชีไม่สำเร็จ กรุณาลองใหม่อีกครั้ง
          </p>
        ) : null}

        <Button
          type="submit"
          className="w-full gap-2"
          disabled={claim.isPending}
          data-ocid="auth.claim_button"
        >
          {claim.isPending ? (
            <Loader2 className="size-4 animate-spin" aria-hidden="true" />
          ) : null}
          ยืนยันบัญชีของฉัน
        </Button>
      </form>
    </div>
  );
}

/**
 * Gate a route subtree on the caller's role.
 *
 * - Unauthenticated callers are sent to the sign-in page.
 * - A signed-in principal whose role does not match the area is sent to their
 *   own area, or shown a registration notice when the shop has no account for
 *   them yet.
 */
export function ProtectedRoute({ area, children }: ProtectedRouteProps) {
  const {
    isAuthenticated,
    isInitializing,
    isRoleLoading,
    isRoleError,
    area: userArea,
  } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (isInitializing) return;
    if (!isAuthenticated) {
      void navigate({ to: "/login", replace: true });
      return;
    }
    if (isRoleLoading) return;
    if (userArea && userArea !== area) {
      void navigate({
        to: userArea === "manager" ? "/manager" : "/customer",
        replace: true,
      });
    }
  }, [
    isInitializing,
    isAuthenticated,
    isRoleLoading,
    userArea,
    area,
    navigate,
  ]);

  if (isInitializing || (isAuthenticated && isRoleLoading)) {
    return (
      <div
        className="flex min-h-dvh items-center justify-center bg-background"
        data-ocid="loading_state"
      >
        <div className="flex items-center gap-3 text-sm text-muted-foreground">
          <Loader2 className="size-4 animate-spin" aria-hidden="true" />
          กำลังตรวจสอบสิทธิ์การเข้าใช้งาน
        </div>
      </div>
    );
  }

  if (!isAuthenticated) return null;

  if (isRoleError || !userArea) {
    return (
      <div
        className="flex min-h-dvh items-center justify-center bg-background px-4"
        data-ocid="error_state"
      >
        <div className="w-full max-w-md space-y-4 rounded-lg border border-border bg-card p-6 text-center shadow-subtle">
          <span className="mx-auto flex size-11 items-center justify-center rounded-full bg-muted text-warning">
            <ShieldAlert className="size-5" aria-hidden="true" />
          </span>
          <div className="space-y-1">
            <h1 className="text-lg font-semibold text-foreground">
              บัญชีนี้ยังไม่ได้รับสิทธิ์
            </h1>
            <p className="text-sm text-muted-foreground">
              {area === "customer"
                ? "บัญชีที่เข้าสู่ระบบยังไม่ผูกกับบัญชีลูกค้า หากผู้จัดการร้านเปิดบัญชีให้คุณแล้ว กรอกเลขที่บัญชีเพื่อยืนยันได้เลย"
                : "บัญชีที่เข้าสู่ระบบยังไม่ผูกกับร้านค้า กรุณาติดต่อผู้จัดการร้านเพื่อเปิดบัญชีลูกค้าให้กับคุณ"}
            </p>
          </div>
          {area === "customer" ? <ClaimAccountPanel /> : null}
          <Button
            variant="outline"
            onClick={() => void navigate({ to: "/login", replace: true })}
            data-ocid="auth.back_to_login_button"
          >
            กลับไปหน้าเข้าสู่ระบบ
          </Button>
        </div>
      </div>
    );
  }

  if (userArea !== area) return null;

  return <>{children}</>;
}
