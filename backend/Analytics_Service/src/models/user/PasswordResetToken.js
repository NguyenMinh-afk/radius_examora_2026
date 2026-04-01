const { DataTypes, Model } = require('sequelize');
const sequelize = require('../../config/sequelize');

class PasswordResetToken extends Model {}

PasswordResetToken.init({
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  user_id: {
    type: DataTypes.UUID,
    allowNull: false,
  },
  token: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
  },
  is_used: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  used_at: DataTypes.DATE,
  expires_at: {
    type: DataTypes.DATE,
    allowNull: false,
  },
  ip_address: DataTypes.STRING,
  user_agent: DataTypes.TEXT,
  created_at: DataTypes.DATE,
}, {
  sequelize,
  modelName: 'PasswordResetToken',
  tableName: 'password_reset_tokens',
  timestamps: false,
});

module.exports = PasswordResetToken;
