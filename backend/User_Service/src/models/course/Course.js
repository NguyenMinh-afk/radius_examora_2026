import { DataTypes, Model } from "sequelize";
import sequelize from "../../config/sequelize.js";

class Course extends Model {}

Course.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    faculty_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    code: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    description: DataTypes.TEXT,
    credits: {
      type: DataTypes.INTEGER,
      defaultValue: 3,
    },
    semester_type: DataTypes.STRING,
    is_active: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
    created_at: DataTypes.DATE,
  },
  {
    sequelize,
    modelName: "Course",
    tableName: "courses",
    schema: "course_db",
    timestamps: false,
  }
);

export default Course;
