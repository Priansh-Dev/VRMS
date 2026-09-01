# VRMS — IMPLEMENTATION PHASES

Status: FINAL

Technology:

- HTML
- Vanilla CSS
- Vanilla JavaScript
- Node.js
- Express.js
- MySQL 8+
- Razorpay TEST MODE


# GLOBAL RULE

Implement exactly ONE phase at a time.

After finishing a phase:

1. Run tests.
2. Fix errors.
3. Verify functionality.
4. Report changes.
5. STOP.

Never automatically start the next phase.


# PHASE 0 — ANALYSIS

## Goal

Understand the complete system before coding.

## Tasks

Read:

- docs/PROJECT_SPEC.md
- AGENTS.md
- docs/IMPLEMENTATION_PHASES.md

Produce:

1. architecture
2. module structure
3. database structure
4. API structure
5. authentication design
6. verification workflow
7. booking state machine
8. payment workflow
9. handover workflow
10. testing strategy

Do not write application code.

## Deliverable

Implementation plan.

STOP.


# PHASE 1 — PROJECT FOUNDATION

## Tasks

Initialize:

- package.json
- Node.js
- Express
- environment configuration
- MySQL connection
- server
- error handler
- logging
- validation foundation
- middleware structure
- frontend foundation

Create:

GET /api/health

Expected:

{
  "success": true,
  "message": "VRMS API is running"
}

Create:

server/
client/
database/
tests/

Verify application starts.

Verify MySQL connection.

## Tests

- health endpoint
- database connectivity
- error handler

STOP.


# PHASE 2 — MYSQL DATABASE

## Goal

Build the complete relational schema.

## Tables

users
vehicles
vehicle_documents
bookings
payments
notifications
audit_logs

Implement:

- migrations
- foreign keys
- indexes
- unique constraints
- timestamps
- appropriate monetary types
- booking/payment relationships

Seed:

- admin
- owners
- customers
- sample vehicles

Do not insert fake identity documents.

Create:

docs/DATABASE.md

## Tests

- migrations
- rollback where supported
- constraints
- foreign keys
- unique registration number
- unique user identity

STOP.


# PHASE 3 — AUTHENTICATION

## Implement

POST /api/auth/register
POST /api/auth/login
POST /api/auth/logout
GET /api/auth/me

Registration:

OWNER
CUSTOMER

Implement:

- password hashing
- login
- logout
- session/token handling
- login throttling
- generic errors
- authentication middleware
- role middleware

## Tests

- valid registration
- invalid registration
- duplicate account
- login
- invalid login
- logout
- unauthorized request
- role restriction
- repeated failed login

STOP.


# PHASE 4 — OWNER DOCUMENT ONBOARDING

## Implement

Owner vehicle creation.

Owner document upload:

- RC
- government ID
- number plate photograph

Vehicle:

PENDING

Implement secure document storage.

Required:

- MIME validation
- extension validation
- file size validation
- safe filename
- private storage
- authorization

## APIs

POST /api/vehicles

POST /api/vehicles/:id/documents

GET /api/vehicles/:id/documents

GET /api/vehicles/:id/verification

## Tests

- vehicle creation
- document upload
- invalid file
- oversized file
- unauthorized document access
- owner ownership

STOP.


# PHASE 5 — VEHICLE MANAGEMENT

## Implement

Owner:

- list vehicles
- view vehicle
- edit vehicle
- change rent
- change availability
- remove listing

## APIs

GET /api/vehicles/my

GET /api/vehicles/:id

PATCH /api/vehicles/:id

PATCH /api/vehicles/:id/status

DELETE /api/vehicles/:id

## Rules

Registration number unique.

Owner can only edit own vehicle.

Unapproved vehicle cannot appear in search.

## Tests

CRUD.

Ownership.

Status changes.

Historical data preservation.

STOP.


# PHASE 6 — ADMIN VERIFICATION

## Implement

Admin dashboard.

Pending verification list.

Verification details.

Admin sees:

- RC
- ID
- number plate photo

Admin records:

name match
registration match

Approval requires both.

Rejection requires reason.

## APIs

GET /api/admin/dashboard

GET /api/admin/verifications

GET /api/admin/verifications/:vehicleId

POST /api/admin/verifications/:vehicleId/approve

POST /api/admin/verifications/:vehicleId/reject

## Side Effects

Approval:

- vehicle APPROVED
- owner notification
- audit log

Rejection:

- vehicle REJECTED
- reason
- owner notification
- audit log

## Tests

- admin authorization
- document access
- valid approval
- failed name match
- failed registration match
- rejection
- notification
- audit

STOP.


# PHASE 7 — CUSTOMER SEARCH

## Implement

Search:

- vehicle type
- location
- date

Only show:

APPROVED + ACTIVE

## API

GET /api/vehicles/search

## Availability

Check existing CONFIRMED bookings.

Prevent overlapping slots.

## Frontend

Customer search.

Vehicle cards.

Vehicle details.

Slot selection.

## Tests

- approved vehicle
- pending vehicle hidden
- rejected vehicle hidden
- unavailable vehicle hidden
- type filter
- location filter
- date filter
- overlapping slot

STOP.


# PHASE 8 — BOOKING

## Implement

POST /api/bookings

GET /api/bookings/my

GET /api/bookings/:id

Backend calculates:

duration

total rent

Store:

hourly_rate_snapshot

Create:

PENDING_PAYMENT

## Rules

Validate:

- vehicle
- approval
- active status
- dates
- availability

Backend controls final amount.

Use transaction/locking protection.

## Tests

- valid booking
- invalid dates
- unavailable vehicle
- overlapping confirmed booking
- correct duration
- correct total
- historical rate snapshot
- concurrent booking attempts

STOP.


# PHASE 9 — RAZORPAY PAYMENT

## Implement

TEST MODE only.

APIs:

POST /api/payments/create-order

POST /api/payments/verify

POST /api/payments/webhook

GET /api/payments/:bookingId

## Flow

PENDING_PAYMENT

→ Razorpay order

→ checkout

→ verification

→ payment success

→ CONFIRMED

## Failure

Failed/cancelled:

remain PENDING_PAYMENT

Allow retry.

## Security

Verify:

- amount
- booking
- Razorpay signature
- webhook authenticity

Implement idempotency.

## Tests

- order
- success
- failure
- cancellation
- invalid signature
- duplicate webhook
- duplicate callback
- retry

STOP.


# PHASE 10 — HANDOVER

## Implement

Owner confirmed-booking view.

Owner manually checks driving licence.

No licence image upload.

Successful:

CONFIRMED → HANDED_OVER

Rejected:

CONFIRMED → REJECTED

Rejection requires reason.

## APIs

POST /api/bookings/:id/handover

POST /api/bookings/:id/reject

## Rejection Side Effects

- reason
- customer notification
- audit log
- refund service invocation where applicable

## Tests

- valid handover
- unauthorized owner
- invalid state
- valid rejection
- missing reason
- notification
- audit
- refund-service invocation

STOP.


# PHASE 11 — NOTIFICATIONS

## Implement

In-app notification service.

Events:

- vehicle approved
- vehicle rejected
- booking confirmed
- payment result
- handover rejection

## APIs

GET /api/notifications

PATCH /api/notifications/:id/read

PATCH /api/notifications/read-all

## UI

- notification dropdown
- unread count
- notifications page

## Tests

- notification creation
- read state
- authorization
- correct recipient

STOP.


# PHASE 12 — REPORTS

## Implement

Admin reports:

- owners
- vehicles
- bookings
- payments

Date-range filters.

Pagination.

Sorting.

## APIs

GET /api/admin/reports/owners

GET /api/admin/reports/vehicles

GET /api/admin/reports/bookings

GET /api/admin/reports/payments

## Tests

- admin access
- date filtering
- pagination
- correct totals
- unauthorized access

STOP.


# PHASE 13 — USER MANAGEMENT

## Implement

Admin:

- list users
- search users
- filter users
- view user
- deactivate user where authorized

## APIs

GET /api/admin/users

GET /api/admin/users/:id

PATCH /api/admin/users/:id/status

Do not destroy historical records.

Create audit log.

## Tests

- admin authorization
- user listing
- filtering
- deactivation
- audit log
- historical preservation

STOP.


# PHASE 14 — COMPLETE FRONTEND

## Implement

Public:

- landing
- login
- registration

Admin:

- dashboard
- verifications
- users
- reports
- audit logs

Owner:

- dashboard
- vehicles
- documents
- bookings
- handover

Customer:

- dashboard
- search
- vehicle details
- booking
- payment
- bookings
- notifications

## UI

Use:

- Vanilla CSS
- responsive layout
- forms
- tables
- cards
- badges
- modals
- toasts
- loading states
- empty states
- errors

No frontend framework.

## Tests

Test all major user journeys.

STOP.


# PHASE 15 — SECURITY HARDENING

Review:

Authentication.

Authorization.

SQL injection.

XSS.

CSRF/session security as applicable.

Rate limiting.

File uploads.

Private documents.

Path traversal.

Payment verification.

Webhook verification.

Booking race conditions.

Sensitive error messages.

Secrets.

CORS.

HTTP security headers.

Production HTTPS configuration.

Fix all critical/high issues.

STOP.


# PHASE 16 — FULL TESTING

## Unit Tests

- services
- validators
- pricing
- state transitions

## Integration Tests

- authentication
- vehicles
- verification
- bookings
- payments
- notifications
- reports

## End-to-End

### Flow A

Owner:

register
→ create vehicle
→ upload documents

Admin:

review
→ approve

Customer:

search
→ select slot
→ booking
→ Razorpay test payment

Owner:

view booking
→ manually verify licence
→ handover


### Flow B

Owner submits vehicle.

Admin rejects.

Owner sees rejection.


### Flow C

Customer attempts overlapping booking.

System rejects it.


### Flow D

Payment fails.

Booking remains PENDING_PAYMENT.

Customer retries.


### Flow E

Owner rejects confirmed booking at handover.

Reason recorded.

Customer notified.

Audit logged.

Refund service invoked where applicable.

## Final Result

All tests pass.

STOP.


# PHASE 17 — DOCUMENTATION AND DELIVERY

Create:

README.md

docs/DATABASE.md

docs/API.md

docs/ARCHITECTURE.md

docs/DEPLOYMENT.md

docs/OWNER-GUIDE.md

docs/CUSTOMER-GUIDE.md

docs/ADMIN-GUIDE.md

docs/PROJECT_STATUS.md

README must include:

- project overview
- architecture
- stack
- prerequisites
- MySQL setup
- environment variables
- migrations
- seed
- development
- tests
- Razorpay test-mode setup
- deployment

PROJECT_STATUS.md must contain:

- completed features
- tests
- known limitations
- deployment requirements
- security status

STOP.


# FINAL ACCEPTANCE CHECKLIST

Authentication:

[ ] Owner registration
[ ] Customer registration
[ ] Login
[ ] Logout
[ ] RBAC
[ ] Failed-login throttling

Owner:

[ ] Vehicle creation
[ ] RC upload
[ ] ID upload
[ ] Number plate upload
[ ] Vehicle management
[ ] Rent management
[ ] Availability management
[ ] Booking management
[ ] Handover
[ ] Rejection

Admin:

[ ] Verification
[ ] Approval
[ ] Rejection
[ ] User management
[ ] Reports
[ ] Audit logs

Customer:

[ ] Search
[ ] Filters
[ ] Availability
[ ] Slot selection
[ ] Rent calculation
[ ] Booking
[ ] Payment
[ ] Retry
[ ] Booking status
[ ] Notifications

Payment:

[ ] Razorpay test mode
[ ] Server-side verification
[ ] Signature verification
[ ] Webhook
[ ] Idempotency

Security:

[ ] Password hashing
[ ] Private documents
[ ] Authorization
[ ] Input validation
[ ] SQL injection protection
[ ] Secure payment handling
[ ] Audit logging

Quality:

[ ] Responsive UI
[ ] Tests
[ ] Error handling
[ ] Documentation
[ ] MySQL migrations
[ ] Seed data
[ ] Deployment documentation