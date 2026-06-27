/**
 * CollectionQuestion Model - exam_bank_db.question_db.collection_questions
 */
import { DataTypes, Model } from 'sequelize';
import sequelize from '../../config/sequelize.js';

class CollectionQuestion extends Model {}

CollectionQuestion.init({
  collection_id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    field: 'collection_id',
  },
  question_id: {
    type: DataTypes.UUID,
    primaryKey: true,
    field: 'question_id',
  },
  order_index: {
    type: DataTypes.INTEGER,
    allowNull: true,
    defaultValue: 0,
    field: 'order_index',
  },
  added_by: {
    type: DataTypes.UUID,
    allowNull: true,
    field: 'added_by',
  },
}, {
  sequelize,
  modelName: 'CollectionQuestion',
  tableName: 'collection_questions',
  schema: 'question_db',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
});

export default CollectionQuestion;
