import { Sequelize } from 'sequelize';
import dotenv from 'dotenv';
dotenv.config();

const dbSchema = process.env.DB_SCHEMA || 'public';
const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASSWORD,
  {
    host: process.env.DB_HOST,
    port: process.env.DB_PORT || 5432,
    dialect: 'postgres',
    logging: false,
    searchPath: `${dbSchema},public`,
    define: {
      freezeTableName: true,
      underscored: true,
      timestamps: true,
      createdAt: 'created_at',
      updatedAt: 'updated_at',
      schema: dbSchema,
    },
  }
);

export default sequelize;
