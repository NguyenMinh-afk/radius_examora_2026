/**
 * Teacher Profile Service
 */
import { Op } from 'sequelize';
import {
  User,
  UserProfile,
  Class,
  ClassMember,
  Exam,
  ExamAssignment
} from '../../models/index.js';

class ProfileService {

  async getProfile(teacherId) {
    const teacher = await User.findByPk(teacherId, {
      attributes: ['id', 'email', 'full_name', 'avatar_url', 'phone', 'created_at'],
      include: [{ model: UserProfile, as: 'profile' }]
    });

    if (!teacher) {
      throw new Error('Teacher not found');
    }

    // Stats
    const classCount = await Class.count({
      where: { teacher_id: teacherId, is_active: true }
    });

    const classIds = (await Class.findAll({
      where: { teacher_id: teacherId, is_active: true },
      attributes: ['id']
    })).map(c => c.id);

    let studentCount = 0;
    if (classIds.length > 0) {
      studentCount = await ClassMember.count({
        where: { class_id: { [Op.in]: classIds }, role: 'student' }
      });
    }

    const examCount = await Exam.count({
      where: { created_by: teacherId }
    });

    const assignmentCount = await ExamAssignment.count({
      where: { assigned_by: teacherId, is_active: true }
    });

    return {
      id: teacher.id,
      fullName: teacher.full_name,
      email: teacher.email,
      phone: teacher.phone || '',
      avatarUrl: teacher.avatar_url,
      teacherCode: teacher.profile?.teacher_code || null,
      department: teacher.profile?.teacher_department || null,
      specialization: teacher.profile?.teacher_specialization || null,
      bio: teacher.profile?.bio || null,
      dateOfBirth: teacher.profile?.date_of_birth || null,
      gender: teacher.profile?.gender || null,
      schoolName: teacher.profile?.school_name || null,
      createdAt: teacher.created_at,
      stats: {
        classCount,
        studentCount,
        examCount,
        assignmentCount
      }
    };
  }

  async updateProfile(teacherId, updateData) {
    const { fullName, phone, avatarUrl, bio, dateOfBirth, gender, schoolName, teacherCode, department, specialization } = updateData;

    // Update User table
    if (fullName !== undefined || phone !== undefined || avatarUrl !== undefined) {
      const userUpdate = {};
      if (fullName !== undefined) userUpdate.full_name = fullName;
      if (phone !== undefined) userUpdate.phone = phone;
      if (avatarUrl !== undefined) userUpdate.avatar_url = avatarUrl;

      await User.update(userUpdate, { where: { id: teacherId } });
    }

    // Update UserProfile table
    let profile = await UserProfile.findOne({ where: { user_id: teacherId } });

    if (!profile) {
      profile = await UserProfile.create({
        user_id: teacherId,
        bio: bio || null,
        date_of_birth: dateOfBirth || null,
        gender: gender || null,
        school_name: schoolName || null,
        teacher_code: teacherCode || null,
        teacher_department: department || null,
        teacher_specialization: specialization || null,
      });
    } else {
      const profileUpdate = {};
      if (bio !== undefined) profileUpdate.bio = bio;
      if (dateOfBirth !== undefined) profileUpdate.date_of_birth = dateOfBirth;
      if (gender !== undefined) profileUpdate.gender = gender;
      if (schoolName !== undefined) profileUpdate.school_name = schoolName;
      if (teacherCode !== undefined) profileUpdate.teacher_code = teacherCode;
      if (department !== undefined) profileUpdate.teacher_department = department;
      if (specialization !== undefined) profileUpdate.teacher_specialization = specialization;

      if (Object.keys(profileUpdate).length > 0) {
        await UserProfile.update(profileUpdate, { where: { user_id: teacherId } });
      }
    }

    // Return updated profile
    return this.getProfile(teacherId);
  }
}

export default new ProfileService();