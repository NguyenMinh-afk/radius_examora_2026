import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { completeProfile, getProfile } from "../../api/axios/User";
import { getDashboardPath } from "../../utils/auth";

type RoleType = "student" | "teacher" | "admin" | null;

const getStoredRole = (): RoleType => {
  try {
    const stored = localStorage.getItem("user");
    if (stored) {
      const parsed = JSON.parse(stored) as { role?: string };
      if (parsed.role === "student" || parsed.role === "teacher" || parsed.role === "admin") {
        return parsed.role;
      }
    }
  } catch {
    return null;
  }

  return null;
};

const CompleteProfile: React.FC = () => {
  const [role, setRole] = useState<RoleType>(null);
  const [studentCode, setStudentCode] = useState("");
  const [faculty, setFaculty] = useState("");
  const [classCode, setClassCode] = useState("");
  const [teacherCode, setTeacherCode] = useState("");
  const [department, setDepartment] = useState("");
  const [specialization, setSpecialization] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const currentRole = getStoredRole();
    if (!currentRole) {
      navigate("/login", { replace: true });
      return;
    }

    setRole(currentRole);

    getProfile()
      .then((res) => {
        if (res.data.isComplete) {
          navigate(getDashboardPath(currentRole), { replace: true });
          return;
        }

        const profile = (res.data.profile || {}) as Record<string, string>;
        setStudentCode(profile.student_code || "");
        setFaculty(profile.school_name || "");
        setClassCode(profile.class_code || "");
        setTeacherCode(profile.teacher_code || "");
        setDepartment(profile.teacher_department || "");
        setSpecialization(profile.teacher_specialization || "");
      })
      .catch(() => {
        navigate("/login", { replace: true });
      });
  }, [navigate]);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError("");

    if (!role || role === "admin") {
      navigate(getDashboardPath(role), { replace: true });
      return;
    }

    if (role === "student") {
      if (!studentCode || !faculty || !classCode) {
        setError("Please fill all required student fields.");
        return;
      }
    }

    if (role === "teacher") {
      if (!teacherCode || !department || !specialization) {
        setError("Please fill all required teacher fields.");
        return;
      }
    }

    setIsSubmitting(true);

    try {
      const payload =
        role === "student"
          ? { student_code: studentCode, faculty, class_code: classCode }
          : { teacher_code: teacherCode, department, specialization };

      await completeProfile(payload);
      navigate(getDashboardPath(role), { replace: true });
    } catch (err: unknown) {
      let errMsg = "Failed to update profile";
      if (axios.isAxiosError(err)) {
        errMsg = err.response?.data?.message || err.message || errMsg;
      } else if (err instanceof Error) {
        errMsg = err.message;
      }
      setError(errMsg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-100 via-slate-100 to-teal-100 px-6 py-12">
      <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 w-full max-w-lg">
        <h2 className="text-xl font-semibold text-gray-900 mb-1">
          {role === "teacher" ? "Complete Teacher Verification" : "Complete Academic Profile"}
        </h2>
        <p className="text-sm text-gray-500 mb-4">
          Please complete the required fields before accessing your dashboard.
        </p>

        {error && (
          <div className="mb-3 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
            {error}
          </div>
        )}

        <form className="space-y-3" onSubmit={handleSubmit}>
          {role === "student" && (
            <>
              <div>
                <label className="text-xs font-semibold text-gray-500">STUDENT CODE</label>
                <input
                  type="text"
                  value={studentCode}
                  onChange={(e) => setStudentCode(e.target.value)}
                  className="w-full mt-1 border rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                  required
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-500">FACULTY</label>
                <input
                  type="text"
                  value={faculty}
                  onChange={(e) => setFaculty(e.target.value)}
                  className="w-full mt-1 border rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                  required
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-500">CLASS</label>
                <input
                  type="text"
                  value={classCode}
                  onChange={(e) => setClassCode(e.target.value)}
                  className="w-full mt-1 border rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                  required
                />
              </div>
            </>
          )}

          {role === "teacher" && (
            <>
              <div>
                <label className="text-xs font-semibold text-gray-500">TEACHER CODE</label>
                <input
                  type="text"
                  value={teacherCode}
                  onChange={(e) => setTeacherCode(e.target.value)}
                  className="w-full mt-1 border rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                  required
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-500">DEPARTMENT</label>
                <input
                  type="text"
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                  className="w-full mt-1 border rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                  required
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-500">SPECIALIZATION</label>
                <input
                  type="text"
                  value={specialization}
                  onChange={(e) => setSpecialization(e.target.value)}
                  className="w-full mt-1 border rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                  required
                />
              </div>
            </>
          )}

          <button
            type="submit"
            disabled={isSubmitting}
            className={`w-full mt-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white py-2.5 rounded-lg text-sm shadow transition ${
              isSubmitting ? "opacity-70 cursor-not-allowed" : "hover:scale-[1.02]"
            }`}
          >
            {isSubmitting ? "Saving..." : "Continue"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default CompleteProfile;
