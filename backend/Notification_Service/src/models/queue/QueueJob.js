const { DataTypes, Model } = require('sequelize');
const  sequelize  = require('../../config/sequelize');

class QueueJob extends Model {}

QueueJob.init({
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  type: DataTypes.STRING,
  status: DataTypes.STRING,
  payload: DataTypes.JSONB,
  result: DataTypes.JSONB,
  error: DataTypes.TEXT,
  created_at: DataTypes.DATE,
  started_at: DataTypes.DATE,
  finished_at: DataTypes.DATE,
}, {
  sequelize,
  modelName: 'QueueJob',
  tableName: 'queue_jobs',
  timestamps: false,
});

module.exports = QueueJob;
