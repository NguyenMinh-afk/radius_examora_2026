/**
 * AI Controller
 */
import aiService from "../services/ai.service.js";

export const generateQuestions = async (req, res) => {
  try {
    const data = await aiService.createGenerationRequest(req.user.id, req.body);
    return res.status(202).json(data);
  } catch (error) {
    console.error("[AI Controller] generateQuestions error:", error.message);
    return res.status(500).json({ error: error.message });
  }
};

export const getRequestStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const data = await aiService.getRequestStatus(id, req.user.id);
    return res.json(data);
  } catch (error) {
    const status = error.message?.includes("not found") ? 404 : 500;
    return res.status(status).json({ error: error.message });
  }
};

export const getMyRequests = async (req, res) => {
  try {
    const { limit = 20 } = req.query;
    const data = await aiService.getMyRequests(req.user.id, parseInt(limit, 10));
    return res.json(data);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

export default {
  generateQuestions,
  getRequestStatus,
  getMyRequests,
};
