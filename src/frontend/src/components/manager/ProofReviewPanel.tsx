import { StatusBadge } from "@/components/StatusBadge";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { formatTHB, formatThaiDateTime } from "@/lib/format";
import { ProofStatus, type TransferProof } from "@/types/app";
import { loadConfig } from "@caffeineai/core-infrastructure";
import { Check, ExternalLink, ImageOff, Loader2, X } from "lucide-react";
import { useEffect, useState } from "react";

/**
 * Resolve a stored blob hash into a gateway URL the browser can load.
 * Returns null while the config is loading or when no gateway is configured.
 */
function useProofImageUrl(imageKey: string): string | null {
  const [url, setUrl] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    if (!imageKey) {
      setUrl(null);
      return;
    }
    void loadConfig()
      .then((config) => {
        if (cancelled) return;
        if (
          !config.storage_gateway_url ||
          config.storage_gateway_url === "nogateway"
        ) {
          setUrl(null);
          return;
        }
        const base = config.storage_gateway_url.replace(/\/$/, "");
        setUrl(
          `${base}/v1/blob/?blob_hash=${encodeURIComponent(imageKey)}&owner_id=${encodeURIComponent(config.backend_canister_id)}&project_id=${encodeURIComponent(config.project_id)}`,
        );
      })
      .catch(() => {
        if (!cancelled) setUrl(null);
      });
    return () => {
      cancelled = true;
    };
  }, [imageKey]);

  return url;
}

interface ProofReviewPanelProps {
  proof: TransferProof;
  onApprove: () => void;
  onReject: (note: string) => void;
  isApproving: boolean;
  isRejecting: boolean;
  errorMessage?: string;
}

/**
 * Right-hand review panel: the uploaded slip beside the customer-supplied
 * amount, with approve/reject actions. Rejecting requires a reason.
 */
export function ProofReviewPanel({
  proof,
  onApprove,
  onReject,
  isApproving,
  isRejecting,
  errorMessage,
}: ProofReviewPanelProps) {
  const [rejectNote, setRejectNote] = useState("");
  const [showReject, setShowReject] = useState(false);
  const imageUrl = useProofImageUrl(proof.imageKey);
  const isPending = isApproving || isRejecting;
  const isDecided = proof.status !== ProofStatus.pending;

  return (
    <aside
      className="space-y-4 rounded-lg border border-border bg-card p-4 shadow-subtle"
      data-ocid="proof.review_panel"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 space-y-0.5">
          <h2 className="truncate text-sm font-semibold text-foreground">
            {proof.customerName}
          </h2>
          <p className="ledger-figure truncate text-xs text-muted-foreground">
            ใบแจ้งหนี้ {proof.invoiceNumber}
          </p>
        </div>
        <StatusBadge status={proof.status} />
      </div>

      <div className="overflow-hidden rounded-md border border-border bg-muted/40">
        {imageUrl ? (
          <a
            href={imageUrl}
            target="_blank"
            rel="noreferrer"
            className="group block focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            data-ocid="proof.image_link"
          >
            <img
              src={imageUrl}
              alt={`หลักฐานการโอนเงินของ ${proof.customerName}`}
              className="max-h-80 w-full object-contain transition-smooth group-hover:opacity-90"
              loading="lazy"
            />
            <span className="flex items-center justify-center gap-1.5 border-t border-border bg-card px-3 py-2 text-xs text-muted-foreground">
              <ExternalLink className="size-3.5" aria-hidden="true" />
              เปิดรูปขนาดเต็มในแท็บใหม่
            </span>
          </a>
        ) : (
          <div
            className="flex flex-col items-center justify-center gap-2 px-4 py-12 text-center"
            data-ocid="proof.image_empty_state"
          >
            <ImageOff
              className="size-5 text-muted-foreground"
              aria-hidden="true"
            />
            <p className="text-xs text-muted-foreground">
              ไม่พบไฟล์หลักฐานการโอนสำหรับรายการนี้
            </p>
          </div>
        )}
      </div>

      <dl className="space-y-2 text-sm">
        <div className="flex items-center justify-between gap-3">
          <dt className="text-muted-foreground">ยอดที่ลูกค้าแจ้งโอน</dt>
          <dd
            className="ledger-figure font-semibold text-foreground"
            data-ocid="proof.amount"
          >
            {formatTHB(proof.amount)}
          </dd>
        </div>
        <div className="flex items-center justify-between gap-3">
          <dt className="text-muted-foreground">วันที่โอน</dt>
          <dd className="text-foreground">
            {formatThaiDateTime(proof.transferredAt)}
          </dd>
        </div>
        <div className="flex items-center justify-between gap-3">
          <dt className="text-muted-foreground">อัปโหลดเมื่อ</dt>
          <dd className="text-foreground">
            {formatThaiDateTime(proof.uploadedAt)}
          </dd>
        </div>
      </dl>

      {proof.note ? (
        <div className="space-y-1 rounded-md border border-border bg-muted/40 px-3 py-2">
          <p className="text-xs font-medium text-muted-foreground">
            บันทึกจากลูกค้า
          </p>
          <p className="text-sm text-foreground">{proof.note}</p>
        </div>
      ) : null}

      {isDecided ? (
        <div className="space-y-1 rounded-md border border-border bg-muted/40 px-3 py-2">
          <p className="text-xs font-medium text-muted-foreground">
            ผลการตรวจสอบ
          </p>
          <p className="text-sm text-foreground">
            {proof.status === ProofStatus.approved
              ? "อนุมัติแล้ว — ยอดชำระถูกบันทึกเข้าระบบ"
              : "ปฏิเสธแล้ว — ยอดคงค้างไม่เปลี่ยนแปลง"}
          </p>
          {proof.reviewNote ? (
            <p className="text-xs text-muted-foreground">{proof.reviewNote}</p>
          ) : null}
          {proof.reviewedAt ? (
            <p className="text-xs text-muted-foreground">
              ตรวจสอบเมื่อ {formatThaiDateTime(proof.reviewedAt)}
            </p>
          ) : null}
        </div>
      ) : null}

      {errorMessage ? (
        <p
          className="rounded-md border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive"
          data-ocid="proof.review_error"
        >
          {errorMessage}
        </p>
      ) : null}

      {!isDecided ? (
        <>
          <Separator />
          {showReject ? (
            <div className="space-y-3">
              <div className="space-y-1.5">
                <Label htmlFor="proof-reject-note">
                  เหตุผลที่ปฏิเสธ (ลูกค้าจะเห็นข้อความนี้)
                </Label>
                <Textarea
                  id="proof-reject-note"
                  value={rejectNote}
                  onChange={(event) => setRejectNote(event.target.value)}
                  placeholder="เช่น ยอดโอนไม่ตรงกับใบแจ้งหนี้"
                  rows={2}
                  data-ocid="proof.reject_note_textarea"
                />
              </div>
              <div className="flex flex-wrap justify-end gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setShowReject(false);
                    setRejectNote("");
                  }}
                  data-ocid="proof.cancel_reject_button"
                >
                  ยกเลิก
                </Button>
                <Button
                  type="button"
                  variant="destructive"
                  onClick={() => onReject(rejectNote.trim())}
                  disabled={isPending || rejectNote.trim() === ""}
                  data-ocid="proof.confirm_reject_button"
                >
                  {isRejecting ? (
                    <Loader2
                      className="size-4 animate-spin"
                      aria-hidden="true"
                    />
                  ) : (
                    <X className="size-4" aria-hidden="true" />
                  )}
                  ยืนยันการปฏิเสธ
                </Button>
              </div>
            </div>
          ) : (
            <div className="flex flex-wrap gap-2">
              <Button
                type="button"
                onClick={onApprove}
                disabled={isPending}
                className="flex-1 gap-1.5"
                data-ocid="proof.approve_button"
              >
                {isApproving ? (
                  <Loader2 className="size-4 animate-spin" aria-hidden="true" />
                ) : (
                  <Check className="size-4" aria-hidden="true" />
                )}
                อนุมัติหลักฐาน
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowReject(true)}
                disabled={isPending}
                className="flex-1 gap-1.5"
                data-ocid="proof.reject_button"
              >
                <X className="size-4" aria-hidden="true" />
                ปฏิเสธ
              </Button>
            </div>
          )}
        </>
      ) : null}
    </aside>
  );
}
