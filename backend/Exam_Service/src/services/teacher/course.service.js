/**
 * Teacher Course Service
 */
import {
  Course,
  Class,
  Exam
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
      const examCount = await Exam.count({
        where: { created_by: teacherId }
      });
      result.push({
        courseId: course.id,
        name: course.name,
        code: course.code,
        description: course.description || '',
        credits: course.credits || 0,
        facultyName: '',
        classCount: classIds.length,
        examCount,
        questionCount: 0
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

    const examCount = await Exam.count({ where: { created_by: teacherId } });

    return {
      courseId: course.id,
      name: course.name,
      code: course.code,
      description: course.description || '',
      credits: course.credits || 0,
      semesterType: course.semester_type,
      facultyName: '',
      classCount: classes.length,
      examCount,
      questionCount: 0,
      classes: classes.map(c => ({
        classId: c.id,
        name: c.name,
        studentCount: 0
      }))
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
