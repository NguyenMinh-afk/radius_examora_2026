/**
 * Models index cho User_Service
 * Chỉ chứa các model thuộc domain user/auth/profile
 * KHÔNG chứa exam/question/notification/ai
 */
import sequelize from '../config/sequelize.js';

// ============ User Core Models ============
import User from './User.js';
import Role from './Role.js';
import UserProfile from './UserProfile.js';
import UserSession from './UserSession.js';

// ============ Role-specific Profiles ============
import StudentProfile from './user/StudentProfile.js';
import TeacherProfile from './TeacherProfile.js';

// ============ Auth辅助 Models ============
import OAuthProvider from './user/OAuthProvider.js';
import VerificationToken from './user/VerificationToken.js';
import PasswordResetToken from './user/PasswordResetToken.js';

// ============ Associations ============
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

// ============ Export ============
export {
  sequelize,
  User,
  Role,
  UserProfile,
  UserSession,
  StudentProfile,
  TeacherProfile,
  OAuthProvider,
  VerificationToken,
  PasswordResetToken,
};
