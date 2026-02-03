const pool = require('../config/database');
const { sendSuccess, sendError } = require('../utils/response');

class TasksController {
  async listar(req, res) {
  const userId = req.userId;

  const { 
    status, prioridade, categoria, busca,
    limite = 20, pagina = 1, ordenar = 'criado_em', ordem = 'DESC'
  } = req.query;

  try {
    let query = `
      SELECT *
      FROM tarefas
      WHERE usuario_id = ?
    `;

    const params = [userId];

    if (status) {
      query += ` AND status = ?`;
      params.push(status);
    }

    if (prioridade) {
      query += ` AND prioridade = ?`;
      params.push(prioridade);
    }

    if (categoria) {
      query += ` AND categoria = ?`;
      params.push(categoria);
    }

    if (busca) {
      query += ` AND (titulo LIKE ? OR descricao LIKE ?)`;
      params.push(`%${busca}%`, `%${busca}%`);
    }

    query += ` ORDER BY ${ordenar} ${ordem}`;
    query += ` LIMIT ?, ?`;

    const offset = (parseInt(pagina) - 1) * parseInt(limite);

    params.push(offset, parseInt(limite));

    const [rows] = await pool.execute(query, params);

    return sendSuccess(res, rows, 'Tarefas listadas com sucesso');

  } catch (error) {
    console.error('Erro ao listar:', error);
    return sendError(res, 'Erro ao listar tarefas');
  }
}

  async createTask(req, res) {
  const userId = req.userId;

  let { titulo, descricao, prioridade, categoria, data_vencimento } = req.body;

  categoria = categoria || null;
  data_vencimento = data_vencimento || null; 
  descricao = descricao || null;

  try {
    const query = `
      INSERT INTO tarefas 
      (titulo, descricao, prioridade, data_vencimento, usuario_id)
      VALUES (?, ?, ?, ?, ?)
    `;

    const [result] = await pool.execute(query, [
      titulo,
      descricao,
      prioridade,
      data_vencimento, 
      userId
    ]);

    return sendSuccess(res, { id: result.insertId }, 'Tarefa criada com sucesso', 201);

  } catch (error) {
    console.error('Erro ao criar:', error);
    return sendError(res, 'Erro ao criar tarefa');
  }
}
  async updateTask(req, res) {
    const { id } = req.params;
    const userId = req.userId;
    const updates = req.body; 

    try {

      const fields = Object.keys(updates);
      const values = Object.values(updates);
      
      if (fields.length === 0) return sendError(res, 'Nenhum dado para atualizar');

      const setQuery = fields.map(field => `${field} = ?`).join(', ');
      const query = `UPDATE tarefas SET ${setQuery} WHERE id = ? AND usuario_id = ?`;
      
      const [result] = await pool.execute(query, [...values, id, userId]);

      if (result.affectedRows === 0) return sendError(res, 'Tarefa não encontrada ou sem permissão', 404);

      return sendSuccess(res, null, 'Tarefa atualizada com sucesso');
    } catch (error) {
      console.error('Erro ao atualizar:', error);
      return sendError(res, 'Erro ao atualizar tarefa');
    }
  }

  async deleteTask(req, res) {
    const { id } = req.params;
    const userId = req.userId;

    try {
      const query = `DELETE FROM tarefas WHERE id = ? AND usuario_id = ?`;
      const [result] = await pool.execute(query, [id, userId]);

      if (result.affectedRows === 0)
        return sendError(res, 'Tarefa não encontrada', 404);

      return sendSuccess(res, null, 'Tarefa removida com sucesso');

    } catch (error) {
      console.error('Erro ao deletar:', error);
      return sendError(res, 'Erro ao deletar tarefa');
    }
  }
}

module.exports = new TasksController();