import { DataTypes, Model } from 'sequelize';
import sequelize from '../../config/sequelize.js';

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
  token_hash: {
    type: DataTypes.STRING(64),
    allowNull: false,
    unique: true,
    comment: 'SHA256 hash of the reset token',
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
  created_at: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
  },
}, {
  sequelize,
  modelName: 'PasswordResetToken',
  tableName: 'password_reset_tokens',
  timestamps: false,
  indexes: [
    {
      fields: ['user_id'],
    },
    {
      fields: ['token_hash'],
      unique: true,
    },
    {
      fields: ['expires_at'],
    },
  ],
});

export default PasswordResetToken;
