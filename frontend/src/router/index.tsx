import { BrowserRouter, Routes, Route } from "react-router-dom";

import GoogleOAuthCallbackPage from "../pages/GoogleOAuthCallback/GoogleOAuthCallbackPage";
import Landing from "../pages/Landing/Landing";
import About from "../pages/About/About";
import Contact from "../pages/Contact/Contact";
import Register from "../pages/Register/Register";
import Login from "../pages/Login/Login";
import Forgot from "../pages/Forgot/Forgot";
import AdminDashboard from "../pages/Dashboard/Admin/AdminDashboard";

// Teacher Layout & Pages
import TeacherLayout from "../layouts/TeacherLayout";
import TeacherDashboardPage from "../pages/Dashboard/Teacher/TeacherDashboardPage";
import TeacherCoursesPage from "../pages/Dashboard/Teacher/TeacherCoursesPage";
import TeacherClassesPage from "../pages/Dashboard/Teacher/TeacherClassesPage";
import TeacherClassDetailPage from "../pages/Dashboard/Teacher/TeacherClassDetailPage";
import TeacherQuestionsPage from "../pages/Dashboard/Teacher/TeacherQuestionsPage";
import TeacherExamsPage from "../pages/Dashboard/Teacher/TeacherExamsPage";
import TeacherExamDetailPage from "../pages/Dashboard/Teacher/TeacherExamDetailPage";
import TeacherAssignmentsPage from "../pages/Dashboard/Teacher/TeacherAssignmentsPage";
import TeacherSchedulePage from "../pages/Dashboard/Teacher/TeacherSchedulePage";
import TeacherResultsPage from "../pages/Dashboard/Teacher/TeacherResultsPage";
import TeacherNotificationsPage from "../pages/Dashboard/Teacher/TeacherNotificationsPage";
import TeacherProfilePage from "../pages/Dashboard/Teacher/TeacherProfilePage";
import TeacherSettingsPage from "../pages/Dashboard/Teacher/TeacherSettingsPage";

// Student Layout & Pages
import StudentLayout from "../layouts/StudentLayout";
import StudentDashboardPage from "../pages/Dashboard/Student/StudentDashboardPage";
import StudentClassesPage from "../pages/Dashboard/Student/StudentClassesPage";
import StudentClassDetailPage from "../pages/Dashboard/Student/StudentClassDetailPage";
import StudentAssignmentsPage from "../pages/Dashboard/Student/StudentAssignmentsPage";
import StudentResultsPage from "../pages/Dashboard/Student/StudentResultsPage";
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

        {/* Public pages - redirect if already authenticated */}
        <Route path="/about" element={<RedirectIfAuthenticated><About /></RedirectIfAuthenticated>} />
        <Route path="/contact" element={<RedirectIfAuthenticated><Contact /></RedirectIfAuthenticated>} />
        <Route path="/register" element={<RedirectIfAuthenticated><Register /></RedirectIfAuthenticated>} />
        <Route path="/login" element={<RedirectIfAuthenticated><Login /></RedirectIfAuthenticated>} />

        {/* Google OAuth Callback */}
        <Route path="/oauth/google/callback" element={<GoogleOAuthCallbackPage />} />

        {/* Forgot Password */}
        <Route path="/forgot-password" element={<RedirectIfAuthenticated><Forgot /></RedirectIfAuthenticated>} />

        {/* Admin Dashboard */}
        <Route path="/admin" element={<AdminDashboard />} />

        {/* Teacher Module - với Layout có Sidebar */}
        <Route element={<TeacherLayout />}>
          {/* Teacher Dashboard - default */}
          <Route path="/teacher" element={<TeacherDashboardPage />} />

          {/* Courses */}
          <Route path="/teacher/courses" element={<TeacherCoursesPage />} />
          <Route path="/teacher/courses/:courseId" element={<TeacherCoursesPage />} />

          {/* Classes */}
          <Route path="/teacher/classes" element={<TeacherClassesPage />} />
          <Route path="/teacher/classes/:classId" element={<TeacherClassDetailPage />} />

          {/* Questions */}
          <Route path="/teacher/questions" element={<TeacherQuestionsPage />} />
          <Route path="/teacher/questions/create" element={<TeacherQuestionsPage />} />
          <Route path="/teacher/questions/:id" element={<TeacherQuestionsPage />} />

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

      </Routes>
    </BrowserRouter>
  );
};

export default AppRouter;
