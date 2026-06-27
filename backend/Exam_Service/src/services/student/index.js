/**
 * Student Services Index
 * Export all student-related services
 */

import dashboardService from './dashboard.service.js';
import classService from './class.service.js';
import assignmentService from './assignment.service.js';
import resultService from './result.service.js';
import postService from './post.service.js';

export {
  dashboardService,
  classService,
  assignmentService,
  resultService,
  postService
};

export default {
  dashboard: dashboardService,
  class: classService,
  assignment: assignmentService,
  result: resultService,
  post: postService
};
