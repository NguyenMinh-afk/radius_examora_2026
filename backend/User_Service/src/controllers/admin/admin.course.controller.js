/**
 * Admin Course Controller
 */
import { Op } from "../../models/index.js";
import { getPagination, paginationResponse, parseBooleanFilter, writeAuditLog } from "./admin.shared.js";

export const getAdminCourses = async (req, res) => {
  try {
    const { page, limit, offset } = getPagination(req.query);
    const search = String(req.query.search || "").trim();
    const isActive = parseBooleanFilter(req.query.is_active);
    const facultyId = req.query.faculty_id ? Number.parseInt(req.query.faculty_id, 10) : undefined;

    const where = {};
    if (search) {
      where[Op.or] = [
        { name: { [Op.iLike]: `%${search}%` } },
        { code: { [Op.iLike]: `%${search}%` } },
        { description: { [Op.iLike]: `%${search}%` } },
      ];
    }
    if (isActive !== undefined) where.is_active = isActive;
    if (Number.isInteger(facultyId)) where.faculty_id = facultyId;

    const { Course } = await import("../../models/index.js");
    const result = await Course.findAndCountAll({
      where,
      order: [["created_at", "DESC"]],
      limit,
      offset,
    });

    return res.json({
      courses: result.rows,
      pagination: paginationResponse({ page, limit, total: result.count }),
    });
  } catch (error) {
    return res.status(500).json({ message: "Failed to fetch courses", error: error.message });
  }
};

export const getAdminCourseById = async (req, res) => {
  try {
    const { Course } = await import("../../models/index.js");
    const course = await Course.findByPk(req.params.id);
    if (!course) return res.status(404).json({ message: "Course not found" });
    return res.json({ course });
  } catch (error) {
    return res.status(500).json({ message: "Failed to fetch course", error: error.message });
  }
};

export const updateAdminCourseStatus = async (req, res) => {
  try {
    if (typeof req.body.is_active !== "boolean") {
      return res.status(400).json({ message: "is_active must be boolean" });
    }

    const { Course } = await import("../../models/index.js");
    const course = await Course.findByPk(req.params.id);
    if (!course) return res.status(404).json({ message: "Course not found" });

    await course.update({ is_active: req.body.is_active });
    await writeAuditLog(req, {
      action: "admin.course.update_status",
      entityType: "course",
      entityId: null,
      metadata: { course_id: course.id, is_active: req.body.is_active },
    });

    return res.json({ message: "Course status updated", course });
  } catch (error) {
    return res.status(500).json({ message: "Failed to update course status", error: error.message });
  }
};

export const updateAdminCourseTeachers = async (_req, res) =>
  res.status(501).json({
    message: "Course teacher assignment requires a course_teachers table or equivalent relation.",
  });
