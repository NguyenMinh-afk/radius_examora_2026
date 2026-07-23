/**
 * Question Controller
 */
import questionService from '../services/question.service.js';

const getEventContext = (req) => ({
  traceId: req.correlationId,
  requestId: req.requestId,
});

export const getQuestions = async (req, res) => {
  try {
    const {
      search,
      courseId,
      chapterId,
      tagId,
      difficulty,
      questionType,
      limit = 50,
      offset = 0,
    } = req.query;
    const data = await questionService.getQuestions({
      search,
      courseId,
      chapterId,
      tagId,
      difficulty,
      questionType,
      limit: parseInt(limit, 10),
      offset: parseInt(offset, 10),
    });
    return res.json(data);
  } catch (error) {
    console.error('[Question] getQuestions error:', error);
    return res.status(500).json({ error: error.message });
  }
};

export const getQuestionById = async (req, res) => {
  try {
    const { id } = req.params;
    const data = await questionService.getQuestionById(id);
    return res.json(data);
  } catch (error) {
    const status = error.message?.includes('not found') ? 404 : 500;
    return res.status(status).json({ error: error.message });
  }
};

export const createQuestion = async (req, res) => {
  try {
    const data = await questionService.createQuestion(req.user.id, req.body, getEventContext(req));
    return res.status(201).json(data);
  } catch (error) {
    console.error('[Question] createQuestion error:', error);
    return res.status(500).json({ error: error.message });
  }
};

export const updateQuestion = async (req, res) => {
  try {
    const { id } = req.params;
    const data = await questionService.updateQuestion(
      id,
      req.user.id,
      req.body,
      getEventContext(req)
    );
    return res.json(data);
  } catch (error) {
    const status = error.message?.includes('not found') ? 404 : 500;
    return res.status(status).json({ error: error.message });
  }
};

export const deleteQuestion = async (req, res) => {
  try {
    const { id } = req.params;
    await questionService.deleteQuestion(id, req.user.id, getEventContext(req));
    return res.json({ success: true });
  } catch (error) {
    const status = error.message?.includes('not found') ? 404 : 500;
    return res.status(status).json({ error: error.message });
  }
};
