/**
 * Models index cho Question_Service
 * Chỉ chứa các model thuộc domain question/answer/tag
 */
import sequelize from '../config/sequelize.js';

import Question from './question/Question.js';
import Answer from './question/Answer.js';
import QuestionTag from './question/QuestionTag.js';
import QuestionTagRelation from './question/QuestionTagRelation.js';
import QuestionVersion from './question/QuestionVersion.js';
import CollectionQuestion from './question/CollectionQuestion.js';

// Associations
Question.hasMany(Answer, { foreignKey: 'question_id', as: 'answers' });
Answer.belongsTo(Question, { foreignKey: 'question_id', as: 'question' });

Question.belongsToMany(QuestionTag, {
  through: QuestionTagRelation,
  foreignKey: 'question_id',
  otherKey: 'tag_id',
  as: 'tags',
});
QuestionTag.belongsToMany(Question, {
  through: QuestionTagRelation,
  foreignKey: 'tag_id',
  otherKey: 'question_id',
  as: 'questions',
});

QuestionVersion.belongsTo(Question, { foreignKey: 'question_id', as: 'question' });
Question.hasMany(QuestionVersion, { foreignKey: 'question_id', as: 'versions' });

export {
  sequelize,
  Question,
  Answer,
  QuestionTag,
  QuestionTagRelation,
  QuestionVersion,
  CollectionQuestion,
};
