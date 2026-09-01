# VRMS — PROJECT MEMORY

## 1. PROJECT

Project Name:
Vehicle Rental Management System (VRMS)

Purpose:
A web-based vehicle rental management system connecting Admin,
Vehicle Owners, and Customers.

Target Market:
India

Primary Currency:
INR (₹)

Timezone:
Asia/Kolkata

---

## 2. AUTHORITATIVE PROJECT FILES

The following files contain the project's authoritative requirements
and development instructions:

- AGENTS.md
- PROJECT_SPEC.md
- IMPLEMENTATION_PHASES.md

Do not duplicate their complete contents here.

Use those files for detailed requirements.

This file only records the current implementation state and
development history needed to continue the project.

---

## 3. TECHNOLOGY STACK

Frontend:
- HTML5
- Vanilla CSS
- Vanilla JavaScript

Backend:
- Node.js
- Express.js

Database:
- MySQL 8+

Payment:
- Razorpay TEST MODE

---

## 4. CURRENT PROJECT STATE

Current Phase:
Phase 3 — Authentication

Phase Status:
COMPLETE

Overall Project Status:
PHASE 3 COMPLETE

Application Code:
Express server with health endpoint, middleware, error handling, logging, static file serving.
Authentication endpoints implemented: register, login, logout, me.

Database:
Connection pool created (config/database.js), connected and verified.
7 core tables created with migrations: users, vehicles, vehicle_documents, bookings, payments, notifications, audit_logs.
Foreign keys, indexes, unique constraints, DECIMAL(12,2) monetary types enforced.
Seed data inserted (5 users, 7 vehicles, 21 document records).

Authentication:
JWT-based authentication with access/refresh tokens in httpOnly cookies.
Password hashing with bcrypt (12 rounds).
Registration for OWNER and CUSTOMER roles.
Login with rate limiting (10 attempts per 15 min).
Logout with cookie invalidation.
GET /me endpoint with token verification.
Generic authentication errors (no user enumeration).

Vehicle Management:
Route placeholders created.

Admin Verification:
Route placeholders created.

Customer Search:
Route placeholders created.

Booking:
Route placeholders created.

Payment:
Route placeholders created.

Handover:
Route placeholders created.

Notifications:
Route placeholders created.

Reports:
Route placeholders created.

Security Hardening:
Helmet, CORS, rate limiting, cookie parser configured.

Testing:
Integration tests passing (29/29).

---

## 5. COMPLETED PHASES

Phase 0 — Analysis ✓
Phase 1 — Project Foundation ✓
Phase 2 — MySQL Database ✓
Phase 3 — Authentication ✓

---

## 6. CURRENT PHASE

Phase:
Phase 4 — Owner Document Onboarding

Objective:
Owner vehicle creation with document upload (RC, government ID, number plate photograph).
Vehicle starts as PENDING verification.
Secure document storage with MIME validation, extension validation, file size validation, safe filename, private storage, authorization.

Required APIs:
POST /api/vehicles
POST /api/vehicles/:id/documents
GET /api/vehicles/:id/documents
GET /api/vehicles/:id/verification

---

## 7. LAST COMPLETED WORK

Phase 3 — Authentication complete:
- User repository (server/repositories/userRepository.js) with CRUD operations
- Auth service (server/services/authService.js) with register, login, logout, getCurrentUser
- Auth controller (server/controllers/authController.js) with cookie-based JWT token handling
- Auth validators (server/validators/authValidators.js) with express-validator rules
- Updated auth routes (server/routes/auth.js) with rate limiting and validation
- Password hashing with bcrypt (12 rounds)
- JWT access tokens (15 min) and refresh tokens (7 days) in httpOnly cookies
- Login rate limiting: 10 attempts per 15 minutes per IP+email
- Generic error messages to prevent user enumeration
- Role-based registration (OWNER, CUSTOMER only)
- Indian phone number validation (+91XXXXXXXXXX format)
- Password strength requirements (8+ chars, upper, lower, number, special)
- 20 integration tests passing (8 registration, 5 login, 3 me, 2 logout, 2 role)

Phase 2 — MySQL Database complete:
- 7 migration files: users, vehicles, vehicle_documents, bookings, payments, notifications, audit_logs
- Migration runner (database/migrate.js) with up/down/status commands
- Seed file (database/seed.js) with Indian-market sample data
- DATABASE.md documentation
- All migrations executed and tracked in migrations table
- Seed data inserted: 5 users (admin, 2 owners, 2 customers), 7 vehicles (Indian cities, INR pricing), 21 document records
- Foreign keys, indexes, unique constraints, DECIMAL(12,2) monetary types verified
- Phase 1 integration tests still passing (9/9)

Phase 1 — Project Foundation complete:
- package.json with all dependencies
- Express server (app.js, server.js) with graceful shutdown
- MySQL connection pool (config/database.js) with testConnection, query, transaction
- Environment configuration (config/env.js, .env.example) with validation
- Error handling middleware (AppError, errorHandler)
- Logging (Winston)
- Rate limiting (apiLimiter, authLimiter, strictLimiter)
- Authentication middleware (authenticate, optionalAuth)
- Authorization middleware (authorize, authorizeOwner)
- Validation middleware (validate, validateQuery)
- File upload middleware (multer with validation)
- Health endpoint GET /api/health returning server status and DB connectivity
- Frontend scaffold with public, admin, owner, customer pages
- Static file serving with SPA fallback
- 9 integration tests passing (health, database connectivity, error handler, middleware)

---

## 8. FILES CREATED OR MODIFIED

Application source files created:

Backend:
- package.json
- server/app.js
- server/server.js
- server/config/env.js
- server/config/database.js
- server/utils/logger.js
- server/middleware/errorHandler.js
- server/middleware/rateLimiter.js
- server/middleware/auth.js
- server/middleware/authorize.js
- server/middleware/validate.js
- server/middleware/upload.js
- server/routes/auth.js
- server/routes/vehicles.js
- server/routes/bookings.js
- server/routes/payments.js
- server/routes/notifications.js
- server/routes/admin.js
- server/repositories/userRepository.js
- server/services/authService.js
- server/controllers/authController.js
- server/validators/authValidators.js

Database:
- database/migrate.js
- database/seed.js
- database/migrations/001_create_users_table.js
- database/migrations/002_create_vehicles_table.js
- database/migrations/003_create_vehicle_documents_table.js
- database/migrations/004_create_bookings_table.js
- database/migrations/005_create_payments_table.js
- database/migrations/006_create_notifications_table.js
- database/migrations/007_create_audit_logs_table.js

Frontend:
- client/pages/public/index.html
- client/pages/public/login.html
- client/pages/public/register.html
- client/pages/admin/dashboard.html
- client/pages/owner/dashboard.html
- client/pages/customer/dashboard.html
- client/css/main.css
- client/js/api.js
- client/js/auth.js
- client/js/utils.js
- client/js/pages/public/login.js
- client/js/pages/public/register.js
- client/js/pages/admin/dashboard.js
- client/js/pages/owner/dashboard.js
- client/js/pages/customer/dashboard.js

Tests:
- tests/integration/phase1.test.js
- tests/integration/phase3.test.js

Documentation:
- docs/ANALYSIS.md
- docs/DATABASE.md
- .env.example

---

## 9. DATABASE STATE

Database:
Connection pool configured, connected and verified.
All 7 core tables created via migrations.

Tables:
- users (5 records seeded)
- vehicles (7 records seeded)
- vehicle_documents (21 records seeded)
- bookings (empty, ready for bookings)
- payments (empty, ready for payments)
- notifications (empty, ready for notifications)
- audit_logs (empty, ready for audit entries)
- migrations (7 records tracking executed migrations)

Required core tables: ALL CREATED

Refer to PROJECT_SPEC.md and IMPLEMENTATION_PHASES.md for
the authoritative database requirements.

---

## 10. API STATE

API implementation:
Route placeholders created for all groups.

Required route groups:
- /api/auth/*
- /api/vehicles/*
- /api/bookings/*
- /api/payments/*
- /api/notifications/*
- /api/admin/*

Health endpoint:
GET /api/health — returns { success: true, message, timestamp, database, environment }

Refer to PROJECT_SPEC.md for the complete API specification.

---

## 11. IMPORTANT FINALIZED DECISIONS

These decisions are already finalized in the project specifications:

- Use MySQL 8+.
- Use HTML5, Vanilla CSS and Vanilla JavaScript.
- Use Node.js and Express.js.
- Use Razorpay TEST MODE.
- Target the Indian market.
- Use INR for monetary values.
- Use Asia/Kolkata as the project timezone.
- Driving licence is manually verified by the owner at handover.
- No driving licence image upload is required.
- SMS is not required.
- Backend is authoritative for pricing.
- Backend is authoritative for availability.
- Confirmed bookings cannot overlap.
- Successful payment is required before a booking becomes CONFIRMED.
- Historical bookings must preserve the hourly rate snapshot.
- Private vehicle documents must not be publicly accessible.

Do not change these decisions unless the authoritative project
requirements are explicitly changed.

---

## 12. TESTING STATE

Unit tests:
Not started.

Integration tests:
29 tests passing (9 Phase 1 + 20 Phase 3).

End-to-end tests:
Not started.

Last test result:
PASS - 29/29 tests passing

---

## 13. KNOWN ISSUES

None currently.

---

## 14. CURRENT BLOCKERS

None currently.

---

## 15. NEXT ACTION

Begin Phase 4 — Owner Document Onboarding.

Implement:
- POST /api/vehicles (owner creates vehicle listing)
- POST /api/vehicles/:id/documents (owner uploads RC, government ID, number plate photo)
- GET /api/vehicles/:id/documents (owner views uploaded documents)
- GET /api/vehicles/:id/verification (owner views verification status)

Requirements:
- Vehicle creation with make, model, type, registration_number, rent_per_hour, location, description
- Document upload with MIME validation, extension validation, file size limit (5MB)
- Safe filename generation (server-generated UUID)
- Private storage (not in public static directories)
- Authorization (owner can only access own vehicles/documents)
- Vehicle starts as PENDING verification

Tests to write:
- Vehicle creation
- Document upload (RC, ID, number plate)
- Invalid file type
- Oversized file
- Unauthorized document access
- Owner ownership verification

---

## 16. CONTEXT RECOVERY INSTRUCTION

If the AI coding agent's conversation context has been reset:

1. Read AGENTS.md.
2. Read this PROJECT_MEMORY.md.
3. Read IMPLEMENTATION_PHASES.md.
4. Read PROJECT_SPEC.md when detailed requirements are needed.
5. Inspect the current repository.
6. Compare the documented project state with the actual files and code.
7. Continue from the documented current phase.
8. Do not assume work was completed merely because it is mentioned
   in conversation history.
9. Do not automatically start the next phase.

The repository and project documentation are the source of continuity,
not the previous conversation.

---

## 17. MEMORY UPDATE RULE

After completing implementation work:

Update this file with:

- Current phase
- Phase status
- Overall project status
- Completed work
- Files created
- Files modified
- Database changes
- API changes
- Tests performed
- Test results
- Known issues
- Current blockers
- Next action

Keep this file concise.

Do not copy entire source files, requirements, API specifications,
or database schemas into this file.

Last Updated:
2026-09-01