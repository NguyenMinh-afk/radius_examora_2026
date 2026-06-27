/**
 * Answer Model - exam_bank_db.question_db.answers
 */
import { DataTypes, Model } from 'sequelize';
import sequelize from '../../config/sequelize.js';

class Answer extends Model {}

Answer.init({
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  question_id: {
    type: DataTypes.UUID,
    allowNull: false,
    field: 'question_id',
  },
  content: {
    type: DataTypes.TEXT,
    allowNull: false,
    field: 'content',
  },
  is_correct: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false,
    field: 'is_correct',
  },
  order_index: {
    type: DataTypes.INTEGER,
    allowNull: true,
    defaultValue: 0,
    field: 'order_index',
  },
}, {
  sequelize,
  modelName: 'Answer',
  tableName: 'answers',
  schema: 'question_db',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
});

export default Answer;
