/**
 * Profile Service - Business logic cho Profile/Settings Module
 * ESM - KHÔNG chứa auth/exam/question/notification
 * Chỉ xử lý: profile, settings, change password
 */
import bcrypt from "bcrypt";
import {
  User,
  UserProfile,
  StudentProfile,
  TeacherProfile,
  Role,
} from "../models/index.js";

class ProfileService {

  async getProfile(userId) {
    const user = await User.findByPk(userId, {
      include: [
        { model: Role, as: "role" },
        { model: UserProfile, as: "profile" },
        { model: StudentProfile, as: "studentProfile" },
        { model: TeacherProfile, as: "teacherProfile" },
      ],
    });

    if (!user) {
      throw new Error("User not found");
    }

    return {
      id: user.id,
      email: user.email,
      phone: user.phone,
      fullName: user.full_name,
      avatarUrl: user.avatar_url,
      role: user.role?.name || null,
      roleId: user.role_id,
      isActive: user.is_active,
      emailVerified: user.email_verified,
      approvalStatus: user.approval_status,
      profile: user.profile
        ? {
            dateOfBirth: user.profile.date_of_birth,
            gender: user.profile.gender,
            schoolName: user.profile.school_name,
            gradeLevel: user.profile.grade_level,
            studentCode: user.profile.student_code,
          }
        : null,
      studentProfile: user.studentProfile
        ? {
            currentGradeLevel: user.studentProfile.current_grade_level,
            admissionYear: user.studentProfile.admission_year,
            academicYear: user.studentProfile.academic_year,
          }
        : null,
      teacherProfile: user.teacherProfile
        ? {
            teachingExperienceYears: user.teacherProfile.teaching_experience_years,
            highestDegree: user.teacherProfile.highest_degree,
            subjectsTeaching: user.teacherProfile.subjects_teaching,
          }
        : null,
    };
  }

  async updateProfile(userId, data) {
    const user = await User.findByPk(userId);
    if (!user) {
      throw new Error("User not found");
    }

    const profileFields = {};
    if (data.fullName !== undefined) profileFields.full_name = data.fullName;
    if (data.phone !== undefined) profileFields.phone = data.phone;
    if (data.avatarUrl !== undefined) profileFields.avatar_url = data.avatarUrl;

    if (Object.keys(profileFields).length > 0) {
      await user.update(profileFields);
    }

    let profile = await UserProfile.findOne({ where: { user_id: userId } });
    if (!profile) {
      profile = await UserProfile.create({ user_id: userId });
    }

    const profileData = {};
    if (data.dateOfBirth !== undefined) profileData.date_of_birth = data.dateOfBirth;
    if (data.gender !== undefined) profileData.gender = data.gender;
    if (data.schoolName !== undefined) profileData.school_name = data.schoolName;

    if (Object.keys(profileData).length > 0) {
      await profile.update(profileData);
    }

    return this.getProfile(userId);
  }

  async updateSettings(userId, data) {
    const profile = await UserProfile.findOne({ where: { user_id: userId } });
    if (!profile) {
      const newProfile = await UserProfile.create({ user_id: userId });
      await newProfile.update({ settings: data });
      return { userId, settings: data };
    }

    await profile.update({ settings: data });
    return { userId, settings: data };
  }

  async changePassword(userId, currentPassword, newPassword) {
    const user = await User.findByPk(userId);
    if (!user) {
      return { success: false, error: "User not found" };
    }

    const isValid = await bcrypt.compare(currentPassword, user.password_hash);
    if (!isValid) {
      return { success: false, error: "Current password is incorrect" };
    }

    const newHash = await bcrypt.hash(
      newPassword,
      Number(process.env.BCRYPT_ROUNDS) || 10
    );
    await user.update({ password_hash: newHash });

    return { success: true };
  }
}

export default new ProfileService();
