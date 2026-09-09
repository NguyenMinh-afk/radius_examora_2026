/**
 * ClassPost Model
 * ESM - exam_db.class_posts
 * Bảng lưu thông báo/posts của giáo viên đăng lên lớp học
 */
import { DataTypes, Model } from 'sequelize';
import sequelize from '../../config/sequelize.js';

class ClassPost extends Model {}

ClassPost.init({
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  class_id: {
    type: DataTypes.UUID,
    allowNull: false,
  },
  author_id: {
    type: DataTypes.UUID,
    allowNull: false,
  },
  title: {
    type: DataTypes.STRING(500),
    allowNull: true,
  },
  content: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  type: {
    type: DataTypes.ENUM('announcement', 'material', 'assignment', 'question'),
    defaultValue: 'announcement',
  },
  is_pinned: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  attachments: {
    type: DataTypes.JSONB,
    allowNull: true,
    defaultValue: [],
  },
  created_at: DataTypes.DATE,
  updated_at: DataTypes.DATE,
}, {
  sequelize,
  modelName: 'ClassPost',
  tableName: 'class_posts',
  schema: 'exam_db',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
});

export default ClassPost;
