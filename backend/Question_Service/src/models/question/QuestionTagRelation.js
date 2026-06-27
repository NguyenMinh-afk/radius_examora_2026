/**
 * QuestionTagRelation Model - exam_bank_db.question_db.question_tag_relations
 */
import { DataTypes, Model } from 'sequelize';
import sequelize from '../../config/sequelize.js';

class QuestionTagRelation extends Model {}

QuestionTagRelation.init({
  question_id: {
    type: DataTypes.UUID,
    primaryKey: true,
    field: 'question_id',
  },
  tag_id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    field: 'tag_id',
  },
}, {
  sequelize,
  modelName: 'QuestionTagRelation',
  tableName: 'question_tag_relations',
  schema: 'question_db',
  timestamps: false,
  createdAt: false,
  updatedAt: false,
});

export default QuestionTagRelation;
