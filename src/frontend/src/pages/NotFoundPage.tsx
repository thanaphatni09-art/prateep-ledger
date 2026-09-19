import { Button } from "@/components/ui/button";
import { Link } from "@tanstack/react-router";
import { Compass } from "lucide-react";

/** Fallback page for unknown routes. */
export function NotFoundPage() {
  return (
    <div
      className="flex min-h-dvh flex-col items-center justify-center gap-4 bg-background px-4 text-center"
      data-ocid="page.not_found"
    >
      <span className="flex size-12 items-center justify-center rounded-full bg-muted text-muted-foreground">
        <Compass className="size-6" aria-hidden="true" />
      </span>
      <div className="space-y-1">
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">
          ไม่พบหน้านี้
        </h1>
        <p className="max-w-sm text-sm text-muted-foreground">
          ลิงก์ที่คุณเปิดอาจถูกย้ายหรือไม่มีอยู่ในระบบ กรุณากลับไปยังหน้าหลัก
        </p>
      </div>
      <Button asChild data-ocid="page.back_home_button">
        <Link to="/">กลับไปหน้าหลัก</Link>
      </Button>
    </div>
  );
}
