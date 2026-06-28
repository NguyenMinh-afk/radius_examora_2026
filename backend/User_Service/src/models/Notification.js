/**
 * Notification Model (notification_db.notifications)
 * User_Service dùng để admin gửi broadcast notifications
 */
import { DataTypes, Model } from 'sequelize';
import sequelize from '../config/sequelize.js';

class Notification extends Model {}

Notification.init({
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  user_id: {
    type: DataTypes.UUID,
    allowNull: true,
    field: 'user_id',
  },
  type: {
    type: DataTypes.ENUM('assignment', 'grade', 'ai_complete', 'system', 'verification', 'password_reset', 'email'),
    allowNull: false,
  },
  title: {
    type: DataTypes.STRING(255),
    allowNull: false,
  },
  message: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  action_url: {
    type: DataTypes.TEXT,
    allowNull: true,
    field: 'action_url',
  },
  action_data: {
    type: DataTypes.JSONB,
    allowNull: true,
    field: 'action_data',
  },
  is_read: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
    field: 'is_read',
  },
  read_at: {
    type: DataTypes.DATE,
    allowNull: true,
    field: 'read_at',
  },
  created_at: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
    field: 'created_at',
  },
}, {
  sequelize,
  modelName: 'Notification',
  tableName: 'notifications',
  timestamps: false,
  createdAt: 'created_at',
  updatedAt: false,
  schema: 'notification_db',
});

export default Notification;
