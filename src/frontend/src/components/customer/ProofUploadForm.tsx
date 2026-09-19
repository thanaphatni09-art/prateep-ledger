import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Textarea } from "@/components/ui/textarea";
import { useUploadProof } from "@/hooks/use-backend";
import {
  dateToTimestamp,
  formatTHB,
  fromDateInputValue,
  parseBahtToSatang,
  toDateInputValue,
} from "@/lib/format";
import type { Invoice, InvoiceId } from "@/types/app";
import { loadConfig } from "@caffeineai/core-infrastructure";
import { StorageClient } from "@caffeineai/object-storage";
import { HttpAgent } from "@icp-sdk/core/agent";
import { AlertCircle, CheckCircle2, ImagePlus, Loader2, X } from "lucide-react";
import { type ChangeEvent, type FormEvent, useRef, useState } from "react";

interface ProofUploadFormProps {
  invoice: Invoice;
  onUploaded?: () => void;
}

const MAX_FILE_BYTES = 8 * 1024 * 1024;

function todayInputValue(): string {
  return toDateInputValue(new Date());
}

/**
 * Push the selected image to platform file storage and return its storage hash.
 *
 * `TransferProof.imageKey` must hold the `sha256:<hex>` hash string, not the
 * `ExternalBlob` object — the manager's review panel builds a gateway URL from
 * that hash. The upload runs through the platform `StorageClient` so the blob
 * tree is certified by the backend canister before the chunks are sent.
 */
async function uploadProofImage(
  file: File,
  onProgress: (percentage: number) => void,
): Promise<string> {
  const config = await loadConfig();
  if (
    !config.storage_gateway_url ||
    config.storage_gateway_url === "nogateway"
  ) {
    throw new Error("storage gateway is not configured");
  }
  const agent = HttpAgent.createSync({ host: config.backend_host });
  const client = new StorageClient(
    config.bucket_name,
    config.storage_gateway_url,
    config.backend_canister_id,
    config.project_id,
    agent,
  );
  const bytes = new Uint8Array(await file.arrayBuffer());
  const { hash } = await client.putFile(
    bytes,
    onProgress,
    file.type,
    file.name,
  );
  return hash;
}

/**
 * Upload a bank-transfer proof against one invoice.
 *
 * The image is pushed to platform file storage first (with progress feedback);
 * the returned storage hash is then recorded on the proof through `uploadProof`.
 */
export function ProofUploadForm({ invoice, onUploaded }: ProofUploadFormProps) {
  const uploadProof = useUploadProof();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [amount, setAmount] = useState(() => formatTHB(invoice.outstanding));
  const [transferredAt, setTransferredAt] = useState(todayInputValue);
  const [note, setNote] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const satang = parseBahtToSatang(amount);
  const amountInvalid = satang === null || satang <= 0n;
  const dateInvalid = fromDateInputValue(transferredAt) === null;
  const canSubmit =
    !isUploading && !amountInvalid && !dateInvalid && file !== null;

  function handleFileChange(event: ChangeEvent<HTMLInputElement>) {
    const selected = event.target.files?.[0] ?? null;
    setError(null);
    setSuccess(false);
    if (!selected) {
      setFile(null);
      setPreviewUrl(null);
      return;
    }
    if (!selected.type.startsWith("image/")) {
      setError("กรุณาเลือกไฟล์รูปภาพ (JPG, PNG หรือ WEBP)");
      setFile(null);
      setPreviewUrl(null);
      return;
    }
    if (selected.size > MAX_FILE_BYTES) {
      setError("ไฟล์รูปภาพต้องมีขนาดไม่เกิน 8 MB");
      setFile(null);
      setPreviewUrl(null);
      return;
    }
    setFile(selected);
    setPreviewUrl(URL.createObjectURL(selected));
  }

  function clearFile() {
    setFile(null);
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPreviewUrl(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!canSubmit || !file || satang === null) return;
    const transferredDate = fromDateInputValue(transferredAt);
    if (!transferredDate) return;

    setError(null);
    setSuccess(false);
    setIsUploading(true);
    setProgress(0);

    try {
      const imageKey = await uploadProofImage(file, (percentage) =>
        setProgress(percentage),
      );

      await uploadProof.mutateAsync({
        invoiceId: invoice.id as InvoiceId,
        amount: satang,
        transferredAt: dateToTimestamp(transferredDate),
        imageKey,
        note: note.trim(),
      });

      setSuccess(true);
      setNote("");
      clearFile();
      setProgress(0);
      onUploaded?.();
    } catch {
      setError("อัปโหลดหลักฐานไม่สำเร็จ กรุณาลองใหม่อีกครั้ง");
    } finally {
      setIsUploading(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-5"
      data-ocid="customer.proof_upload_form"
    >
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="proof-amount">จำนวนเงินที่โอน (บาท)</Label>
          <Input
            id="proof-amount"
            inputMode="decimal"
            value={amount}
            onChange={(event) => setAmount(event.target.value)}
            aria-invalid={amountInvalid}
            className="ledger-figure"
            data-ocid="customer.proof_amount_input"
          />
          {amountInvalid ? (
            <p className="text-xs text-destructive" data-ocid="error_state">
              กรุณากรอกจำนวนเงินให้ถูกต้อง
            </p>
          ) : (
            <p className="text-xs text-muted-foreground">
              ยอดคงค้างของใบแจ้งหนี้ {formatTHB(invoice.outstanding)}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="proof-date">วันที่โอน</Label>
          <Input
            id="proof-date"
            type="date"
            value={transferredAt}
            onChange={(event) => setTransferredAt(event.target.value)}
            aria-invalid={dateInvalid}
            data-ocid="customer.proof_date_input"
          />
          {dateInvalid ? (
            <p className="text-xs text-destructive" data-ocid="error_state">
              กรุณาเลือกวันที่โอน
            </p>
          ) : null}
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="proof-image">หลักฐานการโอน (รูปภาพ)</Label>
        <input
          ref={fileInputRef}
          id="proof-image"
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          className="sr-only"
          data-ocid="customer.proof_file_input"
        />
        {file && previewUrl ? (
          <div className="flex items-center gap-3 rounded-md border border-border bg-muted/40 p-3">
            <img
              src={previewUrl}
              alt="ตัวอย่างหลักฐานการโอน"
              className="size-16 shrink-0 rounded-md border border-border object-cover"
            />
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-foreground">
                {file.name}
              </p>
              <p className="ledger-figure text-xs text-muted-foreground">
                {(file.size / 1024).toFixed(0)} KB
              </p>
            </div>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={clearFile}
              aria-label="ลบไฟล์ที่เลือก"
              data-ocid="customer.proof_remove_button"
            >
              <X className="size-4" aria-hidden="true" />
            </Button>
          </div>
        ) : (
          <Button
            type="button"
            variant="outline"
            className="w-full gap-2 border-dashed"
            onClick={() => fileInputRef.current?.click()}
            data-ocid="customer.proof_upload_button"
          >
            <ImagePlus className="size-4" aria-hidden="true" />
            เลือกรูปภาพหลักฐานการโอน
          </Button>
        )}
        <p className="text-xs text-muted-foreground">
          รองรับไฟล์ JPG, PNG หรือ WEBP ขนาดไม่เกิน 8 MB
        </p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="proof-note">หมายเหตุ (ไม่บังคับ)</Label>
        <Textarea
          id="proof-note"
          value={note}
          onChange={(event) => setNote(event.target.value)}
          placeholder="เช่น โอนจากบัญชีธนาคารกสิกรไทย เวลา 14:30 น."
          rows={3}
          data-ocid="customer.proof_note_input"
        />
      </div>

      {isUploading ? (
        <div className="space-y-2" data-ocid="customer.proof_upload_progress">
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>กำลังอัปโหลดหลักฐาน…</span>
            <span className="ledger-figure">{progress}%</span>
          </div>
          <Progress value={progress} />
        </div>
      ) : null}

      {error ? (
        <div
          className="flex items-start gap-2 rounded-md border border-destructive/40 bg-destructive/10 px-3 py-2.5 text-sm text-destructive"
          role="alert"
          data-ocid="error_state"
        >
          <AlertCircle className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
          <span>{error}</span>
        </div>
      ) : null}

      {success ? (
        <div
          className="flex items-start gap-2 rounded-md border border-success/40 bg-success/10 px-3 py-2.5 text-sm text-success"
          data-ocid="success_state"
        >
          <CheckCircle2 className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
          <span>ส่งหลักฐานเรียบร้อยแล้ว ผู้จัดการร้านจะตรวจสอบและแจ้งผลให้ทราบ</span>
        </div>
      ) : null}

      <Button
        type="submit"
        disabled={!canSubmit}
        className="w-full gap-2 sm:w-auto"
        data-ocid="customer.proof_submit_button"
      >
        {isUploading ? (
          <Loader2 className="size-4 animate-spin" aria-hidden="true" />
        ) : null}
        {isUploading ? "กำลังส่งหลักฐาน…" : "ส่งหลักฐานการโอน"}
      </Button>
    </form>
  );
}
