import { EmptyState } from "@/components/EmptyState";
import { Layout } from "@/components/Layout";
import { LoadingState } from "@/components/LoadingState";
import { PageHeader } from "@/components/PageHeader";
import { StatusBadge } from "@/components/StatusBadge";
import { ProofReviewPanel } from "@/components/manager/ProofReviewPanel";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  useApproveProof,
  usePayments,
  useProofs,
  useRejectProof,
} from "@/hooks/use-backend";
import { formatTHB, formatThaiDate } from "@/lib/format";
import { PaymentStatus, ProofStatus } from "@/types/app";
import { Link } from "@tanstack/react-router";
import { BadgeCheck, Search, Wallet } from "lucide-react";
import { useMemo, useState } from "react";

const ALL_STATUSES = "__all__";

const PAYMENT_STATUS_LABELS: Record<PaymentStatus, string> = {
  [PaymentStatus.pending]: "รอตรวจสอบ",
  [PaymentStatus.approved]: "อนุมัติแล้ว",
  [PaymentStatus.rejected]: "ถูกปฏิเสธ",
};

const PROOF_STATUS_LABELS: Record<ProofStatus, string> = {
  [ProofStatus.pending]: "รอตรวจสอบ",
  [ProofStatus.approved]: "อนุมัติแล้ว",
  [ProofStatus.rejected]: "ถูกปฏิเสธ",
};

/**
 * Payments workspace: the payment ledger and the transfer-proof review queue.
 * The proofs tab is the manager's approve/reject surface.
 */
export function PaymentsPage() {
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState(ALL_STATUSES);
  const [proofStatus, setProofStatus] = useState(ALL_STATUSES);
  const [selectedProofId, setSelectedProofId] = useState<string | null>(null);

  const paymentFilter = useMemo(
    () => ({
      search: search.trim() || undefined,
      status: status === ALL_STATUSES ? undefined : (status as PaymentStatus),
    }),
    [search, status],
  );
  const proofFilter = useMemo(
    () => ({
      status:
        proofStatus === ALL_STATUSES ? undefined : (proofStatus as ProofStatus),
    }),
    [proofStatus],
  );

  const payments = usePayments(paymentFilter);
  const proofs = useProofs(proofFilter);
  const approveProof = useApproveProof();
  const rejectProof = useRejectProof();

  const proofRows = proofs.data ?? [];
  const selectedProof =
    proofRows.find((proof) => proof.id.toString() === selectedProofId) ?? null;

  return (
    <Layout area="manager">
      <div className="space-y-6" data-ocid="payments.page">
        <PageHeader
          title="การชำระเงิน"
          description="บันทึกการรับชำระและตรวจสอบหลักฐานการโอนจากลูกค้า"
        />

        <Tabs defaultValue="payments" data-ocid="payments.tabs">
          <TabsList>
            <TabsTrigger value="payments" data-ocid="payments.ledger_tab">
              รายการชำระเงิน
            </TabsTrigger>
            <TabsTrigger value="proofs" data-ocid="payments.proofs_tab">
              หลักฐานการโอน
            </TabsTrigger>
          </TabsList>

          <TabsContent value="payments" className="mt-4 space-y-4">
            <div className="grid gap-3 sm:grid-cols-[1fr_12rem]">
              <div className="relative">
                <Search
                  className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
                  aria-hidden="true"
                />
                <Input
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="ค้นหาเลขที่ใบแจ้งหนี้หรือชื่อลูกค้า"
                  className="pl-9"
                  aria-label="ค้นหาการชำระเงิน"
                  data-ocid="payments.search_input"
                />
              </div>
              <Select value={status} onValueChange={setStatus}>
                <SelectTrigger
                  aria-label="กรองตามสถานะการชำระเงิน"
                  data-ocid="payments.status_select"
                >
                  <SelectValue placeholder="ทุกสถานะ" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={ALL_STATUSES}>ทุกสถานะ</SelectItem>
                  {Object.values(PaymentStatus).map((value) => (
                    <SelectItem key={value} value={value}>
                      {PAYMENT_STATUS_LABELS[value]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {payments.isLoading ? (
              <LoadingState rows={6} />
            ) : (payments.data ?? []).length === 0 ? (
              <EmptyState
                icon={Wallet}
                title="ไม่พบรายการชำระเงิน"
                description="บันทึกการชำระเงินจากหน้าใบแจ้งหนี้ หรือปรับเงื่อนไขการค้นหา"
              />
            ) : (
              <div className="overflow-hidden rounded-lg border border-border bg-card">
                <Table data-ocid="payments.table">
                  <TableHeader className="sticky top-0 bg-card">
                    <TableRow>
                      <TableHead>วันที่</TableHead>
                      <TableHead>ลูกค้า</TableHead>
                      <TableHead>ใบแจ้งหนี้</TableHead>
                      <TableHead className="text-right">จำนวน</TableHead>
                      <TableHead className="text-right">สถานะ</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {(payments.data ?? []).map((payment, index) => (
                      <TableRow
                        key={payment.id.toString()}
                        data-ocid={`payments.row.${index + 1}`}
                      >
                        <TableCell className="text-muted-foreground">
                          {formatThaiDate(payment.paidAt)}
                        </TableCell>
                        <TableCell className="font-medium">
                          <Link
                            to="/manager/payments/$paymentId"
                            params={{ paymentId: payment.id.toString() }}
                            className="transition-smooth hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                            data-ocid={`payments.link.${index + 1}`}
                          >
                            {payment.customerName}
                          </Link>
                        </TableCell>
                        <TableCell className="ledger-figure text-muted-foreground">
                          {payment.invoiceNumber}
                        </TableCell>
                        <TableCell className="ledger-figure text-right">
                          {formatTHB(payment.amount)}
                        </TableCell>
                        <TableCell className="text-right">
                          <StatusBadge status={payment.status} />
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </TabsContent>

          <TabsContent value="proofs" className="mt-4 space-y-4">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-sm text-muted-foreground">
                เลือกหลักฐานเพื่อดูรูปสลิปและอนุมัติหรือปฏิเสธ
              </p>
              <Select value={proofStatus} onValueChange={setProofStatus}>
                <SelectTrigger
                  className="sm:w-48"
                  aria-label="กรองตามสถานะหลักฐาน"
                  data-ocid="payments.proof_status_select"
                >
                  <SelectValue placeholder="ทุกสถานะ" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={ALL_STATUSES}>ทุกสถานะ</SelectItem>
                  {Object.values(ProofStatus).map((value) => (
                    <SelectItem key={value} value={value}>
                      {PROOF_STATUS_LABELS[value]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {proofs.isLoading ? (
              <LoadingState rows={5} />
            ) : proofRows.length === 0 ? (
              <EmptyState
                icon={BadgeCheck}
                title="ไม่มีหลักฐานการโอน"
                description="เมื่อลูกค้าแนบหลักฐานการโอน รายการจะปรากฏที่นี่เพื่อรอตรวจสอบ"
              />
            ) : (
              <div className="grid gap-6 xl:grid-cols-[1fr_22rem]">
                <div className="overflow-hidden rounded-lg border border-border bg-card">
                  <Table data-ocid="payments.proof_table">
                    <TableHeader>
                      <TableRow>
                        <TableHead>ลูกค้า</TableHead>
                        <TableHead>ใบแจ้งหนี้</TableHead>
                        <TableHead className="text-right">ยอดแจ้งโอน</TableHead>
                        <TableHead className="text-right">สถานะ</TableHead>
                        <TableHead className="text-right">ตรวจสอบ</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {proofRows.map((proof, index) => (
                        <TableRow
                          key={proof.id.toString()}
                          data-ocid={`payments.proof_row.${index + 1}`}
                        >
                          <TableCell className="font-medium">
                            {proof.customerName}
                          </TableCell>
                          <TableCell className="ledger-figure text-muted-foreground">
                            {proof.invoiceNumber}
                          </TableCell>
                          <TableCell className="ledger-figure text-right">
                            {formatTHB(proof.amount)}
                          </TableCell>
                          <TableCell className="text-right">
                            <StatusBadge status={proof.status} />
                          </TableCell>
                          <TableCell className="text-right">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() =>
                                setSelectedProofId(proof.id.toString())
                              }
                              data-ocid={`payments.review_button.${index + 1}`}
                            >
                              ตรวจสอบ
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>

                {selectedProof ? (
                  <ProofReviewPanel
                    proof={selectedProof}
                    onApprove={() =>
                      approveProof.mutate(selectedProof.id, {
                        onSuccess: () => setSelectedProofId(null),
                      })
                    }
                    onReject={(note) =>
                      rejectProof.mutate(
                        { id: selectedProof.id, note },
                        { onSuccess: () => setSelectedProofId(null) },
                      )
                    }
                    isApproving={approveProof.isPending}
                    isRejecting={rejectProof.isPending}
                    errorMessage={
                      approveProof.isError || rejectProof.isError
                        ? "ดำเนินการไม่สำเร็จ กรุณาลองใหม่อีกครั้ง"
                        : undefined
                    }
                  />
                ) : (
                  <div className="hidden xl:block">
                    <EmptyState
                      icon={BadgeCheck}
                      title="ยังไม่ได้เลือกหลักฐาน"
                      description="เลือกหลักฐานจากตารางเพื่อดูรูปสลิปและดำเนินการ"
                    />
                  </div>
                )}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
}
