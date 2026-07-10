/**
 * Question Service - Business logic cho Question Module
 */
import { Question, QuestionTag, QuestionTagRelation } from "../models/index.js";

class QuestionService {

  // Helper: Parse options JSON to answers array
  parseOptionsToAnswers(options) {
    if (!options || !Array.isArray(options)) return [];
    return options.map((opt, index) => ({
      id: opt.key || String.fromCharCode(65 + index), // A, B, C, D...
      content: opt.text || opt.content || '',
      isCorrect: opt.is_correct === true,
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
    const correctOnes = options.filter(o => o.is_correct === true);
    if (correctOnes.length === 0) return 'A';
    return correctOnes.map(o => o.key || 'A').join(',');
  }

  async getQuestions({ search, courseId, chapterId, tagId, difficulty, questionType, limit = 50, offset = 0 } = {}) {
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

    const { rows, count } = await Question.findAndCountAll({
      where,
      include: [
        { model: QuestionTag, as: "tags" },
      ],
      order: [["created_at", "DESC"]],
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
        answers: this.parseOptionsToAnswers(q.options),
        createdAt: q.created_at,
      })),
      total: count,
    };
  }

  async getQuestionById(id) {
    const question = await Question.findByPk(id, {
      include: [
        { model: QuestionTag, as: "tags" },
      ],
    });
    if (!question) {
      throw new Error("Question not found");
    }
    return {
      id: question.id,
      content: question.content,
      questionType: question.question_type,
      difficulty: question.difficulty,
      chapterId: question.chapter_id,
      tags: question.tags?.map((t) => ({ id: t.id, name: t.name })) || [],
      answers: this.parseOptionsToAnswers(question.options),
      createdAt: question.created_at,
    };
  }

  async createQuestion(userId, data) {
    const { content, questionType, difficulty, chapterId, knowledgeUnitId, answers, tagIds } = data;

    const options = this.answersToOptions(answers || []);
    const correctAnswer = this.getCorrectAnswerKeys(options);

    const question = await Question.create({
      content,
      question_type: questionType,
      difficulty: difficulty || "medium",
      chapter_id: chapterId || null,
      knowledge_unit_id: knowledgeUnitId || null,
      created_by: userId,
      options: options,
      correct_answer: correctAnswer,
    });

    if (tagIds?.length) {
      const relations = tagIds.map((tagId) => ({
        question_id: question.id,
        tag_id: tagId,
      }));
      await QuestionTagRelation.bulkCreate(relations);
    }

    return this.getQuestionById(question.id);
  }

  async updateQuestion(id, userId, data) {
    const question = await Question.findByPk(id);
    if (!question) throw new Error("Question not found");

    let options, correctAnswer;
    if (data.answers) {
      options = this.answersToOptions(data.answers);
      correctAnswer = this.getCorrectAnswerKeys(options);
    } else {
      options = question.options;
      correctAnswer = question.correct_answer;
    }

    await question.update({
      content: data.content || question.content,
      question_type: data.questionType || question.question_type,
      difficulty: data.difficulty || question.difficulty,
      options: options,
      correct_answer: correctAnswer,
    });

    return this.getQuestionById(id);
  }

  async deleteQuestion(id, userId) {
    const question = await Question.findByPk(id);
    if (!question) throw new Error("Question not found");
    await question.destroy();
  }
}

export default new QuestionService();
