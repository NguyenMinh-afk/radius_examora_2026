/**
 * Models index cho User_Service
 * Chứa user/auth/profile models + admin models (Course, Question, Notification, AIJob, QueueJob, AuditLog, SystemEvent)
 * Các admin models sử dụng cross-schema (course_db, question_db, ai_db, notification_db, infra_observability, infra_eventing)
 */
import { DataTypes, Model, Op } from 'sequelize';
import sequelize from '../config/sequelize.js';

// ============ User Core Models (user_db) ============
import User from './User.js';
import Role from './Role.js';
import UserProfile from './UserProfile.js';
import UserSession from './UserSession.js';

// ============ Role-specific Profiles (user_db) ============
import StudentProfile from './user/StudentProfile.js';
import TeacherProfile from './TeacherProfile.js';

// ============ Auth Models (user_db) ============
import OAuthProvider from './user/OAuthProvider.js';
import VerificationToken from './user/VerificationToken.js';
import PasswordResetToken from './user/PasswordResetToken.js';

// ============ Admin Dashboard Models (cross-service) ============
import Course from './Course.js';           // course_db.courses
import Question from './Question.js';       // question_db.questions
import Notification from './Notification.js'; // notification_db.notifications
import AIJob from './AIJob.js';             // ai_db.ai_jobs
import QueueJob from './QueueJob.js';       // infra_eventing.queue_jobs
import AuditLog from './AuditLog.js';       // infra_observability.audit_logs
import SystemEvent from './SystemEvent.js';  // infra_observability.system_events

// ============ Associations (user_db only) ============
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

OAuthProvider.belongsTo(User, { foreignKey: 'user_id', as: 'user' });
User.hasMany(OAuthProvider, { foreignKey: 'user_id', as: 'oauthProviders' });

VerificationToken.belongsTo(User, { foreignKey: 'user_id', as: 'user' });
PasswordResetToken.belongsTo(User, { foreignKey: 'user_id', as: 'user' });

// ============ Cross-service associations (read-only for admin) ============
// Course -> Question (course_db -> question_db)
// Note: These use cross-schema associations, may need raw queries for reliability
Course.hasMany(Question, { foreignKey: 'course_id', as: 'questions', foreignKeyConstraint: false });
Question.belongsTo(Course, { foreignKey: 'course_id', as: 'course', foreignKeyConstraint: false });

// Question -> User (question_db -> user_db)
Question.belongsTo(User, { foreignKey: 'created_by', as: 'creator', foreignKeyConstraint: false });
User.hasMany(Question, { foreignKey: 'created_by', as: 'createdQuestions', foreignKeyConstraint: false });

// Notification -> User (notification_db -> user_db)
Notification.belongsTo(User, { foreignKey: 'user_id', as: 'user', foreignKeyConstraint: false });
User.hasMany(Notification, { foreignKey: 'user_id', as: 'notifications', foreignKeyConstraint: false });

// ============ Export ============
export {
  sequelize,
  DataTypes,
  Model,
  Op,
  User,
  Role,
  UserProfile,
  UserSession,
  StudentProfile,
  TeacherProfile,
  OAuthProvider,
  VerificationToken,
  PasswordResetToken,
  Course,
  Question,
  Notification,
  AIJob,
  QueueJob,
  AuditLog,
  SystemEvent,
};
