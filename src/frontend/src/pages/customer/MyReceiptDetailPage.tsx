import { EmptyState } from "@/components/EmptyState";
import { Layout } from "@/components/Layout";
import { LoadingState } from "@/components/LoadingState";
import { PageHeader } from "@/components/PageHeader";
import { ReceiptDocument } from "@/components/documents/ReceiptDocument";
import { Button } from "@/components/ui/button";
import { useMyReceipt, useReceiptDocument } from "@/hooks/use-backend";
import { formatThaiDateLong } from "@/lib/format";
import { Link, useParams } from "@tanstack/react-router";
import { ArrowLeft, Printer, Receipt } from "lucide-react";

/** One receipt rendered as a printable Thai document. */
export function MyReceiptDetailPage() {
  const { receiptId } = useParams({ from: "/customer/receipts/$receiptId" });
  const parsedId = /^\d+$/.test(receiptId) ? BigInt(receiptId) : null;
  const { data: receipt, isLoading } = useMyReceipt(parsedId);
  const { data: document, isLoading: isDocumentLoading } =
    useReceiptDocument(parsedId);

  return (
    <Layout area="customer">
      <div className="space-y-6">
        <div className="flex items-center justify-between gap-3 print:hidden">
          <Button
            asChild
            variant="ghost"
            size="sm"
            className="gap-2 px-0"
            data-ocid="customer.back_button"
          >
            <Link to="/customer/receipts">
              <ArrowLeft className="size-4" aria-hidden="true" />
              กลับไปรายการใบเสร็จ
            </Link>
          </Button>
          {receipt ? (
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="gap-2"
              onClick={() => window.print()}
              data-ocid="customer.print_button"
            >
              <Printer className="size-4" aria-hidden="true" />
              พิมพ์ / บันทึก PDF
            </Button>
          ) : null}
        </div>

        {isLoading ? (
          <LoadingState rows={6} />
        ) : !receipt ? (
          <EmptyState
            icon={Receipt}
            title="ไม่พบใบเสร็จ"
            description="ใบเสร็จนี้อาจถูกลบหรือไม่ได้เป็นของคุณ"
            action={
              <Button asChild data-ocid="customer.back_to_list_button">
                <Link to="/customer/receipts">กลับไปรายการใบเสร็จ</Link>
              </Button>
            }
          />
        ) : (
          <>
            <PageHeader
              title={`ใบเสร็จ ${receipt.number}`}
              description={`ออกเมื่อ ${formatThaiDateLong(receipt.issuedAt)}`}
              className="print:hidden"
            />

            {isDocumentLoading ? (
              <LoadingState rows={6} />
            ) : document ? (
              <div className="doc-print-root">
                <ReceiptDocument document={document} />
              </div>
            ) : (
              <EmptyState
                icon={Receipt}
                title="ไม่พบเอกสารใบเสร็จ"
                description="ไม่สามารถโหลดเอกสารใบเสร็จได้ในขณะนี้"
              />
            )}
          </>
        )}
      </div>
    </Layout>
  );
}
