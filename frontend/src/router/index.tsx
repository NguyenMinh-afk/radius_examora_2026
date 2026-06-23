import { BrowserRouter, Routes, Route } from "react-router-dom";

import GoogleOAuthCallbackPage from "../pages/GoogleOAuthCallback/GoogleOAuthCallbackPage";
import Landing from "../pages/Landing/Landing";
import About from "../pages/About/About";
import Contact from "../pages/Contact/Contact";
import Register from "../pages/Register/Register";
import Login from "../pages/Login/Login";
import Forgot from "../pages/Forgot/Forgot";
import AdminDashboard from "../pages/Dashboard/Admin/AdminDashboard";
import TeacherDashboard from "../pages/Dashboard/Teacher/TeacherDashboard";

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

const AppRouter = () => {
  return (
    <BrowserRouter>
      <Routes>

        {/* Landing */}
        <Route path="/" element={<Landing />} />

        {/* About */}
        <Route path="/about" element={<About />} />

        {/* Contact */}
        <Route path="/contact" element={<Contact />} />

        {/* Register */}
        <Route path="/register" element={<Register />} />

        {/* Login */}
        <Route path="/login" element={<Login />} />

        {/* Google OAuth Callback */}
        <Route path="/oauth/google/callback" element={<GoogleOAuthCallbackPage />} />

        {/* Forgot Password */}
        <Route path="/forgot-password" element={<Forgot />} />

        {/* Admin Dashboard */}
        <Route path="/admin" element={<AdminDashboard />} />

        {/* Teacher Dashboard */}
        <Route path="/teacher" element={<TeacherDashboard />} /> 

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
