/**
 * Admin Dashboard Controller
 */
import { safeCount } from "./admin.helpers.js";
import { AIJob, Course, QueueJob, User } from "../../models/index.js";

export const getAdminDashboard = async (_req, res) => {
  try {
    const [totalUsers, activeUsers, totalCourses, activeCourses, pendingAIJobs, runningAIJobs, failedAIJobs, queuedJobs, failedQueueJobs] = await Promise.all([
      safeCount(User),
      safeCount(User, { is_active: true }),
      safeCount(Course),
      safeCount(Course, { is_active: true }),
      safeCount(AIJob, { status: "PENDING" }),
      safeCount(AIJob, { status: "RUNNING" }),
      safeCount(AIJob, { status: "FAILED" }),
      safeCount(QueueJob, { status: "queued" }),
      safeCount(QueueJob, { status: "failed" }),
    ]);

    return res.json({
      users: { total: totalUsers, active: activeUsers },
      courses: { total: totalCourses, active: activeCourses },
      ai_jobs: { pending: pendingAIJobs, running: runningAIJobs, failed: failedAIJobs },
      queue_jobs: { queued: queuedJobs, failed: failedQueueJobs },
    });
  } catch (error) {
    return res.status(500).json({ message: "Failed to fetch dashboard", error: error.message });
  }
};
