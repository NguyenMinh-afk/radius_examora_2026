const { DataTypes, Model } = require('sequelize');
const  sequelize  = require('../../config/sequelize');

class CommentReaction extends Model {}

CommentReaction.init({
  comment_id: {
    type: DataTypes.UUID,
    primaryKey: true,
  },
  user_id: {
    type: DataTypes.UUID,
    primaryKey: true,
  },
  reaction: DataTypes.STRING,
  created_at: DataTypes.DATE,
}, {
  sequelize,
  modelName: 'CommentReaction',
  tableName: 'comment_reactions',
  timestamps: false,
});

module.exports = CommentReaction;
