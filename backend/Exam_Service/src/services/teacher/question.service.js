/**
 * Teacher Question Service - Exam Question Management
 */
import {
  Exam,
  ExamQuestion
} from '../../models/index.js';

class QuestionService {

  async getExamQuestions(teacherId, examId) {
    const exam = await Exam.findOne({
      where: { id: examId, created_by: teacherId }
    });
    if (!exam) {
      throw new Error('Đề thi không tìm thấy');
    }

    const examQuestions = await ExamQuestion.findAll({
      where: { exam_id: examId },
      order: [['question_order', 'ASC']]
    });

    return {
      examId: exam.id,
      title: exam.title,
      questions: examQuestions.map(eq => ({
        id: eq.id,
        questionId: eq.question_id,
        order: eq.question_order,
        points: parseFloat(eq.points) || 1.0,
        timeLimit: eq.time_limit,
        isRequired: eq.is_required
      }))
    };
  }

  async addExamQuestions(teacherId, examId, { questionIds, defaultPoints = 1.0 }) {
    const exam = await Exam.findOne({
      where: { id: examId, created_by: teacherId }
    });
    if (!exam) {
      throw new Error('Đề thi không tìm thấy');
    }

    const maxOrderResult = await ExamQuestion.findOne({
      where: { exam_id: examId },
      order: [['question_order', 'DESC']],
      attributes: ['question_order']
    });
    let nextOrder = (maxOrderResult?.question_order || 0) + 1;

    const newQuestions = questionIds.map(questionId => ({
      exam_id: examId,
      question_id: questionId,
      question_order: nextOrder++,
      points: defaultPoints,
      is_required: true
    }));

    await ExamQuestion.bulkCreate(newQuestions, { ignoreDuplicates: true });

    const totalPoints = await ExamQuestion.sum('points', { where: { exam_id: examId } });
    await exam.update({ total_points: totalPoints || 0 });

    return {
      success: true,
      addedCount: questionIds.length,
      totalQuestions: await ExamQuestion.count({ where: { exam_id: examId } })
    };
  }

  async updateExamQuestion(teacherId, examId, questionId, data) {
    const exam = await Exam.findOne({
      where: { id: examId, created_by: teacherId }
    });
    if (!exam) {
      throw new Error('Đề thi không tìm thấy');
    }

    const examQuestion = await ExamQuestion.findOne({
      where: { exam_id: examId, question_id: questionId }
    });
    if (!examQuestion) {
      throw new Error('Câu hỏi không tìm thấy trong đề thi');
    }

    const updateData = {};
    if (data.order !== undefined) updateData.question_order = data.order;
    if (data.points !== undefined) updateData.points = data.points;
    if (data.timeLimit !== undefined) updateData.time_limit = data.timeLimit;
    if (data.isRequired !== undefined) updateData.is_required = data.isRequired;

    if (Object.keys(updateData).length > 0) {
      await examQuestion.update(updateData);
    }

    const totalPoints = await ExamQuestion.sum('points', { where: { exam_id: examId } });
    await exam.update({ total_points: totalPoints || 0 });

    return {
      success: true,
      questionId: questionId,
      order: examQuestion.question_order,
      points: parseFloat(examQuestion.points) || 1.0
    };
  }

  async removeExamQuestion(teacherId, examId, questionId) {
    const exam = await Exam.findOne({
      where: { id: examId, created_by: teacherId }
    });
    if (!exam) {
      throw new Error('Đề thi không tìm thấy');
    }

    const deleted = await ExamQuestion.destroy({
      where: { exam_id: examId, question_id: questionId }
    });
    if (deleted === 0) {
      throw new Error('Câu hỏi không tìm thấy trong đề thi');
    }

    const totalPoints = await ExamQuestion.sum('points', { where: { exam_id: examId } });
    await exam.update({ total_points: totalPoints || 0 });

    const remaining = await ExamQuestion.findAll({
      where: { exam_id: examId },
      order: [['question_order', 'ASC']]
    });
    for (let i = 0; i < remaining.length; i++) {
      await remaining[i].update({ question_order: i + 1 });
    }

    return { success: true };
  }
}

export default new QuestionService();
