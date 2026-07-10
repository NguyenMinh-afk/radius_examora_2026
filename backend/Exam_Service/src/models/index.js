/**
 * Models index cho Exam_Service
 * Chỉ chứa các model thuộc domain exam/class/assignment/attempt/student progress
 * User/Role/Profile nằm ở User_Service
 */
import sequelize from '../config/sequelize.js';

// ============ User Model (cross-schema từ user_db) ============
import User from './user/User.js';

// ============ Exam Models ============
import Exam from './exam/Exam.js';
import ExamQuestion from './exam/ExamQuestion.js';
import ExamSubmission from './exam/ExamSubmission.js';
import ExamAssignment from './exam/ExamAssignment.js';
import Submission from './exam/Submission.js';
import SubmissionAnswer from './exam/SubmissionAnswer.js';
import Attempt from './exam/Attempt.js';
import AttemptAnswer from './exam/AttemptAnswer.js';

// ============ Class Models ============
import Class from './class/Class.js';
import ClassMember from './class/ClassMember.js';
import ClassPost from './class/ClassPost.js';

// ============ Student progress mapping (chỉ phần gắn với exam) ============
import StudentAssignment from './user/StudentAssignment.js';
import StudentProgress from './user/StudentProgress.js';
import UserProfile from './user/UserProfile.js';

// ============ Course Model (cross-schema từ course_db) ============
import Course from './course/Course.js';

// ============ Associations ============
// ExamAssignment - Class
ExamAssignment.belongsTo(Class, { foreignKey: 'class_id', as: 'class' });
Class.hasMany(ExamAssignment, { foreignKey: 'class_id', as: 'examAssignments' });

// ExamAssignment - Exam
ExamAssignment.belongsTo(Exam, { foreignKey: 'exam_id', as: 'exam' });
Exam.hasMany(ExamAssignment, { foreignKey: 'exam_id', as: 'examAssignments' });

// StudentAssignment - ExamAssignment
StudentAssignment.belongsTo(ExamAssignment, { foreignKey: 'assignment_id', as: 'assignment' });
ExamAssignment.hasMany(StudentAssignment, { foreignKey: 'assignment_id', as: 'studentAssignments' });

// ExamAssignment - ExamQuestion (to get questions for an assignment)
ExamAssignment.hasMany(ExamQuestion, { foreignKey: 'exam_id', as: 'examQuestions', sourceKey: 'exam_id' });
ExamQuestion.belongsTo(ExamAssignment, { foreignKey: 'exam_id', as: 'assignment' });

// Submission - Exam
Submission.belongsTo(Exam, { foreignKey: 'exam_id', as: 'exam' });
Exam.hasMany(Submission, { foreignKey: 'exam_id', as: 'submissions' });

// SubmissionAnswer - Submission
SubmissionAnswer.belongsTo(Submission, { foreignKey: 'submission_id', as: 'submission' });
Submission.hasMany(SubmissionAnswer, { foreignKey: 'submission_id', as: 'answers' });

// Attempt - ExamAssignment
Attempt.belongsTo(ExamAssignment, { foreignKey: 'assignment_id', as: 'assignment' });
ExamAssignment.hasMany(Attempt, { foreignKey: 'assignment_id', as: 'attempts' });

// ClassMember - Class
ClassMember.belongsTo(Class, { foreignKey: 'class_id', as: 'class' });
Class.hasMany(ClassMember, { foreignKey: 'class_id', as: 'members' });

// ClassPost - Class
ClassPost.belongsTo(Class, { foreignKey: 'class_id', as: 'class' });
Class.hasMany(ClassPost, { foreignKey: 'class_id', as: 'posts' });

// ClassPost - User (author)
ClassPost.belongsTo(User, { foreignKey: 'author_id', as: 'author' });
User.hasMany(ClassPost, { foreignKey: 'author_id', as: 'posts' });

// ClassMember - User (user là thành viên lớp)
ClassMember.belongsTo(User, { foreignKey: 'user_id', as: 'user' });
User.hasMany(ClassMember, { foreignKey: 'user_id', as: 'classMemberships' });

// Class - User (giáo viên)
Class.belongsTo(User, { foreignKey: 'teacher_id', as: 'teacher' });
User.hasMany(Class, { foreignKey: 'teacher_id', as: 'teachingClasses' });

// ExamAssignment - User (assigned by)
ExamAssignment.belongsTo(User, { foreignKey: 'assigned_by', as: 'assignee' });
User.hasMany(ExamAssignment, { foreignKey: 'assigned_by', as: 'assignedExams' });

// Exam - User (created by)
Exam.belongsTo(User, { foreignKey: 'created_by', as: 'creator' });
User.hasMany(Exam, { foreignKey: 'created_by', as: 'createdExams' });

// Attempt - Class (through ExamAssignment)
Attempt.belongsTo(Class, { foreignKey: 'assignment_id', as: 'class', through: { model: ExamAssignment, attributes: [] } });

// Attempt - User (student)
Attempt.belongsTo(User, { foreignKey: 'student_id', as: 'student' });
User.hasMany(Attempt, { foreignKey: 'student_id', as: 'attempts' });

// StudentAssignment - User (student)
StudentAssignment.belongsTo(User, { foreignKey: 'student_id', as: 'student' });
User.hasMany(StudentAssignment, { foreignKey: 'student_id', as: 'studentAssignments' });

// Class - Course
Class.belongsTo(Course, { foreignKey: 'course_id', as: 'course' });
Course.hasMany(Class, { foreignKey: 'course_id', as: 'classes' });

// UserProfile - User
UserProfile.belongsTo(User, { foreignKey: 'user_id', as: 'user' });
User.hasOne(UserProfile, { foreignKey: 'user_id', as: 'profile' });

// AttemptAnswer - Attempt
AttemptAnswer.belongsTo(Attempt, { foreignKey: 'attempt_id', as: 'attempt' });
Attempt.hasMany(AttemptAnswer, { foreignKey: 'attempt_id', as: 'answers' });

// ============ Export ============
export {
  sequelize,
  Exam,
  ExamQuestion,
  ExamSubmission,
  ExamAssignment,
  Submission,
  SubmissionAnswer,
  Attempt,
  AttemptAnswer,
  Class,
  ClassMember,
  ClassPost,
  StudentAssignment,
  StudentProgress,
  User,
  UserProfile,
  Course,
};
