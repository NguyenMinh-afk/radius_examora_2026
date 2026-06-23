import React from "react";
import { Settings as SettingsIcon } from "lucide-react";
import { StudentPageHeader } from "../../../components/student/layout";
import {
  AccountSettingsCard,
  NotificationSettingsCard,
  SecuritySettingsCard,
  DangerZoneCard
} from "../../../components/student/settings";

const StudentSettingsPage: React.FC = () => {
  return (
    <div className="p-8">
      <StudentPageHeader
        title="Cài đặt"
        icon={SettingsIcon}
        description="Quản lý tài khoản và tùy chọn của bạn."
      />

      <AccountSettingsCard />
      <NotificationSettingsCard />
      <SecuritySettingsCard />
      <DangerZoneCard />
    </div>
  );
};

export default StudentSettingsPage;
