import { Op } from "sequelize";

import sequelize from "../config/sequelize.js";
import Role from "./Role.js";
import User from "./User.js";
import UserProfile from "./UserProfile.js";
import UserSession from "./UserSession.js";
import AIJob from "./ai/AIJob.js";
import Course from "./course/Course.js";
import QueueJob from "./queue/QueueJob.js";
import AuditLog from "./system/AuditLog.js";
import OAuthProvider from "./user/OAuthProvider.js";

// Keep associations idempotent so importing this module more than once is safe.
if (!User.associations.role) {
  User.belongsTo(Role, { foreignKey: "role_id", as: "role" });
}

if (!Role.associations.users) {
  Role.hasMany(User, { foreignKey: "role_id", as: "users" });
}

if (!User.associations.profile) {
  User.hasOne(UserProfile, { foreignKey: "user_id", as: "profile" });
}

if (!UserProfile.associations.user) {
  UserProfile.belongsTo(User, { foreignKey: "user_id", as: "user" });
}

if (!User.associations.sessions) {
  User.hasMany(UserSession, { foreignKey: "user_id", as: "sessions" });
}

if (!UserSession.associations.user) {
  UserSession.belongsTo(User, { foreignKey: "user_id", as: "user" });
}

if (!OAuthProvider.associations.user) {
  OAuthProvider.belongsTo(User, { foreignKey: "user_id", as: "user" });
}

if (!User.associations.oauthProviders) {
  User.hasMany(OAuthProvider, { foreignKey: "user_id", as: "oauthProviders" });
}

export {
  sequelize,
  Op,
  User,
  Role,
  UserProfile,
  UserSession,
  AIJob,
  Course,
  QueueJob,
  AuditLog,
  OAuthProvider,
};

export default {
  sequelize,
  Op,
  User,
  Role,
  UserProfile,
  UserSession,
  AIJob,
  Course,
  QueueJob,
  AuditLog,
  OAuthProvider,
};
