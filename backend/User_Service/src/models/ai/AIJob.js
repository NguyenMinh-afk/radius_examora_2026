import { DataTypes, Model } from "sequelize";
import sequelize from "../../config/sequelize.js";

class AIJob extends Model {}

AIJob.init(
  {
    ai_job_id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    document_id: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    requested_by: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    status: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: "PENDING",
    },
    retry_count: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    result_artifact_path: DataTypes.TEXT,
    error_message: DataTypes.TEXT,
    trace_id: DataTypes.STRING,
    created_at: DataTypes.DATE,
    updated_at: DataTypes.DATE,
    completed_at: DataTypes.DATE,
  },
  {
    sequelize,
    modelName: "AIJob",
    tableName: "ai_jobs",
    schema: "ai_db",
    timestamps: true,
    createdAt: "created_at",
    updatedAt: "updated_at",
  }
);

export default AIJob;
