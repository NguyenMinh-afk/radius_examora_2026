import { DataTypes, Model } from 'sequelize';
import sequelize from '../config/sequelize.js';

class UserProfile extends Model {}

UserProfile.init({
  user_id: {
    type: DataTypes.UUID,
    primaryKey: true,
    references: { model: 'users', key: 'id' },
  },

  // Personal Information
  date_of_birth: DataTypes.DATEONLY,
  gender: DataTypes.STRING,
  place_of_birth: DataTypes.STRING,
  nationality: {
    type: DataTypes.STRING,
    defaultValue: 'Việt Nam',
  },
  ethnicity: DataTypes.STRING,
  religion: DataTypes.STRING,

  // Identification
  identification_number: DataTypes.STRING,
  identification_type: DataTypes.STRING,
  identification_issued_date: DataTypes.DATEONLY,
  identification_issued_place: DataTypes.STRING,

  // Contact Information
  address: DataTypes.TEXT,
  permanent_address: DataTypes.TEXT,
  city: DataTypes.STRING,
  district: DataTypes.STRING,
  ward: DataTypes.STRING,
  postal_code: DataTypes.STRING,

  // Education/Work Information
  school_name: DataTypes.STRING,
  major: DataTypes.STRING,
  year_of_study: DataTypes.INTEGER,
  class_code: DataTypes.STRING,
  student_code: DataTypes.STRING,

  // Emergency Contact
  emergency_contact_name: DataTypes.STRING,
  emergency_contact_relationship: DataTypes.STRING,
  emergency_contact_phone: DataTypes.STRING,

  // Social Media & Communication
  facebook_url: DataTypes.TEXT,
  zalo_id: DataTypes.STRING,
  telegram_id: DataTypes.STRING,

  // Additional Info
  bio: DataTypes.TEXT,
  health_notes: DataTypes.TEXT,
  special_needs: DataTypes.TEXT,

  // System fields
  preferences: DataTypes.JSONB,
  metadata: DataTypes.JSONB,
}, {
  sequelize,
  modelName: 'UserProfile',
  tableName: 'user_profiles',
  schema: 'user_db',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
});

export default UserProfile;
