/**
 * Question Service - Business logic cho Question Module
 */
import { sequelize, Question, QuestionTag, QuestionTagRelation } from '../models/index.js';
import {
  enqueueQuestionCreated,
  enqueueQuestionDeleted,
  enqueueQuestionUpdated,
} from '../config/outbox.js';

class QuestionService {
  // Helper: Parse options JSON to answers array
  // Supports both array format [{key, text, is_correct}] and object format {A: "...", B: "..."}
  parseOptionsToAnswers(options, correctAnswer = null) {
    if (!options) return [];

    // Handle object format: { "A": "...", "B": "...", ... }
    if (typeof options === 'object' && !Array.isArray(options)) {
      const keys = Object.keys(options).sort();
      return keys.map((key, index) => ({
        id: key,
        content: options[key] || '',
        isCorrect: correctAnswer ? correctAnswer.toUpperCase().split(',').includes(key.toUpperCase()) : false,
      }));
    }

    // Handle array format
    if (!Array.isArray(options)) return [];
    return options.map((opt, index) => ({
      id: opt.key || String.fromCharCode(65 + index),
      content: opt.text || opt.content || '',
      isCorrect: correctAnswer ? correctAnswer.toUpperCase().split(',').map(a => a.trim()).includes(String.fromCharCode(65 + index).toUpperCase()) : opt.is_correct === true,
    }));
  }

  // Helper: Convert answers array to options JSON format
  answersToOptions(answers) {
    return answers.map((a, index) => ({
      key: String.fromCharCode(65 + index), // A, B, C, D...
      text: a.content,
      is_correct: a.isCorrect === true,
    }));
  }

  // Helper: Get correct answer keys from options
  getCorrectAnswerKeys(options) {
    if (!options || !Array.isArray(options)) return 'A';
    const correctOnes = options.filter((o) => o.is_correct === true);
    if (correctOnes.length === 0) return 'A';
    return correctOnes.map((o) => o.key || 'A').join(',');
  }

  async getQuestions({
    search,
    courseId,
    chapterId,
    tagId,
    difficulty,
    questionType,
    isAiGenerated,
    limit = 50,
    offset = 0,
  } = {}) {
    const where = {};
    if (search) {
      where[Question.sequelize.Sequelize.Op.or] = [
        { content: { [Question.sequelize.Sequelize.Op.iLike]: `%${search}%` } },
      ];
    }
    if (courseId) {
      where.course_id = courseId;
    }
    if (chapterId) {
      where.chapter_id = chapterId;
    }
    if (difficulty) {
      where.difficulty = difficulty;
    }
    if (questionType) {
      where.question_type = questionType;
    }
    if (isAiGenerated !== undefined) {
      where.is_ai_generated = isAiGenerated === true || isAiGenerated === 'true';
    }

    const { rows, count } = await Question.findAndCountAll({
      where,
      include: [{ model: QuestionTag, as: 'tags' }],
      order: [['created_at', 'DESC']],
      limit,
      offset,
    });

    return {
      items: rows.map((q) => ({
        id: q.id,
        content: q.content,
        questionType: q.question_type,
        difficulty: q.difficulty,
        chapterId: q.chapter_id,
        tags: q.tags?.map((t) => ({ id: t.id, name: t.name })) || [],
        answers: this.parseOptionsToAnswers(q.options, q.correct_answer),
        isAiGenerated: q.is_ai_generated || false,
        createdAt: q.created_at,
      })),
      total: count,
    };
  }

  async getQuestionById(id, transaction) {
    const question = await Question.findByPk(id, {
      include: [{ model: QuestionTag, as: 'tags' }],
      transaction,
    });
    if (!question) {
      throw new Error('Question not found');
    }
    return {
      id: question.id,
      content: question.content,
      questionType: question.question_type,
      difficulty: question.difficulty,
      chapterId: question.chapter_id,
      tags: question.tags?.map((t) => ({ id: t.id, name: t.name })) || [],
      answers: this.parseOptionsToAnswers(question.options, question.correct_answer),
      createdAt: question.created_at,
    };
  }

  async createQuestion(userId, data, eventContext = {}) {
    const { content, questionType, difficulty, chapterId, knowledgeUnitId, answers, tagIds } = data;

    const options = this.answersToOptions(answers || []);
    const correctAnswer = this.getCorrectAnswerKeys(options);

    return sequelize.transaction(async (transaction) => {
      const question = await Question.create(
        {
          content,
          question_type: questionType,
          difficulty: difficulty || 'medium',
          chapter_id: chapterId || null,
          knowledge_unit_id: knowledgeUnitId || null,
          created_by: userId,
          options: options,
          correct_answer: correctAnswer,
        },
        { transaction }
      );

      if (tagIds?.length) {
        const relations = tagIds.map((tagId) => ({
          question_id: question.id,
          tag_id: tagId,
        }));
        await QuestionTagRelation.bulkCreate(relations, { transaction });
      }

      const result = await this.getQuestionById(question.id, transaction);
      await enqueueQuestionCreated(result, userId, eventContext, transaction);
      return result;
    });
  }

  async updateQuestion(id, userId, data, eventContext = {}) {
    return sequelize.transaction(async (transaction) => {
      const question = await Question.findByPk(id, { transaction });
      if (!question) throw new Error('Question not found');

      let options, correctAnswer;
      if (data.answers) {
        options = this.answersToOptions(data.answers);
        correctAnswer = this.getCorrectAnswerKeys(options);
      } else {
        options = question.options;
        correctAnswer = question.correct_answer;
      }

      await question.update(
        {
          content: data.content || question.content,
          question_type: data.questionType || question.question_type,
          difficulty: data.difficulty || question.difficulty,
          options: options,
          correct_answer: correctAnswer,
        },
        { transaction }
      );

      const result = await this.getQuestionById(id, transaction);
      await enqueueQuestionUpdated(
        result,
        userId,
        Object.keys(data || {}),
        eventContext,
        transaction
      );
      return result;
    });
  }

  async deleteQuestion(id, userId, eventContext = {}) {
    return sequelize.transaction(async (transaction) => {
      const question = await Question.findByPk(id, { transaction });
      if (!question) throw new Error('Question not found');
      await question.destroy({ transaction });
      await enqueueQuestionDeleted(id, userId, eventContext, transaction);
    });
  }
}

export default new QuestionService();
