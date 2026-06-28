/**
 * Admin AI Job Controller
 */
import { getPagination, paginationResponse, safeFindAndCountAll } from "./admin.helpers.js";
import { AIJob } from "../../models/index.js";

export const getAdminAIJobs = async (req, res) => {
  try {
    const { page, limit, offset } = getPagination(req.query);
    const status = String(req.query.status || "").trim().toUpperCase();
    const traceId = String(req.query.trace_id || "").trim();
    const where = {};

    if (status) where.status = status;
    if (traceId) where.trace_id = traceId;

    const result = await safeFindAndCountAll(AIJob, {
      where,
      order: [["created_at", "DESC"]],
      limit,
      offset,
    });

    return res.json({
      ai_jobs: result.rows,
      pagination: paginationResponse({ page, limit, total: result.count }),
    });
  } catch (error) {
    return res.json({
      ai_jobs: [],
      pagination: paginationResponse({ page, limit: 10, total: 0 }),
    });
  }
};

export const getAdminAIJobById = async (req, res) => {
  try {
    const aiJob = await AIJob.findByPk(req.params.id);
    if (!aiJob) return res.status(404).json({ message: "AI job not found" });
    return res.json({ ai_job: aiJob });
  } catch (error) {
    return res.status(404).json({ message: "AI job not found" });
  }
};
