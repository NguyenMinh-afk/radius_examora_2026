import express from "express";

import {
  getMyNotifications,
  markAllNotificationsAsRead,
  markNotificationAsRead,
} from "../controllers/notification.controller.js";
import { requireAuth } from "../middlewares/auth.middleware.js";

const router = express.Router();

router.use(requireAuth);

router.get("/", getMyNotifications);
router.patch("/read-all", markAllNotificationsAsRead);
router.patch("/:id/read", markNotificationAsRead);

export default router;
