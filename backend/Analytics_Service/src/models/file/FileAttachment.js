const { DataTypes, Model } = require('sequelize');
const  sequelize  = require('../../config/sequelize');

class FileAttachment extends Model {}

FileAttachment.init({
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  file_name: DataTypes.STRING,
  file_url: DataTypes.STRING,
  file_type: DataTypes.STRING,
  file_size: DataTypes.INTEGER,
  uploaded_by: DataTypes.UUID,
  created_at: DataTypes.DATE,
}, {
  sequelize,
  modelName: 'FileAttachment',
  tableName: 'file_attachments',
  timestamps: false,
});

module.exports = FileAttachment;
