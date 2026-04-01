import { BrowserRouter, Routes, Route } from "react-router-dom";

import Landing from "../pages/Landing/Landing";
import Contact from "../pages/Contact/Contact";
import Register from "../pages/Register/Register";
import Login from "../pages/Login/Login";
import Forgot from "../pages/Forgot/Forgot";
import AdminDashboard from "../pages/Dashboard/Admin/AdminDashboard";
import TeacherDashboard from "../pages/Dashboard/Teacher/TeacherDashboard";

const AppRouter = () => {
  return (
    <BrowserRouter>
      <Routes>

        {/* Landing */}
        <Route path="/" element={<Landing />} />

        {/* Contact */}
        <Route path="/contact" element={<Contact />} />

        {/* Register */}
        <Route path="/register" element={<Register />} />

        {/* Login */}
        <Route path="/login" element={<Login />} />
        
        {/* Forgot Password */}
        <Route path="/forgot-password" element={<Forgot />} />

        {/* Admin Dashboard */}
        <Route path="/admin" element={<AdminDashboard />} />

        {/* Teacher Dashboard */}
        <Route path="/teacher" element={<TeacherDashboard />} /> 

      </Routes>
    </BrowserRouter>
  );
};

export default AppRouter;