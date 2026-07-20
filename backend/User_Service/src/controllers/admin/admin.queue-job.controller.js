/**
 * Admin Queue Job Controller
 */
import { getPagination, paginationResponse, safeFindAndCountAll } from "./admin.helpers.js";
import { QueueJob } from "../../models/index.js";

export const getAdminQueueJobs = async (req, res) => {
  try {
    const { page, limit, offset } = getPagination(req.query);
    const status = String(req.query.status || "").trim().toLowerCase();
    const queueName = String(req.query.queue_name || "").trim();
    const jobType = String(req.query.job_type || "").trim();
    const traceId = String(req.query.trace_id || "").trim();
    const where = {};

    if (status) where.status = status;
    if (queueName) where.queue_name = queueName;
    if (jobType) where.job_type = jobType;
    if (traceId) where.trace_id = traceId;

    const result = await safeFindAndCountAll(QueueJob, {
      where,
      order: [["created_at", "DESC"]],
      limit,
      offset,
    });

    return res.json({
      queue_jobs: result.rows,
      pagination: paginationResponse({ page, limit, total: result.count }),
    });
  } catch (error) {
    return res.json({
      queue_jobs: [],
      pagination: paginationResponse({ page: 1, limit: 10, total: 0 }),
    });
  }
};

export const getAdminQueueJobById = async (req, res) => {
  try {
    const queueJob = await QueueJob.findByPk(req.params.id);
    if (!queueJob) return res.status(404).json({ message: "Queue job not found" });
    return res.json({ queue_job: queueJob });
  } catch (error) {
    return res.status(404).json({ message: "Queue job not found" });
  }
};
