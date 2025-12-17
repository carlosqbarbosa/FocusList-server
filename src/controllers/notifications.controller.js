const pool = require('../config/database');
const { sendSuccess, sendError } = require('../utils/response');

class NotificationsController {

  // Listar notificações
  async listar(req, res) {
    const userId = req.userId;

    try {
      const result = await pool.query(
        `SELECT id, titulo, mensagem, lida, criado_em
         FROM notificacoes
         WHERE usuario_id = $1
         ORDER BY criado_em DESC`,
        [userId]
      );

      return sendSuccess(res, result.rows);
    } catch (error) {
      console.error('Erro ao listar notificações:', error);
      return sendError(res, 'Erro ao buscar notificações');
    }
  }

  // Marcar como lida
  async marcarComoLida(req, res) {
    const userId = req.userId;
    const { id } = req.params;

    try {
      await pool.query(
        `UPDATE notificacoes
         SET lida = true
         WHERE id = $1 AND usuario_id = $2`,
        [id, userId]
      );

      return sendSuccess(res, null, 'Notificação marcada como lida');
    } catch (error) {
      console.error('Erro ao marcar notificação:', error);
      return sendError(res, 'Erro ao atualizar notificação');
    }
  }

  // Contar notificações não lidas
  async contador(req, res) {
    const userId = req.userId;

    try {
      const result = await pool.query(
        `SELECT COUNT(*) AS total
         FROM notificacoes
         WHERE usuario_id = $1 AND lida = false`,
        [userId]
      );

      return sendSuccess(res, { nao_lidas: Number(result.rows[0].total) });
    } catch (error) {
      console.error('Erro ao contar notificações:', error);
      return sendError(res, 'Erro ao contar notificações');
    }
  }
}

module.exports = new NotificationsController();
