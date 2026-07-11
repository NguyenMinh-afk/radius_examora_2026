import React from "react";
import { Settings } from "lucide-react";
import {
  AccountSettingsCard,
  NotificationSettingsCard,
  SecuritySettingsCard,
  DangerZoneCard
} from "../../../components/student/settings";
import { PageHeader, Card } from "../../../components/shared";

const StudentSettingsPage: React.FC = () => {
  return (
    <div>
      <PageHeader
        title="Cài đặt"
        icon={Settings}
        description="Quản lý tài khoản và tùy chọn của bạn."
      />

      <div className="space-y-6">
        <Card>
          <AccountSettingsCard />
        </Card>
        <Card>
          <NotificationSettingsCard />
        </Card>
        <Card>
          <SecuritySettingsCard />
        </Card>
        <Card>
          <DangerZoneCard />
        </Card>
      </div>
    </div>
  );
};

export default StudentSettingsPage;
