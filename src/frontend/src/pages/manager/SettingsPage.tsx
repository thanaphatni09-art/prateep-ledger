import { Layout } from "@/components/Layout";
import { LoadingState } from "@/components/LoadingState";
import { PageHeader } from "@/components/PageHeader";
import { SettingsForm } from "@/components/manager/SettingsForm";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useSettings, useUpdateSettings } from "@/hooks/use-backend";
import type { SettingsInput } from "@/types/app";
import { useState } from "react";

/** Shop profile, bank details, and document numbering settings. */
export function SettingsPage() {
  const settings = useSettings();
  const updateSettings = useUpdateSettings();
  const [saved, setSaved] = useState(false);

  function handleSubmit(input: SettingsInput) {
    setSaved(false);
    updateSettings.mutate(input, {
      onSuccess: () => setSaved(true),
    });
  }

  return (
    <Layout area="manager">
      <div className="space-y-6" data-ocid="settings.page">
        <PageHeader
          title="ตั้งค่าร้าน"
          description="ข้อมูลร้านค้า บัญชีธนาคาร และรูปแบบเลขเอกสารที่ใช้ทั้งระบบ"
        />

        {settings.isLoading ? (
          <LoadingState rows={8} />
        ) : settings.data ? (
          <Card className="rounded-lg shadow-none">
            <CardHeader>
              <CardTitle className="text-base">ข้อมูลร้านและเอกสาร</CardTitle>
              <CardDescription>
                การเปลี่ยนแปลงจะมีผลกับเอกสารที่ออกใหม่หลังจากบันทึก
              </CardDescription>
            </CardHeader>
            <CardContent>
              <SettingsForm
                settings={settings.data}
                onSubmit={handleSubmit}
                isPending={updateSettings.isPending}
                errorMessage={
                  updateSettings.isError
                    ? "บันทึกการตั้งค่าไม่สำเร็จ กรุณาลองใหม่อีกครั้ง"
                    : undefined
                }
                successMessage={saved ? "บันทึกการตั้งค่าเรียบร้อยแล้ว" : undefined}
              />
            </CardContent>
          </Card>
        ) : (
          <p className="text-sm text-muted-foreground">
            ไม่สามารถโหลดข้อมูลการตั้งค่าได้ กรุณาลองใหม่อีกครั้ง
          </p>
        )}
      </div>
    </Layout>
  );
}
