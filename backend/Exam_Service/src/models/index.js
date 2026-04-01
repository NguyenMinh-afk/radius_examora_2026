/**
 * Khởi tạo Sequelize, import và thiết lập các model, associations
 * @module models/index
 */
const User = require('./User');
const Role = require('./Role');
const UserProfile = require('./UserProfile');
const TeacherProfile = require('./TeacherProfile');
const StudentProfile = require('./user/StudentProfile');
const UserSession = require('./UserSession');
const Question = require('./question/Question');
const Exam = require('./exam/Exam');
const ExamQuestion = require('./exam/ExamQuestion');
const ExamSubmission = require('./exam/ExamSubmission');
const Answer = require('./question/Answer');
const Submission = require('./exam/Submission');
const SubmissionAnswer = require('./exam/SubmissionAnswer');
const School = require('./core/School');
const Subject = require('./core/Subject');
const LearningPath = require('./activity/LearningPath');
const LearningPathStep = require('./activity/LearningPathStep');
const StudentAssignment = require('./user/StudentAssignment');
const StudentProgress = require('./user/StudentProgress');
const SystemAnalytics = require('./system/SystemAnalytics');
const UserAchievement = require('./UserAchievement');
const Achievement = require('./Achievement');
const Chapter = require('./core/Chapter');
const KnowledgeUnit = require('./core/KnowledgeUnit');
const QuestionTag = require('./question/QuestionTag');
const QuestionTagRelation = require('./question/QuestionTagRelation');
const QuestionVersion = require('./question/QuestionVersion');
const AIGenerationRequest = require('./ai/AIGenerationRequest');
const AIGenerationLog = require('./ai/AIGenerationLog');
const OAuthProvider = require('./user/OAuthProvider');
const VerificationToken = require('./user/VerificationToken');
const PasswordResetToken = require('./user/PasswordResetToken');
const { Op } = require('sequelize');
// Chapters, KnowledgeUnits, Tags, Versions
Chapter.belongsTo(Subject, { foreignKey: 'subject_id', as: 'subject' });
Subject.hasMany(Chapter, { foreignKey: 'subject_id', as: 'chapters' });
KnowledgeUnit.belongsTo(Chapter, { foreignKey: 'chapter_id', as: 'chapter' });
Chapter.hasMany(KnowledgeUnit, { foreignKey: 'chapter_id', as: 'knowledgeUnits' });

Question.belongsTo(Chapter, { foreignKey: 'chapter_id', as: 'chapter' });
Question.belongsTo(KnowledgeUnit, { foreignKey: 'knowledge_unit_id', as: 'knowledgeUnit' });

Question.belongsToMany(QuestionTag, { through: QuestionTagRelation, foreignKey: 'question_id', otherKey: 'tag_id', as: 'tags' });
QuestionTag.belongsToMany(Question, { through: QuestionTagRelation, foreignKey: 'tag_id', otherKey: 'question_id', as: 'questions' });

QuestionVersion.belongsTo(Question, { foreignKey: 'question_id', as: 'question' });
Question.hasMany(QuestionVersion, { foreignKey: 'question_id', as: 'versions' });

// AI Generation
AIGenerationRequest.belongsTo(User, { foreignKey: 'user_id', as: 'user' });
AIGenerationRequest.belongsTo(Subject, { foreignKey: 'subject_id', as: 'subject' });
AIGenerationRequest.belongsTo(Chapter, { foreignKey: 'chapter_id', as: 'chapter' });
AIGenerationRequest.belongsTo(KnowledgeUnit, { foreignKey: 'knowledge_unit_id', as: 'knowledgeUnit' });
AIGenerationLog.belongsTo(AIGenerationRequest, { foreignKey: 'request_id', as: 'request' });
AIGenerationLog.belongsTo(Question, { foreignKey: 'question_id', as: 'question' });

// OAuth, Verification, PasswordReset
OAuthProvider.belongsTo(User, { foreignKey: 'user_id', as: 'user' });
VerificationToken.belongsTo(User, { foreignKey: 'user_id', as: 'user' });
PasswordResetToken.belongsTo(User, { foreignKey: 'user_id', as: 'user' });


const sequelize = require('../config/sequelize');

// Associations (user, role, profile, session)
User.belongsTo(Role, { foreignKey: 'role_id', as: 'role' });
Role.hasMany(User, { foreignKey: 'role_id', as: 'users' });
User.hasOne(UserProfile, { foreignKey: 'user_id', as: 'profile' });
UserProfile.belongsTo(User, { foreignKey: 'user_id' });
User.hasOne(TeacherProfile, { foreignKey: 'user_id', as: 'teacherProfile' });
TeacherProfile.belongsTo(User, { foreignKey: 'user_id' });
User.hasOne(StudentProfile, { foreignKey: 'user_id', as: 'studentProfile' });
StudentProfile.belongsTo(User, { foreignKey: 'user_id' });
User.hasMany(UserSession, { foreignKey: 'user_id', as: 'sessions' });
UserSession.belongsTo(User, { foreignKey: 'user_id' });

// Question, Answer, Exam, Submission associations
Question.belongsTo(User, { foreignKey: 'created_by', as: 'creator' });
User.hasMany(Question, { foreignKey: 'created_by', as: 'questions' });
Answer.belongsTo(Question, { foreignKey: 'question_id', as: 'question' });
Question.hasMany(Answer, { foreignKey: 'question_id', as: 'answers' });

Exam.belongsTo(User, { foreignKey: 'created_by', as: 'creator' });
User.hasMany(Exam, { foreignKey: 'created_by', as: 'exams' });
Exam.belongsToMany(Question, { through: ExamQuestion, foreignKey: 'exam_id', otherKey: 'question_id', as: 'questions' });
Question.belongsToMany(Exam, { through: ExamQuestion, foreignKey: 'question_id', otherKey: 'exam_id', as: 'exams' });

Submission.belongsTo(Exam, { foreignKey: 'exam_id', as: 'exam' });
Exam.hasMany(Submission, { foreignKey: 'exam_id', as: 'submissions' });
Submission.belongsTo(User, { foreignKey: 'user_id', as: 'user' });
User.hasMany(Submission, { foreignKey: 'user_id', as: 'submissions' });

SubmissionAnswer.belongsTo(Submission, { foreignKey: 'submission_id', as: 'submission' });
Submission.hasMany(SubmissionAnswer, { foreignKey: 'submission_id', as: 'answers' });
SubmissionAnswer.belongsTo(Question, { foreignKey: 'question_id', as: 'question' });
Question.hasMany(SubmissionAnswer, { foreignKey: 'question_id', as: 'submissionAnswers' });
SubmissionAnswer.belongsTo(Answer, { foreignKey: 'answer_id', as: 'answer' });
Answer.hasMany(SubmissionAnswer, { foreignKey: 'answer_id', as: 'submissionAnswers' });

// School, Subject associations (if needed)

module.exports = {
  sequelize,
  User,
  Role,
  UserProfile,
  TeacherProfile,
  StudentProfile,
  UserSession,
  Question,
  Exam,
  ExamQuestion,
  ExamSubmission,
  Answer,
  Submission,
  SubmissionAnswer,
  School,
  Subject,
  LearningPath,
  LearningPathStep,
  StudentAssignment,
  StudentProgress,
  SystemAnalytics,
  UserAchievement,
  Achievement,
  Chapter,
  KnowledgeUnit,
  QuestionTag,
  QuestionTagRelation,
  QuestionVersion,
  AIGenerationRequest,
  AIGenerationLog,
  OAuthProvider,
  VerificationToken,
  PasswordResetToken,
  Op,
};