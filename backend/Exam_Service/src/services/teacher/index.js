/**
 * Teacher Services Index
 * Export all teacher-related services
 */

import dashboardService from './dashboard.service.js';
import courseService from './course.service.js';
import classService from './class.service.js';
import postService from './post.service.js';
import assignmentService from './assignment.service.js';
import profileService from './profile.service.js';
import resultService from './result.service.js';
import examService from './exam.service.js';
import questionService from './question.service.js';

export {
  dashboardService,
  courseService,
  classService,
  postService,
  assignmentService,
  profileService,
  resultService,
  examService,
  questionService
};

export default {
  dashboard: dashboardService,
  course: courseService,
  class: classService,
  post: postService,
  assignment: assignmentService,
  profile: profileService,
  result: resultService,
  exam: examService,
  question: questionService
};
