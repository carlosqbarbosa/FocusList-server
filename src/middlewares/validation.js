// Validação de dados

const Joi = require('joi');
const { sendError } = require('../utils/response');

const validate = (schema) => {
  return (req, res, next) => {
    const { error } = schema.validate(req.body, { abortEarly: false });
    
    if (error) {
      const errors = error.details.map(detail => ({
        campo: detail.path.join('.'),
        mensagem: detail.message
      }));
      
      return sendError(res, 'Dados inválidos', 400, errors);
    }
    
    next();
  };
};

module.exports = { validate };