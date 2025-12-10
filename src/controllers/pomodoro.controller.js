const db = require('../database');

exports.startSession = async (req, res) => {
  const userId = req.userId;
  const { task_id, start_time } = req.body;
  if (!task_id || !start_time) return res.status(400).json({ error: 'task_id e start_time obrigatórios' });

  try {
    const [result] = await db.query(
      'INSERT INTO pomodoro_sessions (user_id, task_id, start_time) VALUES (?, ?, ?)',
      [userId, task_id, start_time]
    );
    res.status(201).json({ message: 'Sessão iniciada', id: result.insertId });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro ao iniciar sessão' });
  }
};

exports.endSession = async (req, res) => {
  const userId = req.userId;
  const { id, end_time, duration_minutes } = req.body;
  if (!id || !end_time) return res.status(400).json({ error: 'id e end_time obrigatórios' });

  try {
    await db.query(
      'UPDATE pomodoro_sessions SET end_time = ?, duration_minutes = ? WHERE id = ? AND user_id = ?',
      [end_time, duration_minutes || null, id, userId]
    );
    res.json({ message: 'Sessão finalizada' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro ao finalizar sessão' });
  }
};

exports.getHistory = async (req, res) => {
  const userId = req.userId;
  try {
    const [rows] = await db.query(
      `SELECT ps.*, t.title FROM pomodoro_sessions ps
       LEFT JOIN tasks t ON t.id = ps.task_id
       WHERE ps.user_id = ? ORDER BY ps.start_time DESC`,
      [userId]
    );
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro ao buscar histórico' });
  }
};
