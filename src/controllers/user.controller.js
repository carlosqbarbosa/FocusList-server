const bcrypt = require('bcryptjs');
const pool = require('../config/database');
const { sendSuccess, sendError } = require('../utils/response');

class UserController {

  async perfil(req, res) {
    const userId = req.userId;

    try {
      const result = await pool.query(
        `SELECT id, nome, sobrenome, email, url_foto_perfil, plano, criado_em
         FROM usuarios
         WHERE id = $1 AND deletado_em IS NULL`,
        [userId]
      );

      return sendSuccess(res, result.rows[0]);
    } catch (error) {
      console.error('Erro ao buscar perfil:', error);
      return sendError(res, 'Erro ao buscar perfil');
    }
  }

  async atualizar(req, res) {
    const userId = req.userId;
    const { nome, sobrenome } = req.body;

    try {
      await pool.query(
        `UPDATE usuarios
         SET nome = $1, sobrenome = $2
         WHERE id = $3`,
        [nome, sobrenome, userId]
      );

      return sendSuccess(res, null, 'Dados atualizados com sucesso');
    } catch (error) {
      console.error('Erro ao atualizar usuário:', error);
      return sendError(res, 'Erro ao atualizar dados');
    }
  }

  async deletar(req, res) {
    try {
      const userId = req.userId;

      await pool.query(
        `UPDATE usuarios
         SET deletado_em = NOW()
         WHERE id = $1`,
        [userId]
      );

      return sendSuccess(res, null, 'Usuário deletado com sucesso');
    } catch (error) {
      console.error('Erro ao deletar usuário:', error);
      return sendError(res, 'Erro ao deletar usuário');
    }
  }

  async alterarSenha(req, res) {
  const userId = req.userId;
  const { senhaAtual, novaSenha } = req.body;

  try {
    await authService.alterarSenha(userId, senhaAtual, novaSenha);
    return sendSuccess(res, null, 'Senha alterada com sucesso');
  } catch (error) {
    console.error('Erro ao alterar senha:', error);
    
    if (error.message === 'INVALID_CURRENT_PASSWORD') {
      return sendError(res, 'Senha atual incorreta', 401);
    }
    
    return sendError(res, 'Erro ao alterar senha');
  }
}
}

module.exports = new UserController();
