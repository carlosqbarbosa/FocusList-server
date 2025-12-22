const mysql = require('mysql2');

const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 3306,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10, 
  queueLimit: 0
});


const promisePool = pool.promise();


pool.getConnection((err, connection) => {
  if (err) {
    console.error('Erro ao conectar no MariaDB:', err.message);
  } else {
    console.log('Conectado ao MariaDB com sucesso!');
    connection.release();
  }
});

module.exports = promisePool;