/**
 * ClassMember Model
 * ESM - exam_db.class_members
 */
import { DataTypes, Model } from 'sequelize';
import sequelize from '../../config/sequelize.js';

class ClassMember extends Model {}

ClassMember.init({
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  class_id: {
    type: DataTypes.UUID,
    allowNull: false,
  },
  user_id: {
    type: DataTypes.UUID,
    allowNull: false,
  },
  role: {
    type: DataTypes.STRING(50),
    defaultValue: 'student',
  },
  status: {
    type: DataTypes.STRING(30),
    defaultValue: 'active',
  },
  joined_at: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
  },
  created_at: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
  },
  updated_at: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
  },
}, {
  sequelize,
  modelName: 'ClassMember',
  tableName: 'class_members',
  schema: 'exam_db',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
});

export default ClassMember;
