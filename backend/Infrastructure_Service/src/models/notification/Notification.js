const { DataTypes, Model } = require('sequelize');
const  sequelize  = require('../../config/sequelize');

class Notification extends Model {}

Notification.init({
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  user_id: DataTypes.UUID,
  type: DataTypes.STRING,
  title: DataTypes.STRING,
  content: DataTypes.TEXT,
  is_read: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  created_at: DataTypes.DATE,
}, {
  sequelize,
  modelName: 'Notification',
  tableName: 'notifications',
  timestamps: false,
});

module.exports = Notification;
