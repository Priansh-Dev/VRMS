const migration = {
  up: async (pool) => {
    await pool.execute(`
      CREATE TABLE vehicle_documents (
        id CHAR(36) PRIMARY KEY,
        vehicle_id CHAR(36) NOT NULL,
        document_type ENUM('RC', 'OWNER_ID', 'NUMBER_PLATE_PHOTO') NOT NULL,
        storage_path VARCHAR(500) NOT NULL,
        original_filename VARCHAR(255) NOT NULL,
        mime_type VARCHAR(100) NOT NULL,
        file_size INT NOT NULL,
        uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (vehicle_id) REFERENCES vehicles(id) ON DELETE CASCADE,
        INDEX idx_vehicle_id (vehicle_id),
        INDEX idx_document_type (document_type)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);
    console.log('Created vehicle_documents table');
  },

  down: async (pool) => {
    await pool.execute('DROP TABLE IF EXISTS vehicle_documents');
    console.log('Dropped vehicle_documents table');
  }
};

module.exports = migration;