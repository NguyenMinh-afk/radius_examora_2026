/**
 * Student Controllers Index
 * Export all student controllers
 */

// Dashboard
export { getDashboard } from './dashboard.controller.js';

// Class
export { getClasses, getClassDetail, joinClass } from './class.controller.js';

// Assignment
export { getAssignments } from './assignment.controller.js';

// Result
export { getResults } from './result.controller.js';

// Post
export { getClassPosts } from './post.controller.js';
// Settings
export { getProfile, updateProfile, getNotificationSettings, updateNotificationSettings, changePassword } from './settings.controller.js';

