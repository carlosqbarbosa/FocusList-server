const Joi = require('joi');

const createTaskSchema = Joi.object({
  titulo: Joi.string().min(3).max(255).required(),
  descricao: Joi.string().max(5000).allow('', null),
  status: Joi.string().valid('nao_iniciado', 'em_progresso', 'concluido').default('nao_iniciado'),
  prioridade: Joi.string().valid('baixa', 'moderada', 'alta').default('moderada'),
  dataVencimento: Joi.date().iso().allow(null),
  estimativaPomodoros: Joi.number().integer().min(1).max(50).default(1),
  tags: Joi.array().items(Joi.string()).default([]),
  categoria: Joi.string().max(50).allow('', null)
});

const updateTaskSchema = Joi.object({
  titulo: Joi.string().min(3).max(255),
  descricao: Joi.string().max(5000).allow('', null),
  status: Joi.string().valid('nao_iniciado', 'em_progresso', 'concluido'),
  prioridade: Joi.string().valid('baixa', 'moderada', 'alta'),
  dataVencimento: Joi.date().iso().allow(null),
  estimativaPomodoros: Joi.number().integer().min(1).max(50),
  tags: Joi.array().items(Joi.string()),
  categoria: Joi.string().max(50).allow('', null)
}).min(1);

module.exports = { createTaskSchema, updateTaskSchema };