/**
 * Teacher Exam Service
 */
import { Op } from 'sequelize';
import { sequelize, Exam, ExamQuestion, ExamAssignment } from '../../models/index.js';
import { enqueueExamCreated, enqueueExamDeleted, enqueueExamUpdated } from '../../config/outbox.js';

class ExamService {
  async getExams(teacherId, filters = {}) {
    const where = { created_by: teacherId };

    if (filters.search) {
      where.title = { [Op.like]: `%${filters.search}%` };
    }

    const exams = await Exam.findAll({
      where,
      order: [['created_at', 'DESC']],
    });

    const result = [];
    for (const exam of exams) {
      const questionCount = await ExamQuestion.count({
        where: { exam_id: exam.id },
      });

      result.push({
        examId: exam.id,
        title: exam.title,
        description: exam.description || '',
        courseId: null,
        courseName: '',
        questionCount,
        duration: exam.duration || 0,
        totalPoints: parseFloat(exam.total_points) || 0,
        passingScore: parseFloat(exam.passing_score) || 0,
        published: exam.is_public,
        createdAt: exam.created_at?.toISOString() || '',
      });
    }

    return result;
  }

  async getExamDetail(teacherId, examId) {
    const exam = await Exam.findOne({
      where: { id: examId, created_by: teacherId },
    });
    if (!exam) {
      throw new Error('Đề thi không tìm thấy');
    }

    const examQuestions = await ExamQuestion.findAll({
      where: { exam_id: examId },
      order: [['question_order', 'ASC']],
    });

    return {
      examId: exam.id,
      title: exam.title,
      description: exam.description || '',
      courseId: null,
      courseName: '',
      questionCount: examQuestions.length,
      duration: exam.duration || 60,
      totalPoints: parseFloat(exam.total_points) || 0,
      passingScore: parseFloat(exam.passing_score) || 0,
      published: exam.is_public,
      createdAt: exam.created_at?.toISOString() || '',
      questions: examQuestions.map((eq) => ({
        questionId: eq.question_id,
        order: eq.question_order,
        score: eq.points,
      })),
    };
  }

  async createExam(teacherId, data, eventContext = {}) {
    const { title, description, duration, totalPoints, passingScore } = data;

    return sequelize.transaction(async (transaction) => {
      const exam = await Exam.create(
        {
          title: title,
          description: description || null,
          created_by: teacherId,
          course_id: 0,
          duration: duration || 60,
          total_points: totalPoints || 100,
          passing_score: passingScore || 0,
          is_public: false,
        },
        { transaction }
      );

      const result = {
        examId: exam.id,
        title: exam.title,
        courseId: exam.course_id,
        courseName: '',
        questionCount: 0,
        duration: exam.duration,
        totalPoints: parseFloat(exam.total_points),
        passingScore: parseFloat(exam.passing_score) || 0,
        published: false,
        createdAt: exam.created_at?.toISOString() || '',
      };

      await enqueueExamCreated({ ...result, createdBy: teacherId }, eventContext, transaction);
      return result;
    });
  }

  async updateExam(teacherId, examId, data, eventContext = {}) {
    return sequelize.transaction(async (transaction) => {
      const exam = await Exam.findOne({
        where: { id: examId, created_by: teacherId },
        transaction,
      });
      if (!exam) {
        throw new Error('Đề thi không tìm thấy');
      }

      const updateData = {};
      if (data.title !== undefined) updateData.title = data.title;
      if (data.description !== undefined) updateData.description = data.description;
      if (data.duration !== undefined) updateData.duration = data.duration;
      if (data.totalPoints !== undefined) updateData.total_points = data.totalPoints;
      if (data.passingScore !== undefined) updateData.passing_score = data.passingScore;
      if (data.published !== undefined) updateData.is_public = data.published;

      if (Object.keys(updateData).length > 0) {
        await exam.update(updateData, { transaction });
      }

      const result = {
        examId: exam.id,
        title: exam.title,
        description: exam.description || '',
        courseId: null,
        courseName: '',
        questionCount: 0,
        duration: exam.duration,
        totalPoints: parseFloat(exam.total_points),
        passingScore: parseFloat(exam.passing_score) || 0,
        published: exam.is_public,
        createdAt: exam.created_at?.toISOString() || '',
      };

      await enqueueExamUpdated(result, Object.keys(data || {}), eventContext, transaction);
      return result;
    });
  }

  async deleteExam(teacherId, examId, eventContext = {}) {
    return sequelize.transaction(async (transaction) => {
      const exam = await Exam.findOne({
        where: { id: examId, created_by: teacherId },
        transaction,
      });
      if (!exam) {
        throw new Error('Đề thi không tìm thấy');
      }

      const assignmentCount = await ExamAssignment.count({
        where: { exam_id: examId },
        transaction,
      });
      if (assignmentCount > 0) {
        throw new Error('Không thể xóa đề thi đã được giao');
      }

      await ExamQuestion.destroy({
        where: { exam_id: examId },
        transaction,
      });

      await exam.destroy({ transaction });
      await enqueueExamDeleted(examId, teacherId, eventContext, transaction);

      return { success: true };
    });
  }
}

export default new ExamService();
