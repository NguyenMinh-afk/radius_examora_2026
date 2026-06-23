/**
 * Models index cho AI_Generation_Service
 * Chỉ chứa model thuộc domain AI generation
 */
import sequelize from '../config/sequelize.js';

import AIGenerationRequest from './ai/AIGenerationRequest.js';
import AIGenerationLog from './ai/AIGenerationLog.js';
import AIModel from './ai/AIModel.js';

AIGenerationRequest.hasMany(AIGenerationLog, { foreignKey: 'request_id', as: 'logs' });
AIGenerationLog.belongsTo(AIGenerationRequest, { foreignKey: 'request_id', as: 'request' });

export { sequelize, AIGenerationRequest, AIGenerationLog, AIModel };
