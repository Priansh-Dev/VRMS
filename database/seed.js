const crypto = require('crypto');
const mysql = require('mysql2/promise');
require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });

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

function uuid() {
  return crypto.randomUUID();
}

const SAMPLE_USERS = [
  {
    id: uuid(),
    name: 'System Admin',
    email: 'admin@vrms.in',
    phone: '+919876543210',
    password_hash: '$2a$10$8K1p/a0dL1LXMIbO8FVnUe9ZJ9vY8K1p/a0dL1LXMIbO8FVnUe9ZJ9vY8K1p',
    role: 'ADMIN',
    status: 'ACTIVE'
  },
  {
    id: uuid(),
    name: 'Rajesh Kumar',
    email: 'rajesh.kumar@vrms.in',
    phone: '+919876543211',
    password_hash: '$2a$10$8K1p/a0dL1LXMIbO8FVnUe9ZJ9vY8K1p/a0dL1LXMIbO8FVnUe9ZJ9vY8K1p',
    role: 'OWNER',
    status: 'ACTIVE'
  },
  {
    id: uuid(),
    name: 'Priya Sharma',
    email: 'priya.sharma@vrms.in',
    phone: '+919876543212',
    password_hash: '$2a$10$8K1p/a0dL1LXMIbO8FVnUe9ZJ9vY8K1p/a0dL1LXMIbO8FVnUe9ZJ9vY8K1p',
    role: 'OWNER',
    status: 'ACTIVE'
  },
  {
    id: uuid(),
    name: 'Amit Patel',
    email: 'amit.patel@vrms.in',
    phone: '+919876543213',
    password_hash: '$2a$10$8K1p/a0dL1LXMIbO8FVnUe9ZJ9vY8K1p/a0dL1LXMIbO8FVnUe9ZJ9vY8K1p',
    role: 'CUSTOMER',
    status: 'ACTIVE'
  },
  {
    id: uuid(),
    name: 'Sunita Singh',
    email: 'sunita.singh@vrms.in',
    phone: '+919876543214',
    password_hash: '$2a$10$8K1p/a0dL1LXMIbO8FVnUe9ZJ9vY8K1p/a0dL1LXMIbO8FVnUe9ZJ9vY8K1p',
    role: 'CUSTOMER',
    status: 'ACTIVE'
  }
];

const SAMPLE_VEHICLES = [
  {
    make: 'Maruti Suzuki',
    model: 'Swift',
    type: 'HATCHBACK',
    registration_number: 'DL01AB1234',
    description: 'Well maintained Swift with AC and music system',
    location: 'Delhi',
    rent_per_hour: 350.00,
    verification_status: 'APPROVED',
    listing_status: 'ACTIVE'
  },
  {
    make: 'Hyundai',
    model: 'Creta',
    type: 'SUV',
    registration_number: 'DL01CD5678',
    description: 'Premium Creta SUV with sunroof and leather seats',
    location: 'Gurugram',
    rent_per_hour: 650.00,
    verification_status: 'APPROVED',
    listing_status: 'ACTIVE'
  },
  {
    make: 'Honda',
    model: 'City',
    type: 'SEDAN',
    registration_number: 'MH01EF9012',
    description: 'Comfortable City sedan for city and highway drives',
    location: 'Mumbai',
    rent_per_hour: 450.00,
    verification_status: 'APPROVED',
    listing_status: 'ACTIVE'
  },
  {
    make: 'Toyota',
    model: 'Innova Crysta',
    type: 'MUV',
    registration_number: 'KA01GH3456',
    description: 'Spacious Innova Crysta perfect for family trips',
    location: 'Bengaluru',
    rent_per_hour: 800.00,
    verification_status: 'APPROVED',
    listing_status: 'ACTIVE'
  },
  {
    make: 'Bajaj',
    model: 'Pulsar 150',
    type: 'MOTORCYCLE',
    registration_number: 'TN01IJ7890',
    description: 'Sporty Pulsar 150 for daily commute',
    location: 'Chennai',
    rent_per_hour: 150.00,
    verification_status: 'APPROVED',
    listing_status: 'ACTIVE'
  },
  {
    make: 'TVS',
    model: 'Jupiter',
    type: 'SCOOTER',
    registration_number: 'WB01KL2345',
    description: 'Comfortable Jupiter scooter for city rides',
    location: 'Kolkata',
    rent_per_hour: 120.00,
    verification_status: 'PENDING',
    listing_status: 'ACTIVE'
  },
  {
    make: 'Mahindra',
    model: 'Thar',
    type: 'SUV',
    registration_number: 'RJ01MN6789',
    description: 'Off-road capable Thar for adventure trips',
    location: 'Jaipur',
    rent_per_hour: 750.00,
    verification_status: 'REJECTED',
    listing_status: 'REMOVED',
    rejection_reason: 'Registration number mismatch in documents'
  }
];

async function seed() {
  const pool = await mysql.createPool(config);
  
  try {
    console.log('Connecting to database...');
    await pool.getConnection();
    console.log('Connected to database');
    
    console.log('Checking existing data...');
    const [existingUsers] = await pool.execute('SELECT COUNT(*) as count FROM users');
    if (existingUsers[0].count > 0) {
      console.log('Database already seeded. Skipping.');
      return;
    }
    
    console.log('Seeding users...');
    for (const user of SAMPLE_USERS) {
      await pool.execute(
        `INSERT INTO users (id, name, email, phone, password_hash, role, status, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, NOW(), NOW())`,
        [user.id, user.name, user.email, user.phone, user.password_hash, user.role, user.status]
      );
    }
    console.log(`Inserted ${SAMPLE_USERS.length} users`);
    
    const [ownerUsers] = await pool.execute(
      "SELECT id FROM users WHERE role = 'OWNER' AND status = 'ACTIVE'"
    );
    
    if (ownerUsers.length === 0) {
      console.log('No owners found. Skipping vehicle seeding.');
      return;
    }
    
    const owner1Id = ownerUsers[0].id;
    const owner2Id = ownerUsers.length > 1 ? ownerUsers[1].id : ownerUsers[0].id;
    
    console.log('Seeding vehicles...');
    const vehicleIds = [];
    for (let i = 0; i < SAMPLE_VEHICLES.length; i++) {
      const vehicle = SAMPLE_VEHICLES[i];
      const vehicleId = uuid();
      vehicleIds.push(vehicleId);
      
      const ownerId = i % 2 === 0 ? owner1Id : owner2Id;
      
      await pool.execute(
        `INSERT INTO vehicles (id, owner_id, make, model, type, registration_number, description, location, rent_per_hour, verification_status, listing_status, rejection_reason, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())`,
        [vehicleId, ownerId, vehicle.make, vehicle.model, vehicle.type, vehicle.registration_number, vehicle.description, vehicle.location, vehicle.rent_per_hour, vehicle.verification_status, vehicle.listing_status, vehicle.rejection_reason || null]
      );
    }
    console.log(`Inserted ${SAMPLE_VEHICLES.length} vehicles`);
    
    console.log('Seeding vehicle documents (placeholder records)...');
    for (const vehicleId of vehicleIds) {
      const docTypes = ['RC', 'OWNER_ID', 'NUMBER_PLATE_PHOTO'];
      for (const docType of docTypes) {
        await pool.execute(
          `INSERT INTO vehicle_documents (id, vehicle_id, document_type, storage_path, original_filename, mime_type, file_size, uploaded_at)
           VALUES (?, ?, ?, ?, ?, ?, ?, NOW())`,
          [uuid(), vehicleId, docType, `/storage/private/${vehicleId}/${docType.toLowerCase()}.pdf`, `${docType}.pdf`, 'application/pdf', 102400]
        );
      }
    }
    console.log('Inserted vehicle document records');
    
    console.log('\nSeed completed successfully!');
    console.log('\nTest credentials (password: "password123" for all):');
    console.log('Admin:    admin@vrms.in');
    console.log('Owner 1:  rajesh.kumar@vrms.in');
    console.log('Owner 2:  priya.sharma@vrms.in');
    console.log('Customer: amit.patel@vrms.in');
    console.log('Customer: sunita.singh@vrms.in');
    
  } catch (err) {
    console.error('Seeding failed:', err.message);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

seed();