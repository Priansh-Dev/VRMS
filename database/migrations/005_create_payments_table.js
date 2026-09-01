const migration = {
  up: async (pool) => {
    await pool.execute(`
      CREATE TABLE payments (
        id CHAR(36) PRIMARY KEY,
        booking_id CHAR(36) NOT NULL UNIQUE,
        razorpay_order_id VARCHAR(100) NOT NULL,
        razorpay_payment_id VARCHAR(100),
        amount DECIMAL(12,2) NOT NULL,
        currency VARCHAR(3) NOT NULL DEFAULT 'INR',
        status ENUM('CREATED', 'ATTEMPTED', 'PAID', 'FAILED', 'REFUNDED') NOT NULL DEFAULT 'CREATED',
        transaction_reference VARCHAR(100),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (booking_id) REFERENCES bookings(id) ON DELETE RESTRICT,
        INDEX idx_booking_id (booking_id),
        INDEX idx_razorpay_order_id (razorpay_order_id),
        INDEX idx_razorpay_payment_id (razorpay_payment_id),
        INDEX idx_status (status)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);
    console.log('Created payments table');
  },

  down: async (pool) => {
    await pool.execute('DROP TABLE IF EXISTS payments');
    console.log('Dropped payments table');
  }
};

module.exports = migration;