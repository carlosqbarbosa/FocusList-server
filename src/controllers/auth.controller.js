const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const pool = require('../config/database');
const { sendSuccess, sendError } = require('../utils/response');

class AuthController {
  async register(req, res) {
    const { nome, sobrenome, email, senha } = req.body;

    try {
      // Verificar se email já existe
      const userExists = await pool.query(
        'SELECT id FROM usuarios WHERE email = $1 AND deletado_em IS NULL',
        [email]
      );

      if (userExists.rows.length > 0) {
        return sendError(res, 'Email já cadastrado', 400);
      }

      // Hash da senha
      const senhaHash = await bcrypt.hash(senha, 10);

      // Criar usuário
      const result = await pool.query(
        `INSERT INTO usuarios (nome, sobrenome, email, senha_hash) 
         VALUES ($1, $2, $3, $4) 
         RETURNING id, nome, sobrenome, email, criado_em`,
        [nome, sobrenome, email, senhaHash]
      );

      const usuario = result.rows[0];

      // Criar configurações padrão
      await pool.query(
        'INSERT INTO usuarios_configuracoes (usuario_id) VALUES ($1)',
        [usuario.id]
      );

      // Gerar token
      const token = jwt.sign(
        { id: usuario.id, email: usuario.email },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRATION || '7d' }
      );

      return sendSuccess(res, { usuario, token }, 'Cadastro realizado com sucesso', 201);
    } catch (error) {
      console.error('Erro no registro:', error);
      return sendError(res, 'Erro ao realizar cadastro');
    }
  }

  async login(req, res) {
    const { email, senha } = req.body;

    try {
      // Buscar usuário
      const result = await pool.query(
        `SELECT id, nome, sobrenome, email, senha_hash, url_foto_perfil, plano, status 
         FROM usuarios 
         WHERE email = $1 AND deletado_em IS NULL`,
        [email]
      );

      if (result.rows.length === 0) {
        return sendError(res, 'Email ou senha incorretos', 401);
      }

      const usuario = result.rows[0];

      // Verificar conta ativa
      if (usuario.status !== 'ativo') {
        return sendError(res, 'Conta inativa ou suspensa', 403);
      }

      // Verificar senha
      const senhaValida = await bcrypt.compare(senha, usuario.senha_hash);
      if (!senhaValida) {
        return sendError(res, 'Email ou senha incorretos', 401);
      }

      // Remover senha do objeto
      delete usuario.senha_hash;

    
      const token = jwt.sign(
        { id: usuario.id, email: usuario.email },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRATION || '7d' }
      );

      return sendSuccess(res, { usuario, token }, 'Login realizado com sucesso'); 
    } catch (error) {
      console.error('Erro no login:', error);
      return sendError(res, 'Erro ao realizar login');
    }
  }

  async logout(req, res) {
    return sendSuccess(res, null, 'Logout realizado com sucesso');
  }
}

module.exports = new AuthController();
