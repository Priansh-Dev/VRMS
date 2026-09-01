const mysql = require('mysql2/promise');
const config = require('./env');
const logger = require('../utils/logger');

const pool = mysql.createPool(config.database);

pool.on('error', (err) => {
  logger.error('MySQL pool error', { error: err.message, code: err.code });
});

async function testConnection() {
  try {
    const connection = await pool.getConnection();
    await connection.ping();
    connection.release();
    logger.info('MySQL connection pool initialized successfully');
    return true;
  } catch (err) {
    logger.error('MySQL connection failed', { error: err.message, code: err.code });
    return false;
  }
}

async function query(sql, params) {
  try {
    const [rows] = await pool.execute(sql, params);
    return rows;
  } catch (err) {
    logger.error('Database query error', { error: err.message, sql, params });
    throw err;
  }
}

async function transaction(callback) {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();
    const result = await callback(connection);
    await connection.commit();
    return result;
  } catch (err) {
    await connection.rollback();
    throw err;
  } finally {
    connection.release();
  }
}

async function close() {
  await pool.end();
  logger.info('MySQL connection pool closed');
}

module.exports = {
  pool,
  query,
  transaction,
  testConnection,
  close
};