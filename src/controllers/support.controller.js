const pool = require('../config/database');
const { sendSuccess, sendError } = require('../utils/response');

class SupportController {

  async criar(req, res) {
    const userId = req.userId;
    const { assunto, mensagem } = req.body;

    if (!assunto || !mensagem) {
      return sendError(res, 'Assunto e mensagem são obrigatórios', 400);
    }

    try {
      const result = await pool.query(
        `INSERT INTO suportes (usuario_id, assunto, status)
         VALUES ($1, $2, 'aberto')
         RETURNING id`,
        [userId, assunto]
      );

      const suporteId = result.rows[0].id;

      await pool.query(
        `INSERT INTO suportes_mensagens (suporte_id, remetente, mensagem)
         VALUES ($1, 'usuario', $2)`,
        [suporteId, mensagem]
      );

      return sendSuccess(res, { id: suporteId }, 'Ticket criado', 201);
    } catch (error) {
      console.error('Erro ao criar ticket:', error);
      return sendError(res, 'Erro ao criar ticket');
    }
  }

  async listar(req, res) {
    const userId = req.userId;

    try {
      const result = await pool.query(
        `SELECT id, assunto, status, criado_em
         FROM suportes
         WHERE usuario_id = $1
         ORDER BY criado_em DESC`,
        [userId]
      );

      return sendSuccess(res, result.rows);
    } catch (error) {
      console.error('Erro ao listar tickets:', error);
      return sendError(res, 'Erro ao listar tickets');
    }
  }

  async detalhar(req, res) {
    const userId = req.userId;
    const { id } = req.params;

    try {
      const suporte = await pool.query(
        `SELECT id, assunto, status, criado_em
         FROM suportes
         WHERE id = $1 AND usuario_id = $2`,
        [id, userId]
      );

      if (suporte.rows.length === 0) {
        return sendError(res, 'Ticket não encontrado', 404);
      }

      const mensagens = await pool.query(
        `SELECT remetente, mensagem, criado_em
         FROM suportes_mensagens
         WHERE suporte_id = $1
         ORDER BY criado_em ASC`,
        [id]
      );

      return sendSuccess(res, {
        ...suporte.rows[0],
        mensagens: mensagens.rows
      });
    } catch (error) {
      console.error('Erro ao detalhar ticket:', error);
      return sendError(res, 'Erro ao buscar ticket');
    }
  }
}

module.exports = new SupportController();
