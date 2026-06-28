/**
 * Teacher Course Service
 */
import {
  Course,
  Class,
  ClassMember,
  Exam,
  ExamQuestion
} from '../../models/index.js';

class CourseService {

  async getCourses(teacherId) {
    const teacherClasses = await Class.findAll({
      where: { teacher_id: teacherId, is_active: true }
    });

    const courseIds = [...new Set(teacherClasses.map(c => c.course_id).filter(Boolean))];

    const courses = courseIds.length > 0
      ? await Course.findAll({
          where: { id: courseIds },
          attributes: ['id', 'name', 'code', 'description', 'credits']
        })
      : [];

    const result = [];
    for (const course of courses) {
      const classIds = teacherClasses.filter(c => c.course_id === course.id).map(c => c.id);
      
      // Get exams created by teacher for this course
      const exams = await Exam.findAll({
        where: { created_by: teacherId, course_id: course.id }
      });
      const examIds = exams.map(e => e.id);
      
      // Count questions from these exams
      const questionCount = examIds.length > 0
        ? await ExamQuestion.count({ where: { exam_id: examIds } })
        : 0;
      
      result.push({
        courseId: course.id,
        name: course.name,
        code: course.code,
        description: course.description || '',
        credits: course.credits || 0,
        facultyName: '',
        classCount: classIds.length,
        examCount: exams.length,
        questionCount
      });
    }

    return result;
  }

  async getCourseDetail(teacherId, courseId) {
    const course = await Course.findByPk(courseId);
    if (!course) {
      throw new Error('Khóa học không tìm thấy');
    }

    const classes = await Class.findAll({
      where: { course_id: courseId, teacher_id: teacherId, is_active: true }
    });

    // Get exams for this course
    const exams = await Exam.findAll({
      where: { created_by: teacherId, course_id: courseId }
    });
    const examIds = exams.map(e => e.id);
    
    // Count questions from these exams
    const questionCount = examIds.length > 0
      ? await ExamQuestion.count({ where: { exam_id: examIds } })
      : 0;

    // Get student count for each class
    const classesWithStudentCount = await Promise.all(
      classes.map(async (c) => {
        const studentCount = await ClassMember.count({
          where: { class_id: c.id, role: 'student' }
        });
        return {
          classId: c.id,
          classCode: c.class_code,
          name: c.name,
          studentCount
        };
      })
    );

    return {
      courseId: course.id,
      name: course.name,
      code: course.code,
      description: course.description || '',
      credits: course.credits || 0,
      semesterType: course.semester_type,
      facultyName: '',
      classCount: classes.length,
      examCount: exams.length,
      questionCount,
      classes: classesWithStudentCount
    };
  }

  async createCourse(teacherId, data) {
    const { name, code, description, credits, semesterType } = data;

    const existing = await Course.findOne({ where: { code } });
    if (existing) {
      throw new Error('Mã khóa học đã tồn tại');
    }

    const course = await Course.create({
      name,
      code,
      description: description || null,
      credits: credits || 0,
      semester_type: semesterType || null,
      faculty_id: 1
    });

    return {
      courseId: course.id,
      name: course.name,
      code: course.code,
      description: course.description || '',
      credits: course.credits || 0,
      facultyName: '',
      classCount: 0,
      examCount: 0,
      questionCount: 0
    };
  }

  async updateCourse(teacherId, courseId, data) {
    const course = await Course.findByPk(courseId);
    if (!course) {
      throw new Error('Khóa học không tìm thấy');
    }

    if (data.code && data.code !== course.code) {
      const existing = await Course.findOne({ where: { code: data.code } });
      if (existing) {
        throw new Error('Mã khóa học đã tồn tại');
      }
    }

    const updateData = {};
    if (data.name !== undefined) updateData.name = data.name;
    if (data.code !== undefined) updateData.code = data.code;
    if (data.description !== undefined) updateData.description = data.description;
    if (data.credits !== undefined) updateData.credits = data.credits;
    if (data.semesterType !== undefined) updateData.semester_type = data.semesterType;

    if (Object.keys(updateData).length > 0) {
      await course.update(updateData);
    }

    return {
      courseId: course.id,
      name: course.name,
      code: course.code,
      description: course.description || '',
      credits: course.credits || 0,
      facultyName: '',
      classCount: 0,
      examCount: 0,
      questionCount: 0
    };
  }

  async deleteCourse(teacherId, courseId) {
    const course = await Course.findByPk(courseId);
    if (!course) {
      throw new Error('Khóa học không tìm thấy');
    }

    const classCount = await Class.count({ where: { course_id: courseId } });
    if (classCount > 0) {
      throw new Error('Không thể xóa khóa học đã có lớp học');
    }

    await course.destroy();
    return { success: true };
  }
}

export default new CourseService();
