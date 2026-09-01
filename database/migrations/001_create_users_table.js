const migration = {
  up: async (pool) => {
    await pool.execute(`
      CREATE TABLE users (
        id CHAR(36) PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) NOT NULL UNIQUE,
        phone VARCHAR(20) NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        role ENUM('ADMIN', 'OWNER', 'CUSTOMER') NOT NULL DEFAULT 'CUSTOMER',
        status ENUM('ACTIVE', 'INACTIVE', 'DEACTIVATED') NOT NULL DEFAULT 'ACTIVE',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        last_login_at TIMESTAMP NULL,
        INDEX idx_email (email),
        INDEX idx_phone (phone),
        INDEX idx_role (role),
        INDEX idx_status (status)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);
    console.log('Created users table');
  },

  down: async (pool) => {
    await pool.execute('DROP TABLE IF EXISTS users');
    console.log('Dropped users table');
  }
};

module.exports = migration;