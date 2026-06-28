/**
 * Student Services Index
 * Export all student-related services
 */

import dashboardService from './dashboard.service.js';
import classService from './class.service.js';
import assignmentService from './assignment.service.js';
import resultService from './result.service.js';
import postService from './post.service.js';
import settingsService, { getProfile, updateProfile, getNotificationSettings, updateNotificationSettings, changePassword } from './settings.service.js';

export {
  dashboardService,
  classService,
  assignmentService,
  resultService,
  postService,
  settingsService,
  getProfile,
  updateProfile,
  getNotificationSettings,
  updateNotificationSettings,
  changePassword,
};

export default {
  dashboard: dashboardService,
  class: classService,
  assignment: assignmentService,
  result: resultService,
  post: postService,
  settings: settingsService,
};
