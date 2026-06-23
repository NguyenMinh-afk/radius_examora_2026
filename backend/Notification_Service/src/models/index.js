/**
 * Models index cho Notification_Service
 * Chỉ chứa model Notification - domain notification
 */
import sequelize from '../config/sequelize.js';
import Notification from './notification/Notification.js';

export { sequelize, Notification };
