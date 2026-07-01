/**
 * Document Model - ai_db.documents
 * Lưu trữ tài liệu upload để AI xử lý (RAG pipeline)
 */
import { DataTypes } from 'sequelize';
import sequelize from '../../config/sequelize.js';

const Document = sequelize.define('Document', {
  document_id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
    field: 'document_id',
  },
  course_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  uploaded_by: {
    type: DataTypes.UUID,
    allowNull: false,
  },
  file_name: {
    type: DataTypes.STRING(255),
    allowNull: false,
  },
  original_filename: {
    type: DataTypes.STRING(255),
    allowNull: false,
  },
  storage_path: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  file_url: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  mime_type: {
    type: DataTypes.STRING(100),
    allowNull: true,
  },
  file_size: {
    type: DataTypes.BIGINT,
    allowNull: true,
  },
  status: {
    type: DataTypes.ENUM('PENDING', 'RUNNING', 'COMPLETED', 'FAILED'),
    defaultValue: 'PENDING',
  },
  error_message: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  trace_id: {
    type: DataTypes.STRING(100),
    allowNull: true,
  },
}, {
  tableName: 'documents',
  schema: 'ai_db',
  timestamps: true,
  underscored: true,
});

export default Document;
