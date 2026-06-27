/**
 * Teacher Controllers Index
 * Export all teacher controllers
 */

// Dashboard
export { getDashboard } from './dashboard.controller.js';

// Course
export { getCourses, getCourseDetail, createCourse, updateCourse, deleteCourse } from './course.controller.js';

// Class
export { getClasses, getClassDetail, createClass, updateClass, deleteClass } from './class.controller.js';

// Assignment
export { getAssignments, getSchedule } from './assignment.controller.js';

// Post
export { getClassPosts, createClassPost, updateClassPost, deleteClassPost } from './post.controller.js';

// Result
export { getResults } from './result.controller.js';

// Profile
export { getProfile, updateProfile } from './profile.controller.js';

// Exam
export { getExams, getExamDetail, createExam, updateExam, deleteExam } from './exam.controller.js';

// Question
export { getExamQuestions, addExamQuestions, updateExamQuestion, removeExamQuestion } from './question.controller.js';
