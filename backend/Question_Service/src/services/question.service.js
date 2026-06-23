/**
 * Question Service - Business logic cho Question Module
 */
import { Question, Answer, QuestionTag, QuestionTagRelation } from "../models/index.js";

class QuestionService {

  async getQuestions({ search, chapterId, tagId, limit = 50, offset = 0 } = {}) {
    const where = {};
    if (search) {
      where[Question.sequelize.Sequelize.Op.or] = [
        { content: { [Question.sequelize.Sequelize.Op.iLike]: `%${search}%` } },
      ];
    }
    if (chapterId) {
      where.chapter_id = chapterId;
    }

    const { rows, count } = await Question.findAndCountAll({
      where,
      include: [
        { model: Answer, as: "answers" },
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
        answers: q.answers?.map((a) => ({
          id: a.id,
          content: a.content,
          isCorrect: a.is_correct,
        })) || [],
        createdAt: q.created_at,
      })),
      total: count,
    };
  }

  async getQuestionById(id) {
    const question = await Question.findByPk(id, {
      include: [
        { model: Answer, as: "answers" },
        { model: QuestionTag, as: "tags" },
      ],
    });
    if (!question) {
      throw new Error("Question not found");
    }
    return question;
  }

  async createQuestion(userId, data) {
    const { content, questionType, difficulty, chapterId, knowledgeUnitId, answers, tagIds } = data;

    const question = await Question.create({
      content,
      question_type: questionType,
      difficulty: difficulty || "medium",
      chapter_id: chapterId || null,
      knowledge_unit_id: knowledgeUnitId || null,
      created_by: userId,
    });

    if (answers?.length) {
      const answerRecords = answers.map((a) => ({
        question_id: question.id,
        content: a.content,
        is_correct: a.isCorrect || false,
      }));
      await Answer.bulkCreate(answerRecords);
    }

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

    await question.update({
      content: data.content || question.content,
      question_type: data.questionType || question.question_type,
      difficulty: data.difficulty || question.difficulty,
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
