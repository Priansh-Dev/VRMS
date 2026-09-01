const migration = {
  up: async (pool) => {
    await pool.execute(`
      CREATE TABLE vehicles (
        id CHAR(36) PRIMARY KEY,
        owner_id CHAR(36) NOT NULL,
        make VARCHAR(100) NOT NULL,
        model VARCHAR(100) NOT NULL,
        type ENUM('HATCHBACK', 'SEDAN', 'SUV', 'MUV', 'MOTORCYCLE', 'SCOOTER', 'OTHER') NOT NULL,
        registration_number VARCHAR(50) NOT NULL UNIQUE,
        description TEXT,
        location VARCHAR(255) NOT NULL,
        rent_per_hour DECIMAL(12,2) NOT NULL,
        verification_status ENUM('PENDING', 'APPROVED', 'REJECTED') NOT NULL DEFAULT 'PENDING',
        listing_status ENUM('ACTIVE', 'UNAVAILABLE', 'REMOVED') NOT NULL DEFAULT 'ACTIVE',
        rejection_reason TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (owner_id) REFERENCES users(id) ON DELETE RESTRICT,
        INDEX idx_owner_id (owner_id),
        INDEX idx_registration_number (registration_number),
        INDEX idx_verification_status (verification_status),
        INDEX idx_listing_status (listing_status),
        INDEX idx_type (type),
        INDEX idx_location (location)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);
    console.log('Created vehicles table');
  },

  down: async (pool) => {
    await pool.execute('DROP TABLE IF EXISTS vehicles');
    console.log('Dropped vehicles table');
  }
};

module.exports = migration;