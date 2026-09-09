/**
 * Models index cho AI_Generation_Service
 * Chứa các model thuộc domain AI generation
 */
import sequelize from '../config/sequelize.js';

import AIGenerationRequest from './ai/AIGenerationRequest.js';
import AIGenerationTask from './ai/AIGenerationTask.js';
import GeneratedQuestion from './ai/GeneratedQuestion.js';
import AIGenerationLog from './ai/AIGenerationLog.js';
import Document from './ai/Document.js';
import AIJob from './ai/AIJob.js';

// Associations
AIGenerationRequest.hasMany(AIGenerationTask, { foreignKey: 'request_id', as: 'tasks' });
AIGenerationTask.belongsTo(AIGenerationRequest, { foreignKey: 'request_id', as: 'request' });

AIGenerationRequest.hasMany(AIGenerationLog, { foreignKey: 'request_id', as: 'logs' });
AIGenerationLog.belongsTo(AIGenerationRequest, { foreignKey: 'request_id', as: 'request' });

AIGenerationTask.hasMany(GeneratedQuestion, { foreignKey: 'task_id', as: 'questions' });
GeneratedQuestion.belongsTo(AIGenerationTask, { foreignKey: 'task_id', as: 'task' });

Document.hasMany(AIJob, { foreignKey: 'document_id', as: 'jobs' });
AIJob.belongsTo(Document, { foreignKey: 'document_id', as: 'document' });

export {
  sequelize,
  AIGenerationRequest,
  AIGenerationTask,
  GeneratedQuestion,
  AIGenerationLog,
  Document,
  AIJob,
};
