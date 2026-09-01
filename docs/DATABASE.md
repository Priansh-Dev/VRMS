# VRMS Database Schema Documentation

## Overview

This document describes the complete relational database schema for the Vehicle Rental Management System (VRMS). The database uses MySQL 8+ with InnoDB engine, utf8mb4 character set, and full referential integrity through foreign keys.

## Tables

### 1. users

Core user table storing all system users (Admin, Owner, Customer).

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | CHAR(36) | PRIMARY KEY | UUID |
| name | VARCHAR(255) | NOT NULL | Full name |
| email | VARCHAR(255) | NOT NULL, UNIQUE | Email address (login) |
| phone | VARCHAR(20) | NOT NULL | Indian mobile number (+91XXXXXXXXXX) |
| password_hash | VARCHAR(255) | NOT NULL | Bcrypt hash |
| role | ENUM | NOT NULL, DEFAULT 'CUSTOMER' | ADMIN, OWNER, CUSTOMER |
| status | ENUM | NOT NULL, DEFAULT 'ACTIVE' | ACTIVE, INACTIVE, DEACTIVATED |
| created_at | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | Record creation |
| updated_at | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP ON UPDATE | Last modification |
| last_login_at | TIMESTAMP | NULL | Last successful login |

**Indexes:**
- idx_email (email) - Unique login lookup
- idx_phone (phone) - Phone-based queries
- idx_role (role) - Role-based filtering
- idx_status (status) - Status filtering

**Foreign Keys:** None (referenced by other tables)

---

### 2. vehicles

Vehicle listings created by owners.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | CHAR(36) | PRIMARY KEY | UUID |
| owner_id | CHAR(36) | NOT NULL, FK → users.id | Vehicle owner |
| make | VARCHAR(100) | NOT NULL | Manufacturer (Maruti Suzuki, Hyundai, etc.) |
| model | VARCHAR(100) | NOT NULL | Model name (Swift, Creta, etc.) |
| type | ENUM | NOT NULL | HATCHBACK, SEDAN, SUV, MUV, MOTORCYCLE, SCOOTER, OTHER |
| registration_number | VARCHAR(50) | NOT NULL, UNIQUE | Indian registration format (e.g., DL01AB1234) |
| description | TEXT | | Vehicle description |
| location | VARCHAR(255) | NOT NULL | City/area (Delhi, Mumbai, Bengaluru, etc.) |
| rent_per_hour | DECIMAL(12,2) | NOT NULL | Hourly rate in INR |
| verification_status | ENUM | NOT NULL, DEFAULT 'PENDING' | PENDING, APPROVED, REJECTED |
| listing_status | ENUM | NOT NULL, DEFAULT 'ACTIVE' | ACTIVE, UNAVAILABLE, REMOVED |
| rejection_reason | TEXT | | Admin rejection reason |
| created_at | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | Record creation |
| updated_at | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP ON UPDATE | Last modification |

**Indexes:**
- idx_owner_id (owner_id) - Owner's vehicles
- idx_registration_number (registration_number) - Unique registration lookup
- idx_verification_status (verification_status) - Verification filtering
- idx_listing_status (listing_status) - Listing status filtering
- idx_type (type) - Vehicle type filtering
- idx_location (location) - Location-based search

**Foreign Keys:**
- owner_id → users(id) ON DELETE RESTRICT

---

### 3. vehicle_documents

Verification documents uploaded by owners for each vehicle.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | CHAR(36) | PRIMARY KEY | UUID |
| vehicle_id | CHAR(36) | NOT NULL, FK → vehicles.id | Associated vehicle |
| document_type | ENUM | NOT NULL | RC, OWNER_ID, NUMBER_PLATE_PHOTO |
| storage_path | VARCHAR(500) | NOT NULL | Private storage path |
| original_filename | VARCHAR(255) | NOT NULL | Original upload filename |
| mime_type | VARCHAR(100) | NOT NULL | MIME type (validated) |
| file_size | INT | NOT NULL | File size in bytes |
| uploaded_at | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | Upload timestamp |

**Indexes:**
- idx_vehicle_id (vehicle_id) - Vehicle's documents
- idx_document_type (document_type) - Document type queries

**Foreign Keys:**
- vehicle_id → vehicles(id) ON DELETE CASCADE

---

### 4. bookings

Customer bookings for vehicles.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | CHAR(36) | PRIMARY KEY | UUID |
| vehicle_id | CHAR(36) | NOT NULL, FK → vehicles.id | Booked vehicle |
| customer_id | CHAR(36) | NOT NULL, FK → users.id | Booking customer |
| start_datetime | TIMESTAMP | NOT NULL | Booking start |
| end_datetime | TIMESTAMP | NOT NULL | Booking end |
| duration_hours | DECIMAL(8,2) | NOT NULL | Calculated duration |
| hourly_rate_snapshot | DECIMAL(12,2) | NOT NULL | Rate at booking time |
| total_amount | DECIMAL(12,2) | NOT NULL | Calculated total (duration × rate) |
| status | ENUM | NOT NULL, DEFAULT 'PENDING_PAYMENT' | PENDING_PAYMENT, CONFIRMED, HANDED_OVER, REJECTED |
| rejection_reason | TEXT | | Owner rejection reason at handover |
| handover_at | TIMESTAMP | NULL | Actual handover timestamp |
| created_at | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | Record creation |
| updated_at | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP ON UPDATE | Last modification |

**Indexes:**
- idx_vehicle_id (vehicle_id) - Vehicle's bookings
- idx_customer_id (customer_id) - Customer's bookings
- idx_status (status) - Status filtering
- idx_start_datetime (start_datetime) - Date range queries
- idx_end_datetime (end_datetime) - Date range queries
- idx_vehicle_status_datetime (vehicle_id, status, start_datetime, end_datetime) - Overlap checking

**Foreign Keys:**
- vehicle_id → vehicles(id) ON DELETE RESTRICT
- customer_id → users(id) ON DELETE RESTRICT

---

### 5. payments

Payment records linked to bookings (Razorpay integration).

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | CHAR(36) | PRIMARY KEY | UUID |
| booking_id | CHAR(36) | NOT NULL, UNIQUE, FK → bookings.id | Associated booking |
| razorpay_order_id | VARCHAR(100) | NOT NULL | Razorpay order ID |
| razorpay_payment_id | VARCHAR(100) | | Razorpay payment ID (after payment) |
| amount | DECIMAL(12,2) | NOT NULL | Payment amount in INR |
| currency | VARCHAR(3) | NOT NULL, DEFAULT 'INR' | Currency code |
| status | ENUM | NOT NULL, DEFAULT 'CREATED' | CREATED, ATTEMPTED, PAID, FAILED, REFUNDED |
| transaction_reference | VARCHAR(100) | | Internal transaction reference |
| created_at | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | Record creation |
| updated_at | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP ON UPDATE | Last modification |

**Indexes:**
- idx_booking_id (booking_id) - Booking's payment
- idx_razorpay_order_id (razorpay_order_id) - Razorpay order lookup
- idx_razorpay_payment_id (razorpay_payment_id) - Razorpay payment lookup
- idx_status (status) - Payment status filtering

**Foreign Keys:**
- booking_id → bookings(id) ON DELETE RESTRICT

---

### 6. notifications

In-app notifications for users.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | CHAR(36) | PRIMARY KEY | UUID |
| user_id | CHAR(36) | NOT NULL, FK → users.id | Recipient user |
| type | VARCHAR(50) | NOT NULL | Notification type |
| title | VARCHAR(255) | NOT NULL | Notification title |
| message | TEXT | NOT NULL | Notification message |
| is_read | BOOLEAN | NOT NULL, DEFAULT FALSE | Read status |
| created_at | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | Creation timestamp |

**Indexes:**
- idx_user_id (user_id) - User's notifications
- idx_is_read (is_read) - Unread filtering
- idx_created_at (created_at) - Chronological ordering

**Foreign Keys:**
- user_id → users(id) ON DELETE CASCADE

---

### 7. audit_logs

Immutable audit trail for security-relevant events.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | CHAR(36) | PRIMARY KEY | UUID |
| user_id | CHAR(36) | FK → users.id (NULL allowed) | Acting user |
| event_type | VARCHAR(100) | NOT NULL | Event category |
| entity_type | VARCHAR(50) | NOT NULL | Affected entity type |
| entity_id | CHAR(36) | | Affected entity ID |
| description | TEXT | NOT NULL | Human-readable description |
| metadata | JSON | | Additional structured data |
| created_at | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | Event timestamp |

**Indexes:**
- idx_user_id (user_id) - User's audit trail
- idx_event_type (event_type) - Event type filtering
- idx_entity (entity_type, entity_id) - Entity-specific queries
- idx_created_at (created_at) - Time-based queries

**Foreign Keys:**
- user_id → users(id) ON DELETE SET NULL

---

## Migration System

### Migration Files

Located in `database/migrations/`:

1. `001_create_users_table.js`
2. `002_create_vehicles_table.js`
3. `003_create_vehicle_documents_table.js`
4. `004_create_bookings_table.js`
5. `005_create_payments_table.js`
6. `006_create_notifications_table.js`
7. `007_create_audit_logs_table.js`

Each migration exports an object with `up(pool)` and `down(pool)` async functions.

### Migration Runner

**File:** `database/migrate.js`

**Commands:**
```bash
npm run migrate          # Run all pending migrations (alias for: node database/migrate.js up)
node database/migrate.js up      # Run pending migrations
node database/migrate.js down    # Rollback last migration
node database/migrate.js status  # Show migration status
```

### Migration Tracking

Migrations are tracked in the `migrations` table:
- `id` - Auto-increment
- `filename` - Migration filename (unique)
- `executed_at` - Timestamp

---

## Seed Data

**File:** `database/seed.js`

**Command:**
```bash
npm run seed
```

### Default Users (password: "password123")

| Role | Email | Name |
|------|-------|------|
| ADMIN | admin@vrms.in | System Admin |
| OWNER | rajesh.kumar@vrms.in | Rajesh Kumar |
| OWNER | priya.sharma@vrms.in | Priya Sharma |
| CUSTOMER | amit.patel@vrms.in | Amit Patel |
| CUSTOMER | sunita.singh@vrms.in | Sunita Singh |

### Sample Vehicles (Indian Market)

| Make | Model | Type | Registration | Location | Rate (₹/hr) | Status |
|------|-------|------|--------------|----------|-------------|--------|
| Maruti Suzuki | Swift | HATCHBACK | DL01AB1234 | Delhi | 350.00 | APPROVED/ACTIVE |
| Hyundai | Creta | SUV | DL01CD5678 | Gurugram | 650.00 | APPROVED/ACTIVE |
| Honda | City | SEDAN | MH01EF9012 | Mumbai | 450.00 | APPROVED/ACTIVE |
| Toyota | Innova Crysta | MUV | KA01GH3456 | Bengaluru | 800.00 | APPROVED/ACTIVE |
| Bajaj | Pulsar 150 | MOTORCYCLE | TN01IJ7890 | Chennai | 150.00 | APPROVED/ACTIVE |
| TVS | Jupiter | SCOOTER | WB01KL2345 | Kolkata | 120.00 | PENDING/ACTIVE |
| Mahindra | Thar | SUV | RJ01MN6789 | Jaipur | 750.00 | REJECTED/REMOVED |

---

## Key Design Decisions

### Monetary Values
- All monetary columns use `DECIMAL(12,2)` for exact arithmetic
- No floating-point types used for currency
- Currency is INR (Indian Rupees)

### Timezone
- All timestamps stored in UTC
- Application operates in Asia/Kolkata (IST)
- Display conversion handled at application layer

### UUIDs
- All primary keys use CHAR(36) UUIDs
- Generated at application layer (crypto.randomUUID())
- No auto-increment primary keys

### Soft Deletes
- No soft deletes implemented
- Historical records preserved via RESTRICT foreign keys
- Status fields (ACTIVE/INACTIVE/DEACTIVATED/REMOVED) used instead

### Document Storage
- Documents stored in private filesystem (`./storage/private/`)
- Database stores only metadata and storage path
- Never served from public static directories

### Cascading
- `vehicle_documents` CASCADE DELETE with vehicle
- `notifications` CASCADE DELETE with user
- `vehicles`, `bookings`, `payments` RESTRICT DELETE to preserve history

---

## Environment Configuration

Required `.env` variables:

```env
DATABASE_HOST=localhost
DATABASE_PORT=3306
DATABASE_NAME=vrms
DATABASE_USER=root
DATABASE_PASSWORD=your_password
```

---

## Running Migrations

```bash
# Install dependencies
npm install

# Configure .env from .env.example
cp .env.example .env
# Edit .env with your MySQL credentials

# Run migrations
npm run migrate

# Seed development data
npm run seed

# Verify
node database/migrate.js status
```

---

## Verification Queries

```sql
-- Check all tables exist
SHOW TABLES;

-- Check users
SELECT id, name, email, role, status FROM users;

-- Check vehicles with owner
SELECT v.id, v.make, v.model, v.type, v.registration_number, 
       v.rent_per_hour, v.verification_status, v.listing_status,
       u.name as owner_name
FROM vehicles v
JOIN users u ON v.owner_id = u.id;

-- Check bookings
SELECT b.id, b.vehicle_id, b.customer_id, b.start_datetime, 
       b.end_datetime, b.total_amount, b.status
FROM bookings b;

-- Check foreign key constraints
SELECT TABLE_NAME, COLUMN_NAME, CONSTRAINT_NAME, 
       REFERENCED_TABLE_NAME, REFERENCED_COLUMN_NAME
FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE
WHERE TABLE_SCHEMA = 'vrms' 
  AND REFERENCED_TABLE_NAME IS NOT NULL;
```

---

## Related Files

- `database/migrate.js` - Migration runner
- `database/seed.js` - Development seed data
- `database/migrations/` - Individual migration files
- `server/config/database.js` - Connection pool and query helpers
- `docs/PROJECT_SPEC.md` - Detailed requirements
- `docs/IMPLEMENTATION_PHASES.md` - Phase 2 requirements