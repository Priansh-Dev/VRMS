const fs = require('fs');
const path = require('path');
const mysql = require('mysql2/promise');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

const config = {
  host: process.env.DATABASE_HOST || 'localhost',
  port: parseInt(process.env.DATABASE_PORT || '3306', 10),
  user: process.env.DATABASE_USER || 'root',
  password: process.env.DATABASE_PASSWORD || '',
  database: process.env.DATABASE_NAME || 'vrms',
  multipleStatements: false,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
};

const MIGRATIONS_DIR = path.join(__dirname, 'migrations');

async function getPool() {
  return mysql.createPool(config);
}

async function ensureMigrationTable(pool) {
  await pool.execute(`
    CREATE TABLE IF NOT EXISTS migrations (
      id INT AUTO_INCREMENT PRIMARY KEY,
      filename VARCHAR(255) NOT NULL UNIQUE,
      executed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  `);
}

async function getExecutedMigrations(pool) {
  const [rows] = await pool.execute('SELECT filename FROM migrations ORDER BY id');
  return rows.map(r => r.filename);
}

async function loadMigrations() {
  const files = fs.readdirSync(MIGRATIONS_DIR)
    .filter(f => f.endsWith('.js'))
    .sort();
  
  const migrations = [];
  for (const file of files) {
    const migrationPath = path.join(MIGRATIONS_DIR, file);
    const migration = require(migrationPath);
    migrations.push({ filename: file, ...migration });
  }
  return migrations;
}

async function runMigrations() {
  const pool = await getPool();
  
  try {
    console.log('Connecting to database...');
    await pool.getConnection();
    console.log('Connected to database');
    
    await ensureMigrationTable(pool);
    const executed = await getExecutedMigrations(pool);
    const migrations = await loadMigrations();
    
    for (const migration of migrations) {
      if (executed.includes(migration.filename)) {
        console.log(`Skipping ${migration.filename} (already executed)`);
        continue;
      }
      
      console.log(`Running migration: ${migration.filename}`);
      const connection = await pool.getConnection();
      try {
        await connection.beginTransaction();
        await migration.up(connection);
        await connection.execute(
          'INSERT INTO migrations (filename) VALUES (?)',
          [migration.filename]
        );
        await connection.commit();
        console.log(`Completed: ${migration.filename}`);
      } catch (err) {
        await connection.rollback();
        throw err;
      } finally {
        connection.release();
      }
    }
    
    console.log('All migrations completed successfully');
  } catch (err) {
    console.error('Migration failed:', err.message);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

async function rollbackLast() {
  const pool = await getPool();
  
  try {
    console.log('Connecting to database...');
    await pool.getConnection();
    console.log('Connected to database');
    
    await ensureMigrationTable(pool);
    const [rows] = await pool.execute(
      'SELECT filename FROM migrations ORDER BY id DESC LIMIT 1'
    );
    
    if (rows.length === 0) {
      console.log('No migrations to rollback');
      return;
    }
    
    const lastMigration = rows[0].filename;
    const migrations = await loadMigrations();
    const migration = migrations.find(m => m.filename === lastMigration);
    
    if (!migration) {
      console.error(`Migration file not found: ${lastMigration}`);
      process.exit(1);
    }
    
    console.log(`Rolling back: ${lastMigration}`);
    const connection = await pool.getConnection();
    try {
      await connection.beginTransaction();
      await migration.down(connection);
      await connection.execute(
        'DELETE FROM migrations WHERE filename = ?',
        [lastMigration]
      );
      await connection.commit();
      console.log(`Rolled back: ${lastMigration}`);
    } catch (err) {
      await connection.rollback();
      throw err;
    } finally {
      connection.release();
    }
  } catch (err) {
    console.error('Rollback failed:', err.message);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

async function status() {
  const pool = await getPool();
  
  try {
    console.log('Connecting to database...');
    await pool.getConnection();
    console.log('Connected to database');
    
    await ensureMigrationTable(pool);
    const executed = await getExecutedMigrations(pool);
    const migrations = await loadMigrations();
    
    console.log('\nMigration Status:');
    console.log('=================');
    for (const migration of migrations) {
      const status = executed.includes(migration.filename) ? '✓ EXECUTED' : '✗ PENDING';
      console.log(`${status}  ${migration.filename}`);
    }
    console.log('');
  } catch (err) {
    console.error('Status check failed:', err.message);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

const command = process.argv[2];

switch (command) {
  case 'up':
    runMigrations();
    break;
  case 'down':
    rollbackLast();
    break;
  case 'status':
    status();
    break;
  default:
    console.log('Usage: node migrate.js [up|down|status]');
    console.log('  up     - Run all pending migrations');
    console.log('  down   - Rollback the last executed migration');
    console.log('  status - Show migration status');
    process.exit(1);
}