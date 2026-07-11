import React from "react";
import { Settings } from "lucide-react";
import {
  AccountSettingsCard,
  NotificationSettingsCard,
  SecuritySettingsCard,
  AppearanceSettingsCard,
  LanguageSettingsCard,
  DangerZoneCard,
} from "../../../components/student/settings";
import { PageHeader } from "../../../components/shared";

const StudentSettingsPage: React.FC = () => {
  return (
    <div>
      <PageHeader
        title="Cài đặt"
        icon={Settings}
        description="Quản lý tài khoản và tùy chọn của bạn."
      />

      <div className="space-y-6">
        <AccountSettingsCard />
        <NotificationSettingsCard />
        <SecuritySettingsCard />
        <AppearanceSettingsCard />
        <LanguageSettingsCard />
        <DangerZoneCard />
      </div>
    </div>
  );
};

export default StudentSettingsPage;