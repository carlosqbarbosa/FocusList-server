const { sendError } = require('../utils/response');

class AppError extends Error {
  constructor(message, statusCode = 500, errors = null) {
    super(message);
    this.statusCode = statusCode;
    this.errors = errors;
    this.isOperational = true; 
    
    Error.captureStackTrace(this, this.constructor);
  }
}

const errorHandler = (err, req, res, next) => {
  if (process.env.NODE_ENV !== 'production') {
    console.error('Erro capturado:', {
      message: err.message,
      stack: err.stack,
      url: req.originalUrl,
      method: req.method,
      body: req.body,
      user: req.userId
    });
  }

  if (err.isOperational) {
    return sendError(res, err.message, err.statusCode, err.errors);
  }

  if (err.isJoi) {
    const errors = err.details.map(detail => ({
      campo: detail.path.join('.'),
      mensagem: detail.message
    }));
    return sendError(res, 'Dados inválidos', 400, errors);
  }

  if (err.code) {
    return handleDatabaseError(err, res);
  }

 
  if (err.name === 'JsonWebTokenError') {
    return sendError(res, 'Token inválido', 401);
  }

  if (err.name === 'TokenExpiredError') {
    return sendError(res, 'Token expirado', 401);
  }

  if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
    return sendError(res, 'JSON inválido', 400);
  }

  if (process.env.NODE_ENV === 'production') {
    return sendError(res, 'Erro interno do servidor', 500);
  } else {
    return sendError(res, err.message || 'Erro interno do servidor', 500);
  }
};

const handleDatabaseError = (err, res) => {
  switch (err.code) {
    case '23505':
      const field = err.detail?.match(/\(([^)]+)\)/)?.[1] || 'campo';
      return sendError(res, `${field} já está em uso`, 409);
    
    case '23503':
      return sendError(res, 'Referência inválida', 400);

    case '23502':
      const column = err.column || 'campo obrigatório';
      return sendError(res, `${column} é obrigatório`, 400);

    case 'ECONNREFUSED':
      console.error('Banco de dados não está acessível');
      return sendError(res, 'Serviço temporariamente indisponível', 503);

    case '57014':
      return sendError(res, 'Operação demorou muito tempo', 408);

    default:
      console.error('Erro de banco não tratado:', err.code, err.message);
      return sendError(res, 'Erro ao processar operação', 500);
  }
};

const notFound = (req, res, next) => {
  const error = new AppError(`Rota não encontrada: ${req.originalUrl}`, 404);
  next(error);
};

const asyncHandler = (fn) => {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

const isOperationalError = (error) => {
  if (error instanceof AppError) {
    return error.isOperational;
  }
  return false;
};

const handleUncaughtException = () => {
  process.on('uncaughtException', (error) => {
    console.error('UNCAUGHT EXCEPTION! Shutting down...');
    console.error(error.name, error.message);
    console.error(error.stack);
    
    process.exit(1);
  });
};


const handleUnhandledRejection = (server) => {
  process.on('unhandledRejection', (error) => {
    console.error(' UNHANDLED REJECTION! Shutting down...');
    console.error(error);
    
    server.close(() => {
      process.exit(1);
    });
  });
};

module.exports = {
  errorHandler,
  notFound,
  asyncHandler,
  AppError,
  isOperationalError,
  handleUncaughtException,
  handleUnhandledRejection
};