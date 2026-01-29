const jwt = require('jsonwebtoken');
const { sendError } = require('../utils/response');

const authMiddleware = (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];

    console.log("TOKEN RECEBIDO:", token);
    console.log("JWT_SECRET:", process.env.JWT_SECRET);

    if (!token) {
      return sendError(res, 'Token não fornecido', 401);
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    req.userId = decoded.id;
    req.userEmail = decoded.email;

    next();
  } catch (error) {
    console.log("ERRO JWT:", error.message);
    return sendError(res, 'Token inválido ou expirado', 401);
  }
};

module.exports = authMiddleware;
