/**
 * Admin Helpers - Utility functions cho admin controllers
 */
import { Op } from "../../models/index.js";

const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export const parsePositiveInt = (value, fallback, max) => {
  const parsed = Number.parseInt(value, 10);
  if (!Number.isFinite(parsed) || parsed < 1) return fallback;
  return max ? Math.min(parsed, max) : parsed;
};

export const parseBooleanFilter = (value) => {
  if (value === undefined) return undefined;
  if (value === "true") return true;
  if (value === "false") return false;
  return undefined;
};

export const getPagination = (query) => {
  const page = parsePositiveInt(query.page, 1);
  const limit = parsePositiveInt(query.limit, 10, 100);
  return { page, limit, offset: (page - 1) * limit };
};

export const paginationResponse = ({ page, limit, total }) => ({
  page,
  limit,
  total,
  totalPages: Math.ceil(total / limit),
});

export const getClientIp = (req) =>
  req.headers["x-forwarded-for"]?.split(",")[0]?.trim() || req.socket?.remoteAddress || null;

export const toSafeEntityId = (id) => (UUID_PATTERN.test(String(id)) ? id : null);

export const safeCount = async (model, where = {}) => {
  try {
    return await model.count({ where });
  } catch {
    return 0;
  }
};

export const safeFindAndCountAll = async (model, options) => {
  try {
    return await model.findAndCountAll(options);
  } catch {
    return { rows: [], count: 0 };
  }
};

export const BROADCAST_TARGETS = {
  all: null,
  teacher: ["teacher", "lecturer", "giang_vien", "faculty"],
  student: ["student", "sinh_vien"],
};

export { UUID_PATTERN, Op };
