const Joi = require('joi');

const registerSchema = Joi.object({
  nome: Joi.string().min(2).max(100).required()
    .messages({
      'string.min': 'Nome deve ter no mínimo 2 caracteres',
      'any.required': 'Nome é obrigatório'
    }),
  sobrenome: Joi.string().min(2).max(100).required(),
  email: Joi.string().email().required(),
  senha: Joi.string().min(6).required()
    .messages({
      'string.min': 'Senha deve ter no mínimo 6 caracteres'
    })
});

const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  senha: Joi.string().required()
});

module.exports = { registerSchema, loginSchema };