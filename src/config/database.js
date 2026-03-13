const mysql = require('mysql2/promise');

const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  port: Number(process.env.DB_PORT) || 3306,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// teste de conexão
(async () => {
  try {
    const conn = await pool.getConnection();
    console.log('✅ Conectado ao MariaDB com sucesso!');
    conn.release();
  } catch (err) {
    console.error('❌ Erro ao conectar no MariaDB:', err.message);
  }
})();

module.exports = pool;
