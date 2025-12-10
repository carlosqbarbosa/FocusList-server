const db = require('../database');

exports.getTasks = async (req, res) => {
  const userId = req.userId || req.params.userId;
  if (!userId) return res.status(400).json({ error: 'userId necessário' });

  try {
    const [tasks] = await db.query('SELECT * FROM tasks WHERE user_id = ? ORDER BY created_at DESC', [userId]);
    res.json(tasks);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro ao buscar tasks' });
  }
};

exports.createTask = async (req, res) => {
  const userId = req.userId;
  const { title, description, priority } = req.body;
  if (!title) return res.status(400).json({ error: 'title é obrigatório' });

  try {
    const [result] = await db.query(
      'INSERT INTO tasks (user_id, title, description, priority) VALUES (?, ?, ?, ?)',
      [userId, title, description || null, priority || 'media']
    );
    res.status(201).json({ message: 'Task criada', id: result.insertId });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro ao criar task' });
  }
};

exports.updateTask = async (req, res) => {
  const userId = req.userId;
  const { id } = req.params;
  const { title, description, priority, status } = req.body;

  try {
    // opcional: checar se task pertence ao usuário
    await db.query(
      'UPDATE tasks SET title = ?, description = ?, priority = ?, status = ?, updated_at = NOW() WHERE id = ? AND user_id = ?',
      [title, description, priority, status, id, userId]
    );
    res.json({ message: 'Task atualizada' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro ao atualizar task' });
  }
};

exports.deleteTask = async (req, res) => {
  const userId = req.userId;
  const { id } = req.params;

  try {
    await db.query('DELETE FROM tasks WHERE id = ? AND user_id = ?', [id, userId]);
    res.json({ message: 'Task deletada' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro ao deletar task' });
  }
};
