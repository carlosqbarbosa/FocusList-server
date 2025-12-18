const pool = require('../config/database');
const { sendSuccess, sendError } = require('../utils/response');

class TasksController {
  async listar(req, res) {
    const userId = req.userId;
    const { 
      status, 
      prioridade, 
      categoria,
      busca,
      limite = 20, 
      pagina = 1,
      ordenar = 'criado_em',
      ordem = 'DESC'
    } = req.query;

    try {
      let query = `
        SELECT t.*, 
               COALESCE(array_agg(tag.nome) FILTER (WHERE tag.nome IS NOT NULL), '{}') as tags
        FROM tarefas t
        LEFT JOIN tarefas_tags tt ON t.id = tt.tarefa_id
        LEFT JOIN tags tag ON tt.tag_id = tag.id
        WHERE t.usuario_id = $1 AND t.deletado_em IS NULL
      `;
      const params = [userId];
      let paramIndex = 2;
      if (status) {
        query += ` AND t.status = $${paramIndex}`;
        params.push(status);
        paramIndex++;
      }
      if (prioridade) {
        query += ` AND t.prioridade = $${paramIndex}`;
        params.push(prioridade);
        paramIndex++;
      }
      if (categoria) {
        query += ` AND t.categoria = $${paramIndex}`;
        params.push(categoria);
        paramIndex++;
      }
      if (busca) {
        query += ` AND (t.titulo ILIKE $${paramIndex} OR t.descricao ILIKE $${paramIndex})`;
        params.push(`%${busca}%`);
        paramIndex++;
      }
      query += ` GROUP BY t.id ORDER BY t.${ordenar} ${ordem}`;
      query += ` LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
      params.push(limite, (pagina - 1) * limite);
      const result = await pool.query
        (query, params);

      return sendSuccess(res, result.rows, 'Tarefas listadas com sucesso');
    } catch (error) {
      console.error('Erro ao listar tarefas:', error);
      return sendError(res, 'Erro ao listar tarefas');
    }
  }


}