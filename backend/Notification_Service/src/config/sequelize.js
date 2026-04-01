const { Sequelize } = require('sequelize');
require('dotenv').config();

console.log('DB_PASSWORD (sequelize.js):', typeof process.env.DB_PASSWORD, process.env.DB_PASSWORD);
const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASSWORD,
  {
    host: process.env.DB_HOST,
    port: process.env.DB_PORT || 5432,
    dialect: 'postgres',
    logging: false,
    define: {
      freezeTableName: true,
      underscored: true,
      timestamps: true,
      createdAt: 'created_at',
      updatedAt: 'updated_at',
    },
  }
);

module.exports = sequelize;
