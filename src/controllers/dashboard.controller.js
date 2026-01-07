const db = require('../config/database');

exports.summary = async (req, res) => {
  const userId = req.userId;
  try {
    const [[{ concluidas = 0 }]] = await db.query('SELECT COUNT(*) AS concluidas FROM tasks WHERE user_id = ? AND status = "concluida"', [userId]);

    const [[{ minutos_hj = 0 }]] = await db.query(
      `SELECT COALESCE(SUM(duration_minutes),0) AS minutos_hj FROM pomodoro_sessions 
       WHERE user_id = ? AND DATE(start_time) = CURDATE()`,
      [userId]
    );

    const [[{ em_progresso = 0 }]] = await db.query(
      'SELECT COUNT(*) AS em_progresso FROM tasks WHERE user_id = ? AND status = "progresso"',
      [userId]
    );

    res.json({ concluidas, minutos_hj, em_progresso });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro ao gerar resumo' });
  }
};
