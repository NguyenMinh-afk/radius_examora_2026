import React from "react";
import { PageHeader, Card } from "../../../components/shared";
import { Settings as SettingsIcon } from "lucide-react";
import {
  AccountSettingsCard,
  NotificationSettingsCard,
  SecuritySettingsCard,
  AppearanceSettingsCard,
  LanguageSettingsCard,
} from "../../../components/teacher/settings";

const TeacherSettingsPage: React.FC = () => {
  return (
    <div>
      <PageHeader
        title="Cài đặt"
        icon={SettingsIcon}
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
          <AppearanceSettingsCard />
        </Card>
        <Card>
          <LanguageSettingsCard />
        </Card>
      </div>
    </div>
  );
};

export default TeacherSettingsPage;
