import { DataTypes, Model } from "sequelize";
import sequelize from "../../config/sequelize.js";

class QueueJob extends Model {}

QueueJob.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    job_type: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    queue_name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    payload: {
      type: DataTypes.JSONB,
      allowNull: false,
    },
    priority: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    status: {
      type: DataTypes.STRING,
      defaultValue: "queued",
    },
    attempts: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    max_attempts: {
      type: DataTypes.INTEGER,
      defaultValue: 3,
    },
    queued_at: DataTypes.DATE,
    started_at: DataTypes.DATE,
    completed_at: DataTypes.DATE,
    failed_at: DataTypes.DATE,
    result: DataTypes.JSONB,
    error_message: DataTypes.TEXT,
    user_id: DataTypes.UUID,
    related_id: DataTypes.UUID,
    trace_id: DataTypes.STRING,
    created_at: DataTypes.DATE,
  },
  {
    sequelize,
    modelName: "QueueJob",
    tableName: "queue_jobs",
    schema: "infra_eventing",
    timestamps: false,
  }
);

export default QueueJob;
