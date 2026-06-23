import { DataTypes, Model } from 'sequelize';
import sequelize from '../../config/sequelize.js';

class VerificationToken extends Model {}

VerificationToken.init({
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
  token_type: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  email: DataTypes.STRING,
  phone: DataTypes.STRING,
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
  modelName: 'VerificationToken',
  tableName: 'verification_tokens',
  timestamps: false,
});

export default VerificationToken;
