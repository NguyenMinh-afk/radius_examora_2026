import { DataTypes, Model } from 'sequelize';
import sequelize from '../../config/sequelize.js';

class PasswordResetOTP extends Model {}

PasswordResetOTP.init({
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  user_id: {
    type: DataTypes.UUID,
    allowNull: false,
  },
  otp_hash: {
    type: DataTypes.STRING(64),
    allowNull: false,
    comment: 'SHA256 hash of the 6-digit OTP',
  },
  attempts: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
  },
  is_verified: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  verified_at: DataTypes.DATE,
  expires_at: {
    type: DataTypes.DATE,
    allowNull: false,
  },
  ip_address: DataTypes.STRING,
  created_at: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
  },
}, {
  sequelize,
  modelName: 'PasswordResetOTP',
  tableName: 'password_reset_otps',
  timestamps: false,
  indexes: [
    {
      fields: ['user_id'],
    },
    {
      fields: ['otp_hash'],
    },
    {
      fields: ['expires_at'],
    },
  ],
});

export default PasswordResetOTP;
