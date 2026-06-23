/**
 * ClassCollaborator Model
 * ESM
 */
import { DataTypes, Model } from 'sequelize';
import sequelize from '../../config/sequelize.js';

class ClassCollaborator extends Model {}

ClassCollaborator.init({
  class_id: {
    type: DataTypes.UUID,
    primaryKey: true,
  },
  user_id: {
    type: DataTypes.UUID,
    primaryKey: true,
  },
  role: DataTypes.STRING,
  added_at: DataTypes.DATE,
}, {
  sequelize,
  modelName: 'ClassCollaborator',
  tableName: 'collection_collaborators',
  timestamps: false,
});

export default ClassCollaborator;
