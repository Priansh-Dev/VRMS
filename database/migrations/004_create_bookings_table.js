const migration = {
  up: async (pool) => {
    await pool.execute(`
      CREATE TABLE bookings (
        id CHAR(36) PRIMARY KEY,
        vehicle_id CHAR(36) NOT NULL,
        customer_id CHAR(36) NOT NULL,
        start_datetime TIMESTAMP NOT NULL,
        end_datetime TIMESTAMP NOT NULL,
        duration_hours DECIMAL(8,2) NOT NULL,
        hourly_rate_snapshot DECIMAL(12,2) NOT NULL,
        total_amount DECIMAL(12,2) NOT NULL,
        status ENUM('PENDING_PAYMENT', 'CONFIRMED', 'HANDED_OVER', 'REJECTED') NOT NULL DEFAULT 'PENDING_PAYMENT',
        rejection_reason TEXT,
        handover_at TIMESTAMP NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (vehicle_id) REFERENCES vehicles(id) ON DELETE RESTRICT,
        FOREIGN KEY (customer_id) REFERENCES users(id) ON DELETE RESTRICT,
        INDEX idx_vehicle_id (vehicle_id),
        INDEX idx_customer_id (customer_id),
        INDEX idx_status (status),
        INDEX idx_start_datetime (start_datetime),
        INDEX idx_end_datetime (end_datetime),
        INDEX idx_vehicle_status_datetime (vehicle_id, status, start_datetime, end_datetime)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);
    console.log('Created bookings table');
  },

  down: async (pool) => {
    await pool.execute('DROP TABLE IF EXISTS bookings');
    console.log('Dropped bookings table');
  }
};

module.exports = migration;