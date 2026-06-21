import { DataTypes, Model } from "sequelize";
import sequelize from "../../config/sequelize.js";

class Question extends Model {}

Question.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    course_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    chapter_id: DataTypes.INTEGER,
    knowledge_unit_id: DataTypes.INTEGER,
    created_by: DataTypes.UUID,
    question_type: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: "multiple_choice",
    },
    difficulty: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: "medium",
    },
    content: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    options: {
      type: DataTypes.JSONB,
      allowNull: false,
    },
    correct_answer: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    explanation: DataTypes.TEXT,
    points: DataTypes.DECIMAL(5, 2),
    time_limit: DataTypes.INTEGER,
    keywords: DataTypes.ARRAY(DataTypes.TEXT),
    is_ai_generated: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    ai_model: DataTypes.STRING,
    is_active: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
    is_public: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    created_at: DataTypes.DATE,
    updated_at: DataTypes.DATE,
  },
  {
    sequelize,
    modelName: "Question",
    tableName: "questions",
    schema: "question_db",
    timestamps: true,
    createdAt: "created_at",
    updatedAt: "updated_at",
  }
);

export default Question;
