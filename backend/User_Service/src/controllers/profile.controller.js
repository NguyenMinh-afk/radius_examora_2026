import UserProfile from "../models/UserProfile.js";
import { verifyAccessToken } from "../config/jwt.js";

const getBearerToken = (req) => {
  const header = req.headers.authorization || "";
  const [scheme, token] = header.split(" ");
  if (scheme?.toLowerCase() !== "bearer" || !token) {
    return null;
  }
  return token;
};

const getRoleFromToken = (decoded) =>
  typeof decoded?.role === "string" ? decoded.role : null;

const isStudentProfileComplete = (profile) =>
  Boolean(profile?.student_code && profile?.school_name && profile?.class_code);

const isTeacherProfileComplete = (profile) =>
  Boolean(
    profile?.teacher_code &&
      profile?.teacher_department &&
      profile?.teacher_specialization
  );

const buildProfilePayload = (role, body) => {
  if (role === "student") {
    return {
      student_code: body.student_code,
      school_name: body.faculty,
      class_code: body.class_code,
    };
  }

  if (role === "teacher") {
    return {
      teacher_code: body.teacher_code,
      teacher_department: body.department,
      teacher_specialization: body.specialization,
    };
  }

  return {};
};

export const getProfile = async (req, res) => {
  try {
    const token = getBearerToken(req);
    if (!token) {
      return res.status(401).json({ message: "Missing bearer token" });
    }

    const decoded = verifyAccessToken(token);
    const profile = await UserProfile.findOne({ where: { user_id: decoded.id } });
    const role = getRoleFromToken(decoded);

    const isComplete = role === "teacher"
      ? isTeacherProfileComplete(profile)
      : role === "student"
        ? isStudentProfileComplete(profile)
        : true;

    return res.json({ profile, isComplete });
  } catch (err) {
    return res.status(401).json({ message: "Invalid token", error: err.message });
  }
};

export const completeProfile = async (req, res) => {
  try {
    const token = getBearerToken(req);
    if (!token) {
      return res.status(401).json({ message: "Missing bearer token" });
    }

    const decoded = verifyAccessToken(token);
    const role = getRoleFromToken(decoded);

    if (!role || !["student", "teacher"].includes(role)) {
      return res.status(400).json({ message: "Unsupported role" });
    }

    const payload = buildProfilePayload(role, req.body || {});

    if (role === "student" && !isStudentProfileComplete(payload)) {
      return res.status(400).json({
        message: "student_code, faculty and class_code are required",
      });
    }

    if (role === "teacher" && !isTeacherProfileComplete(payload)) {
      return res.status(400).json({
        message: "teacher_code, department and specialization are required",
      });
    }

    const existing = await UserProfile.findOne({ where: { user_id: decoded.id } });

    if (existing) {
      await existing.update(payload);
    } else {
      await UserProfile.create({ user_id: decoded.id, ...payload });
    }

    return res.json({ message: "Profile updated", profile: payload, isComplete: true });
  } catch (err) {
    return res.status(400).json({ message: "Profile update failed", error: err.message });
  }
};
