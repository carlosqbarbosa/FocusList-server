const bcrypt = require('bcryptjs');
const pool = require('../config/database');
const { sendSuccess, sendError } = require('../utils/response');

class UserController {

  // Perfil do usuário
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

  // Atualizar dados básicos
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

  // Alterar senha
  async alterarSenha(req, res) {
    const userId = req.userId;
    const { senhaAtual, novaSenha } = req.body;

    try {
      const result = await pool.query(
        `SELECT senha_hash FROM usuarios WHERE id = $1`,
        [userId]
      );

      const senhaValida = await bcrypt.compare(
        senhaAtual,
        result.rows[0].senha_hash
      );

      if (!senhaValida) {
        return sendError(res, 'Senha atual incorreta', 401);
      }

      const novaSenhaHash = await bcrypt.hash(novaSenha, 10);

      await pool.query(
        `UPDATE usuarios SET senha_hash = $1 WHERE id = $2`,
        [novaSenhaHash, userId]
      );

      return sendSuccess(res, null, 'Senha alterada com sucesso');
    } catch (error) {
      console.error('Erro ao alterar senha:', error);
      return sendError(res, 'Erro ao alterar senha');
    }
  }
}

module.exports = new UserController();
