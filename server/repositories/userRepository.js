const { query, transaction } = require('../config/database');
const { v4: uuidv4 } = require('uuid');
const logger = require('../utils/logger');

async function createUser(userData) {
  const id = uuidv4();
  const { name, email, phone, passwordHash, role } = userData;

  const sql = `
    INSERT INTO users (id, name, email, phone, password_hash, role)
    VALUES (?, ?, ?, ?, ?, ?)
  `;

  await query(sql, [id, name, email, phone, passwordHash, role]);
  logger.info('User created', { userId: id, email, role });

  return { id, name, email, phone, role };
}

async function findUserByEmail(email) {
  const sql = 'SELECT * FROM users WHERE email = ?';
  const rows = await query(sql, [email]);
  return rows[0] || null;
}

async function findUserById(id) {
  const sql = 'SELECT id, name, email, phone, role, status, created_at, updated_at, last_login_at FROM users WHERE id = ?';
  const rows = await query(sql, [id]);
  return rows[0] || null;
}

async function updateLastLogin(userId) {
  const sql = 'UPDATE users SET last_login_at = CURRENT_TIMESTAMP WHERE id = ?';
  await query(sql, [userId]);
}

async function updateUserStatus(userId, status) {
  const sql = 'UPDATE users SET status = ? WHERE id = ?';
  await query(sql, [status, userId]);
}

module.exports = {
  createUser,
  findUserByEmail,
  findUserById,
  updateLastLogin,
  updateUserStatus
};