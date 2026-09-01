const migration = {
  up: async (pool) => {
    await pool.execute(`
      CREATE TABLE audit_logs (
        id CHAR(36) PRIMARY KEY,
        user_id CHAR(36),
        event_type VARCHAR(100) NOT NULL,
        entity_type VARCHAR(50) NOT NULL,
        entity_id CHAR(36),
        description TEXT NOT NULL,
        metadata JSON,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
        INDEX idx_user_id (user_id),
        INDEX idx_event_type (event_type),
        INDEX idx_entity (entity_type, entity_id),
        INDEX idx_created_at (created_at)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);
    console.log('Created audit_logs table');
  },

  down: async (pool) => {
    await pool.execute('DROP TABLE IF EXISTS audit_logs');
    console.log('Dropped audit_logs table');
  }
};

module.exports = migration;