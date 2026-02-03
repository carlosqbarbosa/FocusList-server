const pool = require('../config/database');
const { sendSuccess, sendError } = require('../utils/response');

class DashboardController {

  validateUser(req, res) {
    if (!req.userId) {
      sendError(res, 'Usuário não autenticado', 401);
      return false;
    }
    return true;
  }

  async getSummary(req, res) {
    if (!this.validateUser(req, res)) return;

    const userId = req.userId;

    try {
      const [[{ total }]] = await pool.execute(
        'SELECT COUNT(*) as total FROM tarefas WHERE usuario_id = ?',
        [userId]
      );

      const [statusResult] = await pool.execute(
        `SELECT status, COUNT(*) as count
         FROM tarefas
         WHERE usuario_id = ?
         GROUP BY status`,
        [userId]
      );

      const [priorityResult] = await pool.execute(
        `SELECT prioridade, COUNT(*) as count
         FROM tarefas
         WHERE usuario_id = ?
         GROUP BY prioridade`,
        [userId]
      );

      const [[completion]] = await pool.execute(
        `SELECT 
          SUM(CASE WHEN status = 'Completo' THEN 1 ELSE 0 END) as completas
         FROM tarefas
         WHERE usuario_id = ?`,
        [userId]
      );

      const completas = completion.completas || 0;
      const taxaConclusao = total > 0
        ? Math.round((completas / total) * 100)
        : 0;

      return sendSuccess(res, {
        total,
        completas,
        pendentes: total - completas,
        taxaConclusao,
        porStatus: statusResult,
        porPrioridade: priorityResult
      });

    } catch (error) {
      console.error('[DASHBOARD][SUMMARY]', error);
      return sendError(res, 'Erro ao buscar resumo do dashboard');
    }
  }

  async getTasksByMonth(req, res) {
    if (!this.validateUser(req, res)) return;

    try {
      const [results] = await pool.execute(
        `SELECT 
          DATE_FORMAT(criado_em, '%Y-%m') as mes,
          COUNT(*) as total
         FROM tarefas
         WHERE usuario_id = ?
           AND criado_em >= DATE_SUB(CURDATE(), INTERVAL 6 MONTH)
         GROUP BY mes
         ORDER BY mes`,
        [req.userId]
      );

      return sendSuccess(res, results);

    } catch (error) {
      console.error('[DASHBOARD][MONTH]', error);
      return sendError(res, 'Erro ao buscar dados mensais');
    }
  }

  async getUpcomingTasks(req, res) {
    if (!this.validateUser(req, res)) return;

    try {
      const [results] = await pool.execute(
        `SELECT 
          id,
          titulo,
          data_vencimento,
          prioridade,
          status,
          DATEDIFF(data_vencimento, CURDATE()) as dias_restantes
         FROM tarefas
         WHERE usuario_id = ?
           AND status <> 'Completo'
           AND data_vencimento BETWEEN CURDATE() 
           AND DATE_ADD(CURDATE(), INTERVAL 7 DAY)
         ORDER BY data_vencimento`,
        [req.userId]
      );

      return sendSuccess(res, results);

    } catch (error) {
      console.error('[DASHBOARD][UPCOMING]', error);
      return sendError(res, 'Erro ao buscar tasks próximas');
    }
  }

  async getOverdueTasks(req, res) {
    if (!this.validateUser(req, res)) return;

    try {
      const [results] = await pool.execute(
        `SELECT 
          id,
          titulo,
          data_vencimento,
          prioridade,
          status,
          DATEDIFF(CURDATE(), data_vencimento) as dias_atrasado
         FROM tarefas
         WHERE usuario_id = ?
           AND status <> 'Completo'
           AND data_vencimento < CURDATE()
         ORDER BY data_vencimento`,
        [req.userId]
      );

      return sendSuccess(res, results);

    } catch (error) {
      console.error('[DASHBOARD][OVERDUE]', error);
      return sendError(res, 'Erro ao buscar tasks atrasadas');
    }
  }
}

module.exports = new DashboardController();

