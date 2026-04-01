const { DataTypes, Model } = require('sequelize');
const  sequelize  = require('../../config/sequelize');

class Comment extends Model {}

Comment.init({
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  user_id: DataTypes.UUID,
  target_type: DataTypes.STRING,
  target_id: DataTypes.UUID,
  content: DataTypes.TEXT,
  created_at: DataTypes.DATE,
}, {
  sequelize,
  modelName: 'Comment',
  tableName: 'comments',
  timestamps: false,
});

module.exports = Comment;
