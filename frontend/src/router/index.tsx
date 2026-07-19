import { BrowserRouter, Routes, Route } from "react-router-dom";

import GoogleOAuthCallbackPage from "../pages/GoogleOAuthCallback/GoogleOAuthCallbackPage";
import Landing from "../pages/Landing/Landing";
import About from "../pages/About/About";
import Contact from "../pages/Contact/Contact";
import Terms from "../pages/Terms/Terms";
import Privacy from "../pages/Privacy/Privacy";
import HelpCenter from "../pages/HelpCenter/HelpCenter";
import Register from "../pages/Register/Register";
import Login from "../pages/Login/Login";
import Forgot from "../pages/Forgot/Forgot";
import ResetPassword from "../pages/ResetPassword/ResetPassword";

// Admin Pages
import AdminDashboardPage from "../pages/Dashboard/Admin/AdminDashboardPage";
import AdminMonitoringPage from "../pages/Dashboard/Admin/AdminMonitoringPage";
import AdminNotificationsPage from "../pages/Dashboard/Admin/AdminNotificationsPage";
import AdminAuditLogsPage from "../pages/Dashboard/Admin/AdminAuditLogsPage";
import AdminSystemLogsPage from "../pages/Dashboard/Admin/AdminSystemLogsPage";
import AdminQuestionsPage from "../pages/Dashboard/Admin/AdminQuestionsPage";
import AdminProfilePage from "../pages/Dashboard/Admin/AdminProfilePage";
import AdminSettingsPage from "../pages/Dashboard/Admin/AdminSettingsPage";

// Teacher Layout & Pages
import TeacherLayout from "../layouts/TeacherLayout";
import TeacherDashboardPage from "../pages/Dashboard/Teacher/TeacherDashboardPage";
import TeacherCoursesPage from "../pages/Dashboard/Teacher/TeacherCoursesPage";
import TeacherCourseDetailPage from "../pages/Dashboard/Teacher/TeacherCourseDetailPage";
import TeacherClassesPage from "../pages/Dashboard/Teacher/TeacherClassesPage";
import TeacherClassDetailPage from "../pages/Dashboard/Teacher/TeacherClassDetailPage";
import TeacherQuestionsPage from "../pages/Dashboard/Teacher/TeacherQuestionsPage";
import TeacherQuestionFormPage from "../pages/Dashboard/Teacher/TeacherQuestionFormPage";
import TeacherExamsPage from "../pages/Dashboard/Teacher/TeacherExamsPage";
import TeacherExamDetailPage from "../pages/Dashboard/Teacher/TeacherExamDetailPage";
import TeacherAssignmentsPage from "../pages/Dashboard/Teacher/TeacherAssignmentsPage";
import TeacherSchedulePage from "../pages/Dashboard/Teacher/TeacherSchedulePage";
import TeacherResultsPage from "../pages/Dashboard/Teacher/TeacherResultsPage";
import TeacherNotificationsPage from "../pages/Dashboard/Teacher/TeacherNotificationsPage";
import TeacherProfilePage from "../pages/Dashboard/Teacher/TeacherProfilePage";
import TeacherSettingsPage from "../pages/Dashboard/Teacher/TeacherSettingsPage";
import TeacherAIGenerationPage from "../pages/Dashboard/Teacher/TeacherAIGenerationPage";

// Student Layout & Pages
import StudentLayout from "../layouts/StudentLayout";
import StudentDashboardPage from "../pages/Dashboard/Student/StudentDashboardPage";
import StudentClassesPage from "../pages/Dashboard/Student/StudentClassesPage";
import StudentClassDetailPage from "../pages/Dashboard/Student/StudentClassDetailPage";
import StudentAssignmentsPage from "../pages/Dashboard/Student/StudentAssignmentsPage";
import StudentResultsPage from "../pages/Dashboard/Student/StudentResultsPage";
import StudentExamTakingPage from "../pages/Dashboard/Student/StudentExamTakingPage";
import StudentNotificationsPage from "../pages/Dashboard/Student/StudentNotificationsPage";
import StudentProfilePage from "../pages/Dashboard/Student/StudentProfilePage";
import StudentSettingsPage from "../pages/Dashboard/Student/StudentSettingsPage";

import RedirectIfAuthenticated from "../components/auth/RedirectIfAuthenticated";

const AppRouter = () => {
  return (
    <BrowserRouter>
      <Routes>

        {/* Landing - ai cũng xem được, kể cả đã đăng nhập */}
        <Route path="/" element={<Landing />} />

        {/* Public pages */}
        <Route path="/about" element={<About />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/terms" element={<Terms />} />
        <Route path="/privacy" element={<Privacy />} />
        <Route path="/help" element={<HelpCenter />} />
        <Route path="/register" element={<RedirectIfAuthenticated><Register /></RedirectIfAuthenticated>} />
        <Route path="/login" element={<RedirectIfAuthenticated><Login /></RedirectIfAuthenticated>} />

        {/* Google OAuth Callback */}
        <Route path="/oauth/google/callback" element={<GoogleOAuthCallbackPage />} />

        {/* Forgot Password */}
        <Route path="/forgot-password" element={<RedirectIfAuthenticated><Forgot /></RedirectIfAuthenticated>} />
        <Route path="/reset-password" element={<RedirectIfAuthenticated><ResetPassword /></RedirectIfAuthenticated>} />

        {/* Admin Module */}
        <Route path="/admin" element={<AdminDashboardPage />} />
        <Route path="/admin/users" element={<AdminDashboardPage />} />
        <Route path="/admin/courses" element={<AdminDashboardPage />} />
        <Route path="/admin/questions" element={<AdminQuestionsPage />} />
        <Route path="/admin/monitoring" element={<AdminMonitoringPage />} />
        <Route path="/admin/notifications" element={<AdminNotificationsPage />} />
        <Route path="/admin/audit-logs" element={<AdminAuditLogsPage />} />
        <Route path="/admin/system-logs" element={<AdminSystemLogsPage />} />
        <Route path="/admin/profile" element={<AdminProfilePage />} />
        <Route path="/admin/settings" element={<AdminSettingsPage />} />

        {/* Teacher Module - với Layout có Sidebar */}
        <Route element={<TeacherLayout />}>
          {/* Teacher Dashboard - default */}
          <Route path="/teacher" element={<TeacherDashboardPage />} />

          {/* Courses */}
          <Route path="/teacher/courses" element={<TeacherCoursesPage />} />
          <Route path="/teacher/courses/:courseId" element={<TeacherCourseDetailPage />} />

          {/* Classes */}
          <Route path="/teacher/classes" element={<TeacherClassesPage />} />
          <Route path="/teacher/classes/:classId" element={<TeacherClassDetailPage />} />

          {/* Questions */}
          <Route path="/teacher/questions" element={<TeacherQuestionsPage />} />
          <Route path="/teacher/questions/create" element={<TeacherQuestionFormPage />} />
          <Route path="/teacher/questions/:id" element={<TeacherQuestionFormPage />} />

          {/* AI Generation */}
          <Route path="/teacher/ai-generation" element={<TeacherAIGenerationPage />} />

          {/* Exams */}
          <Route path="/teacher/exams" element={<TeacherExamsPage />} />
          <Route path="/teacher/exams/create" element={<TeacherExamsPage />} />
          <Route path="/teacher/exams/:examId" element={<TeacherExamDetailPage />} />

          {/* Assignments */}
          <Route path="/teacher/assignments" element={<TeacherAssignmentsPage />} />
          <Route path="/teacher/assignments/:assignmentId" element={<TeacherAssignmentsPage />} />

          {/* Schedule */}
          <Route path="/teacher/schedule" element={<TeacherSchedulePage />} />

          {/* Results */}
          <Route path="/teacher/results" element={<TeacherResultsPage />} />
          <Route path="/teacher/results/:attemptId" element={<TeacherResultsPage />} />

          {/* Notifications */}
          <Route path="/teacher/notifications" element={<TeacherNotificationsPage />} />

          {/* Profile */}
          <Route path="/teacher/profile" element={<TeacherProfilePage />} />

          {/* Settings */}
          <Route path="/teacher/settings" element={<TeacherSettingsPage />} />
        </Route>

        {/* Student Module - với Layout có Sidebar */}
        <Route element={<StudentLayout />}>
          {/* Student Dashboard - default */}
          <Route path="/student" element={<StudentDashboardPage />} />

          {/* Classes */}
          <Route path="/student/classes" element={<StudentClassesPage />} />
          <Route path="/student/classes/:classId" element={<StudentClassDetailPage />} />

          {/* Assignments */}
          <Route path="/student/assignments" element={<StudentAssignmentsPage />} />
          <Route path="/student/assignments/:assignmentId" element={<StudentAssignmentsPage />} />

          {/* Results */}
          <Route path="/student/results" element={<StudentResultsPage />} />
          <Route path="/student/results/:attemptId" element={<StudentResultsPage />} />

          {/* Notifications */}
          <Route path="/student/notifications" element={<StudentNotificationsPage />} />

          {/* Profile */}
          <Route path="/student/profile" element={<StudentProfilePage />} />

          {/* Settings */}
          <Route path="/student/settings" element={<StudentSettingsPage />} />
        </Route>

        {/* Exam Taking Page - Full screen, KHÔNG có sidebar */}
        <Route path="/student/assignments/:assignmentId/take" element={<StudentExamTakingPage />} />

      </Routes>
    </BrowserRouter>
  );
};

export default AppRouter;
