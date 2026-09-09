/**
 * QuestionTag Model - exam_bank_db.question_db.question_tags
 */
import { DataTypes, Model } from 'sequelize';
import sequelize from '../../config/sequelize.js';

class QuestionTag extends Model {}

QuestionTag.init({
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  name: {
    type: DataTypes.STRING(100),
    allowNull: false,
    unique: true,
    field: 'name',
  },
  category: {
    type: DataTypes.STRING(50),
    allowNull: true,
    field: 'category',
  },
}, {
  sequelize,
  modelName: 'QuestionTag',
  tableName: 'question_tags',
  schema: 'question_db',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
});

export default QuestionTag;
