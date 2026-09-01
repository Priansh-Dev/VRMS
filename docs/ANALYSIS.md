# VRMS — Phase 0 Analysis & Implementation Plan

## 1. ARCHITECTURE

### System Architecture
```
Client (Browser)
    ↓ HTTPS
REST API (Express.js)
    ↓
Controllers → Services → Repositories → MySQL 8+
    ↓
Middleware (auth, validation, error handling)
    ↓
External: Razorpay (TEST MODE)
```

### Directory Structure
```
VRMS/
├── server/
│   ├── app.js                 # Express app setup
│   ├── server.js              # Entry point
│   ├── config/
│   │   ├── database.js        # MySQL pool
│   │   ├── razorpay.js        # Razorpay config
│   │   └── env.js             # Environment validation
│   ├── routes/
│   │   ├── auth.js
│   │   ├── vehicles.js
│   │   ├── bookings.js
│   │   ├── payments.js
│   │   ├── notifications.js
│   │   └── admin.js
│   ├── controllers/
│   │   ├── authController.js
│   │   ├── vehicleController.js
│   │   ├── bookingController.js
│   │   ├── paymentController.js
│   │   ├── notificationController.js
│   │   └── adminController.js
│   ├── services/
│   │   ├── authService.js
│   │   ├── vehicleService.js
│   │   ├── bookingService.js
│   │   ├── paymentService.js
│   │   ├── notificationService.js
│   │   ├── auditService.js
│   │   └── refundService.js   # Abstraction for refunds
│   ├── repositories/
│   │   ├── userRepository.js
│   │   ├── vehicleRepository.js
│   │   ├── bookingRepository.js
│   │   ├── paymentRepository.js
│   │   ├── notificationRepository.js
│   │   └── auditRepository.js
│   ├── middleware/
│   │   ├── auth.js            # JWT/session verification
│   │   ├── authorize.js       # Role-based access
│   │   ├── validate.js        # Request validation
│   │   ├── upload.js          # File upload handling
│   │   └── errorHandler.js    # Centralized errors
│   ├── validators/
│   │   ├── authValidator.js
│   │   ├── vehicleValidator.js
│   │   ├── bookingValidator.js
│   │   └── paymentValidator.js
│   └── utils/
│       ├── dateUtils.js       # IST timezone handling
│       ├── currencyUtils.js   # INR formatting
│       ├── fileUtils.js       # Secure file handling
│       └── jwtUtils.js
├── client/
│   ├── pages/
│   │   ├── public/
│   │   │   ├── index.html
│   │   │   ├── login.html
│   │   │   └── register.html
│   │   ├── admin/
│   │   │   ├── dashboard.html
│   │   │   ├── verifications.html
│   │   │   ├── users.html
│   │   │   ├── reports.html
│   │   │   └── audit-logs.html
│   │   ├── owner/
│   │   │   ├── dashboard.html
│   │   │   ├── vehicles.html
│   │   │   ├── vehicle-create.html
│   │   │   ├── vehicle-detail.html
│   │   │   └── bookings.html
│   │   └── customer/
│   │       ├── dashboard.html
│   │       ├── search.html
│   │       ├── vehicle-detail.html
│   │       ├── booking.html
│   │       ├── payment.html
│   │       ├── bookings.html
│   │       └── notifications.html
│   ├── css/
│   │   ├── main.css
│   │   ├── components.css
│   │   └── responsive.css
│   ├── js/
│   │   ├── api.js             # API client
│   │   ├── auth.js            # Auth state management
│   │   ├── utils.js
│   │   ├── pages/
│   │   │   ├── admin/
│   │   │   ├── owner/
│   │   │   └── customer/
│   │   └── components/
│   │       ├── navbar.js
│   │       ├── modal.js
│   │       ├── toast.js
│   │       └── table.js
│   └── assets/
├── database/
│   ├── migrations/
│   │   ├── 001_create_users.sql
│   │   ├── 002_create_vehicles.sql
│   │   ├── 003_create_vehicle_documents.sql
│   │   ├── 004_create_bookings.sql
│   │   ├── 005_create_payments.sql
│   │   ├── 006_create_notifications.sql
│   │   └── 007_create_audit_logs.sql
│   └── seeds/
│       └── development.sql
├── tests/
│   ├── unit/
│   ├── integration/
│   └── e2e/
├── docs/
│   ├── DATABASE.md
│   ├── API.md
│   ├── ARCHITECTURE.md
│   ├── DEPLOYMENT.md
│   ├── OWNER-GUIDE.md
│   ├── CUSTOMER-GUIDE.md
│   ├── ADMIN-GUIDE.md
│   └── PROJECT_STATUS.md
├── .env.example
├── package.json
└── README.md
```

---

## 2. MODULE STRUCTURE

### Backend Modules

| Module | Responsibility |
|--------|---------------|
| `config/` | Environment, DB pool, Razorpay client |
| `routes/` | HTTP route definitions, middleware wiring |
| `controllers/` | Request/response handling, serialization |
| `services/` | Business logic, transactions, external APIs |
| `repositories/` | Data access, SQL queries, mapping |
| `middleware/` | Auth, authorization, validation, errors |
| `validators/` | Input validation schemas |
| `utils/` | Shared utilities (dates, currency, files) |

### Frontend Modules

| Module | Responsibility |
|--------|---------------|
| `pages/` | Role-based HTML pages |
| `css/` | Design system, responsive styles |
| `js/api.js` | Fetch wrapper with auth headers |
| `js/auth.js` | Token storage, login state, redirects |
| `js/components/` | Reusable UI components (vanilla JS) |
| `js/pages/` | Page-specific logic per role |

---

## 3. DATABASE STRUCTURE

### Core Tables (from PROJECT_SPEC.md)

#### users
```sql
id              BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT
name            VARCHAR(255) NOT NULL
email           VARCHAR(255) NOT NULL UNIQUE
phone           VARCHAR(20) NOT NULL
password_hash   VARCHAR(255) NOT NULL
role            ENUM('ADMIN','OWNER','CUSTOMER') NOT NULL
status          ENUM('ACTIVE','INACTIVE') DEFAULT 'ACTIVE'
created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP
updated_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
last_login_at   TIMESTAMP NULL
```

#### vehicles
```sql
id                      BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT
owner_id                BIGINT UNSIGNED NOT NULL (FK → users.id)
make                    VARCHAR(100) NOT NULL
model                   VARCHAR(100) NOT NULL
type                    ENUM('Hatchback','Sedan','SUV','MUV','Motorcycle','Scooter','Other') NOT NULL
registration_number     VARCHAR(50) NOT NULL UNIQUE
description             TEXT
location                VARCHAR(255) NOT NULL
rent_per_hour           DECIMAL(12,2) NOT NULL
verification_status     ENUM('PENDING','APPROVED','REJECTED') DEFAULT 'PENDING'
listing_status          ENUM('ACTIVE','UNAVAILABLE','REMOVED') DEFAULT 'ACTIVE'
rejection_reason        TEXT NULL
created_at              TIMESTAMP DEFAULT CURRENT_TIMESTAMP
updated_at              TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
```

#### vehicle_documents
```sql
id                  BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT
vehicle_id          BIGINT UNSIGNED NOT NULL (FK → vehicles.id)
document_type       ENUM('RC','OWNER_ID','NUMBER_PLATE_PHOTO') NOT NULL
storage_path        VARCHAR(500) NOT NULL
original_filename   VARCHAR(255) NOT NULL
mime_type           VARCHAR(100) NOT NULL
file_size           BIGINT UNSIGNED NOT NULL
uploaded_at         TIMESTAMP DEFAULT CURRENT_TIMESTAMP
```

#### bookings
```sql
id                      BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT
vehicle_id              BIGINT UNSIGNED NOT NULL (FK → vehicles.id)
customer_id             BIGINT UNSIGNED NOT NULL (FK → users.id)
start_datetime          DATETIME NOT NULL
end_datetime            DATETIME NOT NULL
duration_hours          DECIMAL(6,2) NOT NULL
hourly_rate_snapshot    DECIMAL(12,2) NOT NULL
total_amount            DECIMAL(12,2) NOT NULL
status                  ENUM('PENDING_PAYMENT','CONFIRMED','HANDED_OVER','REJECTED') DEFAULT 'PENDING_PAYMENT'
rejection_reason        TEXT NULL
handover_at             TIMESTAMP NULL
created_at              TIMESTAMP DEFAULT CURRENT_TIMESTAMP
updated_at              TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
```

#### payments
```sql
id                      BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT
booking_id              BIGINT UNSIGNED NOT NULL (FK → bookings.id)
razorpay_order_id       VARCHAR(100) NOT NULL
razorpay_payment_id     VARCHAR(100) NULL
amount                  DECIMAL(12,2) NOT NULL
currency                CHAR(3) DEFAULT 'INR'
status                  ENUM('CREATED','PAID','FAILED','REFUNDED') DEFAULT 'CREATED'
transaction_reference   VARCHAR(255) NULL
created_at              TIMESTAMP DEFAULT CURRENT_TIMESTAMP
updated_at              TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
```

#### notifications
```sql
id              BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT
user_id         BIGINT UNSIGNED NOT NULL (FK → users.id)
type            VARCHAR(50) NOT NULL
title           VARCHAR(255) NOT NULL
message         TEXT NOT NULL
is_read         BOOLEAN DEFAULT FALSE
created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP
```

#### audit_logs
```sql
id              BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT
user_id         BIGINT UNSIGNED NULL (FK → users.id)
event_type      VARCHAR(100) NOT NULL
entity_type     VARCHAR(50) NOT NULL
entity_id       BIGINT UNSIGNED NOT NULL
description     TEXT NOT NULL
metadata        JSON NULL
created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP
```

### Key Indexes
- `users`: email (unique), role, status
- `vehicles`: owner_id, verification_status, listing_status, registration_number (unique), location
- `vehicle_documents`: vehicle_id, document_type
- `bookings`: vehicle_id, customer_id, status, start_datetime, end_datetime
- `payments`: booking_id, razorpay_order_id, status
- `notifications`: user_id, is_read, created_at
- `audit_logs`: user_id, event_type, entity_type, entity_id, created_at

### Constraints
- Foreign keys with ON DELETE RESTRICT (preserve history)
- Unique: users.email, vehicles.registration_number
- Check: rent_per_hour > 0, duration_hours > 0, total_amount > 0
- Timezone: All DATETIME stored in UTC, application uses Asia/Kolkata

---

## 4. API STRUCTURE

### Route Groups

| Group | Base Path | Auth Required |
|-------|-----------|---------------|
| Auth | `/api/auth/*` | No (except `/me`) |
| Vehicles | `/api/vehicles/*` | Yes |
| Bookings | `/api/bookings/*` | Yes |
| Payments | `/api/payments/*` | Yes |
| Notifications | `/api/notifications/*` | Yes |
| Admin | `/api/admin/*` | Yes (ADMIN only) |

### Endpoints

#### Auth
```
POST   /api/auth/register       # Owner/Customer registration
POST   /api/auth/login          # Login → returns token
POST   /api/auth/logout         # Invalidate token
GET    /api/auth/me             # Current user profile
```

#### Vehicles (Owner)
```
POST   /api/vehicles                    # Create vehicle (PENDING)
GET    /api/vehicles/my                 # List owner's vehicles
GET    /api/vehicles/:id                # Get vehicle detail
PATCH  /api/vehicles/:id                # Update vehicle (owner only)
PATCH  /api/vehicles/:id/status         # Change listing status
DELETE /api/vehicles/:id                # Remove listing
POST   /api/vehicles/:id/documents      # Upload document
GET    /api/vehicles/:id/documents      # List documents
GET    /api/vehicles/:id/verification   # Verification status
```

#### Vehicles (Customer)
```
GET    /api/vehicles/search             # Search with filters
GET    /api/vehicles/:id                # Public vehicle detail
```

#### Admin Vehicles
```
GET    /api/admin/verifications              # List pending
GET    /api/admin/verifications/:vehicleId   # View documents
POST   /api/admin/verifications/:vehicleId/approve
POST   /api/admin/verifications/:vehicleId/reject
```

#### Bookings
```
POST   /api/bookings                    # Create booking (PENDING_PAYMENT)
GET    /api/bookings/my                 # Customer's bookings
GET    /api/bookings/:id                # Booking detail
POST   /api/bookings/:id/handover       # Owner: mark handed over
POST   /api/bookings/:id/reject         # Owner: reject at handover
GET    /api/owner/bookings              # Owner's incoming bookings
```

#### Payments
```
POST   /api/payments/create-order       # Create Razorpay order
POST   /api/payments/verify             # Verify payment callback
POST   /api/payments/webhook            # Razorpay webhook
GET    /api/payments/:bookingId         # Payment status
```

#### Notifications
```
GET    /api/notifications               # List user notifications
PATCH  /api/notifications/:id/read      # Mark read
PATCH  /api/notifications/read-all      # Mark all read
```

#### Admin
```
GET    /api/admin/dashboard             # Stats summary
GET    /api/admin/users                 # List users
GET    /api/admin/users/:id             # User detail
PATCH  /api/admin/users/:id/status      # Deactivate user
GET    /api/admin/reports/owners
GET    /api/admin/reports/vehicles
GET    /api/admin/reports/bookings
GET    /api/admin/reports/payments
GET    /api/admin/audit-logs
```

### Response Format
```json
// Success
{
  "success": true,
  "data": {},
  "message": "Optional message"
}

// Error
{
  "success": false,
  "message": "Human-readable error",
  "errorCode": "OPTIONAL_CODE"
}
```

---

## 5. AUTHENTICATION DESIGN

### Strategy: JWT with HttpOnly Cookie + Refresh Token

**Registration:**
- Owner/Customer self-register via POST `/api/auth/register`
- Password: bcrypt (cost 12)
- Admin: provisioned via secure script (not API)

**Login:**
- POST `/api/auth/login` → returns access token (15 min) + refresh token (7 days) in HttpOnly cookies
- Failed attempts: track by IP + email, lock after 5 failures for 15 min

**Session:**
- Access token: JWT (RS256), claims: userId, role, exp
- Refresh token: random string, stored hashed in DB with expiry
- Logout: revoke refresh token, clear cookies

**Middleware:**
- `authenticate`: verify access token, attach `req.user`
- `authorize(roles[])`: check `req.user.role` in allowed roles
- `authorizeOwnership(resource)`: verify resource belongs to user

**Security:**
- Tokens never in localStorage
- HttpOnly, Secure, SameSite=Strict cookies
- CSRF: Double-submit cookie pattern for state-changing requests
- Rate limit: 10 req/min for auth endpoints

---

## 6. VERIFICATION WORKFLOW

### States
```
PENDING → APPROVED
    ↓
REJECTED (requires reason)
```

### Process
1. Owner creates vehicle → status = PENDING
2. Owner uploads 3 documents: RC, OWNER_ID, NUMBER_PLATE_PHOTO
3. Admin views `/api/admin/verifications` (list) → `/api/admin/verifications/:id` (detail)
4. Admin reviews all 3 documents simultaneously
5. Admin records:
   - `name_match`: boolean (RC name vs Owner ID name)
   - `registration_match`: boolean (RC registration vs number plate)
6. Approve: both must be true → vehicle.APPROVED + owner notification + audit log
7. Reject: either false → vehicle.REJECTED + reason + owner notification + audit log

### Document Access
- Private storage: `/storage/private/` (outside web root)
- Endpoint: `GET /api/vehicles/:id/documents/:documentId`
- Authorization: Admin, or vehicle owner only
- Stream file with proper headers, no direct path exposure

---

## 7. BOOKING STATE MACHINE

### States & Transitions
```
PENDING_PAYMENT
    │
    ├── successful payment ──────────────────→ CONFIRMED
    │                                             │
    │                                             ├── handover ──────→ HANDED_OVER
    │                                             │
    │                                             └── rejection ─────→ REJECTED
    │
    └── failed/cancelled payment ──────────────→ (stays PENDING_PAYMENT)
        (retry allowed)
```

### Invalid Transitions (must reject)
- PENDING_PAYMENT → HANDED_OVER
- PENDING_PAYMENT → REJECTED (except payment failure)
- CONFIRMED → PENDING_PAYMENT
- HANDED_OVER → any
- REJECTED → any

### Booking Creation Rules
1. Vehicle must be APPROVED + ACTIVE
2. Requested slot: no overlap with existing CONFIRMED bookings
   - Overlap: `existing_start < requested_end AND existing_end > requested_start`
3. Duration > 0, end > start
4. Backend calculates: `duration_hours`, `total_amount = duration_hours × hourly_rate_snapshot`
5. Store `hourly_rate_snapshot` at booking time
6. Use transaction with row locking (`SELECT ... FOR UPDATE`)

---

## 8. PAYMENT WORKFLOW (Razorpay TEST MODE)

### Flow
```
1. Customer has PENDING_PAYMENT booking
2. POST /api/payments/create-order
   → Backend creates Razorpay order (amount in paise)
   → Returns order_id, amount, currency, key_id
3. Frontend opens Razorpay checkout with order_id
4. Customer completes payment (test card)
5. Razorpay redirects to frontend success URL
   OR webhook fires
6. POST /api/payments/verify
   → Verify: razorpay_payment_id, razorpay_order_id, razorpay_signature
   → Verify amount matches booking.total_amount
   → Verify booking belongs to customer
   → Store payment record
   → Update booking → CONFIRMED
   → Create notifications (owner + customer)
   → Audit log
```

### Failure Handling
- Payment failed/cancelled: payment.status = FAILED, booking stays PENDING_PAYMENT
- Customer can retry: new order creation allowed
- Idempotency: track processed payment IDs, ignore duplicates

### Webhook
- POST `/api/payments/webhook`
- Verify signature with `RAZORPAY_WEBHOOK_SECRET`
- Handle: `payment.captured`, `payment.failed`
- Idempotent: check if payment_id already processed
- Use transaction

### Security
- Amount verified server-side (never trust frontend)
- Signature verification mandatory
- Never store card details
- Test mode only: `razorpay_key_id` starts with `rzp_test_`

---

## 9. HANDOVER WORKFLOW

### Prerequisites
- Booking status = CONFIRMED
- Requesting user = vehicle owner (verified)

### Owner View
```
GET /api/owner/bookings → list confirmed bookings
GET /api/bookings/:id → details (customer name, vehicle, booking time)
```

### Handover (Success)
```
POST /api/bookings/:id/handover
→ Verify booking is CONFIRMED
→ Verify owner owns vehicle
→ Update booking: status = HANDED_OVER, handover_at = NOW()
→ Audit log
```

### Rejection (Failure)
```
POST /api/bookings/:id/reject
Body: { "reason": "..." }
→ Verify booking is CONFIRMED
→ Verify owner owns vehicle
→ Require non-empty reason
→ Update booking: status = REJECTED, rejection_reason = reason
→ Create customer notification
→ Audit log
→ Invoke RefundService.processForRejectedBooking(bookingId)
```

### Refund Service Abstraction
```javascript
// services/refundService.js
class RefundService {
  static async processForRejectedBooking(bookingId) {
    // Abstraction - implementation can vary
    // 1. Check if payment was made
    // 2. If paid, initiate Razorpay refund (TEST MODE)
    // 3. Record refund in payments table
    // 4. Notify customer
    // Policy configurable without changing booking logic
  }
}
```

---

## 10. TESTING STRATEGY

### Unit Tests (Jest)
| Module | Coverage |
|--------|----------|
| `services/authService` | hash, verify, token generation |
| `services/bookingService` | overlap detection, price calc, state transitions |
| `services/paymentService` | signature verification, order creation |
| `validators/*` | input validation rules |
| `utils/currencyUtils` | INR formatting, paise conversion |
| `utils/dateUtils` | IST handling, duration calc |

### Integration Tests (Supertest + Test DB)
| Feature | Scenarios |
|---------|-----------|
| Auth | register, login, logout, throttling, role access |
| Vehicles | CRUD, document upload, ownership, status changes |
| Verification | admin approval/rejection, document access |
| Search | filters, approval/status visibility, overlap |
| Bookings | create, overlap prevention, rate snapshot, concurrency |
| Payments | order, success, failure, webhook, retry, idempotency |
| Handover | success, rejection, reason, notification, refund invoke |
| Notifications | create, read, authorization |
| Reports | admin access, date filters, pagination |
| Users | admin list, deactivate, audit |

### End-to-End Tests (Playwright)
**Flow A (Happy Path):**
1. Owner registers → creates vehicle → uploads 3 docs
2. Admin logs in → reviews → approves (both matches true)
3. Customer registers → searches → selects slot → books
4. Customer pays via Razorpay test → booking CONFIRMED
5. Owner views booking → verifies licence → handover
6. Verify notifications, audit logs

**Flow B (Rejection):**
1. Owner submits vehicle
2. Admin rejects (name mismatch)
3. Owner sees rejection + reason

**Flow C (Overlap):**
1. Customer A books slot
2. Customer B attempts overlapping slot → rejected

**Flow D (Payment Failure):**
1. Booking created
2. Payment fails/cancelled
3. Booking stays PENDING_PAYMENT
4. Customer retries → success

**Flow E (Handover Rejection):**
1. Confirmed booking
2. Owner rejects at handover with reason
3. Customer notified, audit logged, refund invoked

### Test Infrastructure
- Test DB: separate MySQL instance/schema
- Migrations run before test suite
- Seeds for consistent test data
- Cleanup after each test (transactions rollback)
- CI: run on every push

---

## 11. IMPLEMENTATION SEQUENCE (Phase Summary)

| Phase | Focus | Key Deliverables |
|-------|-------|------------------|
| 1 | Foundation | Express server, health endpoint, MySQL pool, error handling, frontend scaffold |
| 2 | Database | 7 migrations, seeds, constraints, indexes, DATABASE.md |
| 3 | Auth | Register, login, logout, me, JWT, middleware, throttling |
| 4 | Owner Onboarding | Vehicle create, 3 document uploads, secure storage, PENDING state |
| 5 | Vehicle Mgmt | Owner CRUD, rent/availability, ownership enforcement |
| 6 | Admin Verification | Dashboard, doc review, approve/reject, notifications, audit |
| 7 | Customer Search | Search API, filters, availability check, frontend |
| 8 | Booking | Create booking, overlap prevention, rate snapshot, transactions |
| 9 | Razorpay | Order, verify, webhook, idempotency, CONFIRMED transition |
| 10 | Handover | Owner view, handover, rejection, refund abstraction |
| 11 | Notifications | In-app events, API, UI dropdown/page |
| 12 | Reports | 4 admin reports, filters, pagination |
| 13 | User Mgmt | Admin user list, deactivate, audit |
| 14 | Frontend | All pages, responsive, components, journeys |
| 15 | Security | Review all vectors, fix issues |
| 16 | Full Testing | Unit, integration, E2E - all flows pass |
| 17 | Documentation | README, DATABASE, API, ARCHITECTURE, DEPLOYMENT, guides |

---

## 12. KEY TECHNICAL DECISIONS

| Decision | Rationale |
|----------|-----------|
| JWT + HttpOnly cookies | Secure, no localStorage XSS risk |
| bcrypt cost 12 | Strong password hashing |
| DECIMAL(12,2) for money | Exact arithmetic, INR paise precision |
| UTC in DB, IST in app | Consistent timezone, India market |
| Private document storage | Security requirement |
| Row locking for bookings | Prevent race conditions |
| Refund service abstraction | Isolate policy from booking logic |
| Razorpay TEST MODE only | No real payments |
| Vanilla JS frontend | No framework dependency |
| Indian market localization | INR, IST, en-IN, Indian formats |

---

## 13. RISKS & MITIGATIONS

| Risk | Mitigation |
|------|------------|
| Booking race conditions | SELECT FOR UPDATE in transaction |
| Payment duplicate processing | Idempotency keys, processed payment_id tracking |
| Document path traversal | Server-generated names, validate paths |
| Timezone bugs | Single source: dateUtils.js, all UTC in DB |
| Float money errors | DECIMAL everywhere, currencyUtils for math |
| Admin document access | Authorization middleware on every endpoint |
| Razorpay webhook spoofing | Signature verification with webhook secret |
| Test data pollution | Separate test DB, transaction rollback |

---

## 14. NEXT ACTION

**Phase 0 Complete.** Ready to begin Phase 1 — Project Foundation.

Update PROJECT_MEMORY.md with:
- Current phase: Phase 1
- Phase status: NOT STARTED
- Analysis complete
- Implementation plan documented in docs/ANALYSIS.md