# VRMS — PROJECT SPECIFICATION

Version: 1.0

Status: FINAL


# 1. PURPOSE

This document translates the finalized Vehicle Rental Management System SRS into an implementation specification.

The system is a browser-based vehicle rental platform connecting:

- Admin
- Vehicle Owner
- Customer

The system provides:

- authentication
- role-based authorization
- document verification
- vehicle listing
- vehicle search
- availability checking
- booking
- rent calculation
- Razorpay test-mode payment
- handover
- rejection
- notifications
- reporting
- auditing


# INDIAN MARKET LOCALIZATION

The VRMS product is designed for the Indian market.

This is a mandatory product constraint.

## Market

Primary market:

India

Country:

India

Country code:

IN

Timezone:

Asia/Kolkata

Primary locale:

en-IN


## Currency

Currency:

INR

Symbol:

₹

Database monetary type:

DECIMAL(12,2)

Example:

rent_per_hour = 500.00

Customer display:

₹500/hour


## Number Formatting

Use Indian number formatting:

₹1,000
₹10,000
₹1,00,000
₹12,50,000

Frontend locale:

en-IN


## Date

Primary display format:

DD/MM/YYYY

Timezone:

Asia/Kolkata


## Phone

Primary country:

India

Country code:

+91

Primary mobile format:

10 digits after country code.


## PIN Code

Indian PIN code:

6 digits.


## Address

Indian address should support:

address_line_1
address_line_2
locality
city
district
state
pin_code
country


## Documents

Indian-market vehicle verification uses:

- Registration Certificate (RC)
- Government ID
- Number Plate Photograph

Handover uses:

- Indian Driving Licence

The owner manually checks the customer's licence.


## Payments

Primary payment gateway:

Razorpay

Environment:

TEST MODE

Currency:

INR

Do not use USD as the default currency.

Do not use Stripe as the primary payment gateway.


## Pricing

All rental prices are denominated in INR.

Backend performs all calculations.

Use exact decimal arithmetic.

Never use floating-point arithmetic for authoritative monetary calculations.

Do not invent GST, convenience fees, platform fees, insurance charges, deposits, or other charges unless explicitly defined by the requirements.

The displayed total must exactly correspond to the configured pricing rules.


## Seed Data

Demo data must represent India.

Use:

- Indian cities
- Indian vehicle registration formats
- Indian vehicle categories
- INR rental prices
- Indian phone-number formats
- Indian PIN codes

Do not populate the default database with US/EU sample data.


## Market Terminology

Use:

Vehicle Registration Number
RC
Driving Licence
Number Plate
Mobile Number
PIN Code
State
District

Avoid foreign-market terminology such as:

DMV
ZIP Code
Driver's License
License Plate

unless required when discussing an external payment/API service.


## Pricing Disclaimer

Seed/demo rental prices are illustrative only.

They must not be represented as actual Indian market prices unless supported by an approved external market-data source.
# 2. TECHNOLOGY

## Frontend

HTML5
Vanilla CSS
Vanilla JavaScript


## Backend

Node.js
Express.js


## Database

MySQL 8+


## Payment

Razorpay TEST MODE


# 3. ARCHITECTURE

Use:

Client
  ↓
REST API
  ↓
Express
  ↓
Controllers
  ↓
Services
  ↓
Repositories/Data Access
  ↓
MySQL


Recommended backend:

server/
├── app.js
├── server.js
├── config/
├── routes/
├── controllers/
├── services/
├── repositories/
├── middleware/
├── validators/
└── utils/


Frontend:

client/
├── pages/
├── css/
├── js/
└── assets/


Database:

database/
├── migrations/
└── seeds/


Tests:

tests/
├── unit/
├── integration/
└── e2e/


# 4. ROLES

## ADMIN

Responsibilities:

- verification
- vehicle approval/rejection
- user management
- reports
- audit logs


## OWNER

Responsibilities:

- vehicle onboarding
- document submission
- vehicle management
- rental pricing
- availability
- booking management
- handover


## CUSTOMER

Responsibilities:

- vehicle search
- slot selection
- booking
- payment
- booking tracking


# 5. AUTHENTICATION

Registration:

OWNER or CUSTOMER

Admin is provisioned separately.

Endpoints:

POST /api/auth/register
POST /api/auth/login
POST /api/auth/logout
GET /api/auth/me

Authentication must use secure session/token management.

Failed login attempts must be throttled/locked according to configurable security policy.


# 6. VEHICLE ONBOARDING

Owner creates a vehicle.

Required vehicle information:

- make
- model
- type
- registration number
- rent per hour

Owner uploads:

- RC
- government ID
- number-plate photograph

Vehicle begins:

PENDING


# 7. ADMIN VERIFICATION

Admin views all three documents together.

Admin records:

name_match
registration_match

Approval requires:

name_match = true
AND
registration_match = true

Approval:

PENDING → APPROVED

Rejection:

PENDING → REJECTED

Rejection requires:

rejection_reason


# 8. VEHICLE STATES

Verification:

PENDING
APPROVED
REJECTED

Listing:

ACTIVE
UNAVAILABLE
REMOVED

Customer search may only expose vehicles satisfying:

verification = APPROVED

AND

listing = ACTIVE


# 9. VEHICLE MANAGEMENT

Owner may:

- create
- view
- edit
- change rent
- mark unavailable
- reactivate
- remove listing

Owner may only modify their own vehicles.

Registration number must be unique.


# 10. CUSTOMER SEARCH

Search filters:

- type
- location
- date

Customer can select:

start_datetime
end_datetime

Search result displays:

- make
- model
- type
- location
- rent per hour
- availability


# 11. AVAILABILITY

Existing confirmed booking:

existing_start
existing_end

Requested:

requested_start
requested_end

Overlap:

existing_start < requested_end
AND
existing_end > requested_start

If overlap exists, booking must be rejected.

Only CONFIRMED bookings block future availability.

The booking operation must use transaction/locking protection against concurrent requests.


# 12. BOOKING

When customer confirms slot and calculated rent:

Create:

PENDING_PAYMENT


Required booking fields:

id
vehicle_id
customer_id
start_datetime
end_datetime
duration_hours
hourly_rate_snapshot
total_amount
status
rejection_reason
handover_at
created_at
updated_at


# 13. RENT CALCULATION

Duration:

end_datetime - start_datetime

Total:

duration_hours × hourly_rate


Backend calculates final amount.

Frontend displays the amount returned by backend.

Historical booking uses:

hourly_rate_snapshot

Later changes to vehicle rent do not alter historical bookings.


# 14. BOOKING STATE MACHINE

PENDING_PAYMENT
       |
       | successful payment
       v
CONFIRMED
       |
       +----------------+
       |                |
       v                v
HANDED_OVER          REJECTED


Invalid transitions must be rejected.


# 15. PAYMENT

Payment flow:

1. Customer has PENDING_PAYMENT booking.
2. Backend creates Razorpay order.
3. Customer completes Razorpay test checkout.
4. Backend verifies payment.
5. Backend verifies signature.
6. Payment record is stored.
7. Booking becomes CONFIRMED.
8. Owner and customer are notified.


Failed/cancelled payment:

- payment recorded appropriately
- booking remains PENDING_PAYMENT
- retry allowed


# 16. PAYMENT DATA

Store:

- booking_id
- Razorpay order ID
- Razorpay payment ID
- amount
- currency
- status
- transaction reference
- timestamps

Never store card details.


# 17. HANDOVER

Owner sees confirmed booking information:

- booking ID
- customer name
- vehicle
- booking date/time

Owner manually checks driving licence.

No driving-licence image upload is required.

If valid:

CONFIRMED → HANDED_OVER

If identity/licence issue:

CONFIRMED → REJECTED


# 18. HANDOVER REJECTION

Required:

rejection_reason

On rejection:

1. booking becomes REJECTED
2. reason is recorded
3. customer is notified
4. audit log is created
5. refund service is invoked where applicable

Implement refund as a service abstraction.

Example:

RefundService.processForRejectedBooking(bookingId)

Keep the refund implementation isolated from the booking state machine.


# 19. NOTIFICATIONS

Required in-app events:

Vehicle approved
Vehicle rejected
Booking confirmed
Payment result where appropriate
Booking rejected at handover

Notify:

Owner for vehicle verification result.

Owner + Customer for booking confirmation.

Customer for handover rejection.


# 20. EMAIL

Email notifications may be implemented through a configured SMTP/email gateway.

Email is supplementary.

In-app notifications remain mandatory.


# 21. SMS

SMS is not part of the required product.

Do not implement SMS unless explicitly requested later.


# 22. DATABASE

## users

Fields:

id
name
email
phone
password_hash
role
status
created_at
updated_at
last_login_at


## vehicles

Fields:

id
owner_id
make
model
type
registration_number
description
location
rent_per_hour
verification_status
listing_status
rejection_reason
created_at
updated_at


## vehicle_documents

Fields:

id
vehicle_id
document_type
storage_path
original_filename
mime_type
file_size
uploaded_at


Document types:

RC
OWNER_ID
NUMBER_PLATE_PHOTO


## bookings

Fields:

id
vehicle_id
customer_id
start_datetime
end_datetime
duration_hours
hourly_rate_snapshot
total_amount
status
rejection_reason
handover_at
created_at
updated_at


## payments

Fields:

id
booking_id
razorpay_order_id
razorpay_payment_id
amount
currency
status
transaction_reference
created_at
updated_at


## notifications

Fields:

id
user_id
type
title
message
is_read
created_at


## audit_logs

Fields:

id
user_id
event_type
entity_type
entity_id
description
metadata
created_at


# 23. DATABASE CONSTRAINTS

Use:

- primary keys
- foreign keys
- unique registration number
- unique user email where applicable
- non-null required fields
- indexes on search fields
- indexes on booking dates
- indexes on booking status
- indexes on payment status

Use transactions for booking/payment operations.


# 24. DOCUMENT STORAGE

Private storage only.

Do not serve documents directly from public static directories.

Use protected endpoint:

GET /api/vehicles/:id/documents/:documentId

Authorization must verify access.

Admin may access verification documents.

Owner may access their own documents.

Do not expose filesystem paths.


# 25. ADMIN API

GET  /api/admin/dashboard

GET  /api/admin/verifications

GET  /api/admin/verifications/:vehicleId

POST /api/admin/verifications/:vehicleId/approve

POST /api/admin/verifications/:vehicleId/reject

GET  /api/admin/users

GET  /api/admin/users/:id

PATCH /api/admin/users/:id/status

GET /api/admin/reports/owners

GET /api/admin/reports/vehicles

GET /api/admin/reports/bookings

GET /api/admin/reports/payments

GET /api/admin/audit-logs


# 26. OWNER API

POST /api/vehicles

GET /api/vehicles/my

GET /api/vehicles/:id

PATCH /api/vehicles/:id

PATCH /api/vehicles/:id/status

DELETE /api/vehicles/:id

POST /api/vehicles/:id/documents

GET /api/vehicles/:id/documents

GET /api/vehicles/:id/verification

GET /api/owner/bookings

POST /api/bookings/:id/handover

POST /api/bookings/:id/reject


# 27. CUSTOMER API

GET /api/vehicles/search

GET /api/vehicles/:id

POST /api/bookings

GET /api/bookings/my

GET /api/bookings/:id

POST /api/payments/create-order

POST /api/payments/verify

GET /api/payments/:bookingId

GET /api/notifications

PATCH /api/notifications/:id/read

PATCH /api/notifications/read-all


# 28. WEBHOOK

POST /api/payments/webhook

Webhook handling must:

- verify authenticity
- be idempotent
- update payment state safely
- not duplicate booking confirmation
- use transactions where required


# 29. ADMIN REPORTS

Reports:

- registered owners
- listed vehicles
- bookings
- payments

Reports support:

- date range
- pagination
- sorting
- filtering where appropriate


# 30. AUDIT LOGS

Audit:

- authentication failures
- verification decisions
- booking status changes
- payment status changes
- account deactivation
- handover/rejection

Audit records must be immutable from normal application interfaces.


# 31. FRONTEND

Public:

/
 /login
 /register


Admin:

/admin/dashboard
/admin/verifications
/admin/verifications/:id
/admin/users
/admin/reports
/admin/audit-logs


Owner:

/owner/dashboard
/owner/vehicles
/owner/vehicles/create
/owner/vehicles/:id
/owner/bookings
/owner/bookings/:id


Customer:

/customer/dashboard
/customer/search
/customer/vehicles/:id
/customer/booking
/customer/payment
/customer/bookings
/customer/notifications


# 32. UI

Use a consistent design system.

Components:

- navbar
- sidebar
- cards
- forms
- buttons
- badges
- tables
- modals
- alerts
- toasts
- loading indicators
- empty states

Responsive:

mobile
tablet
desktop


# 33. VALIDATION

Validate all inputs server-side.

Vehicle:

- make
- model
- type
- registration
- rent

Booking:

- start
- end
- vehicle
- availability

Payment:

- booking
- amount
- Razorpay identifiers/signature


# 34. ERROR FORMAT

Use a consistent API format:

{
  "success": false,
  "message": "Human-readable error",
  "errorCode": "OPTIONAL_CODE"
}

Never expose internal implementation details.


# 35. PERFORMANCE

Targets:

95% normal interactive requests under 3 seconds.

Vehicle search normally under 3 seconds.

Rent calculation normally under 2 seconds.


# 36. SECURITY

Passwords:

strong one-way hashing.

Production:

HTTPS.

Documents:

private.

Payment:

Razorpay-hosted checkout.

Database:

parameterized queries.

Authorization:

least privilege.

Logging:

security-relevant events.


# 37. FINAL REQUIREMENT STATUS

All business requirements and technology decisions required for implementation are FINAL.

Do not introduce TBD requirements.

Do not ask the user to choose between alternative technologies.

Use:

Node.js
Express.js
MySQL 8+
HTML
Vanilla CSS
Vanilla JavaScript
Razorpay TEST MODE


# 38. REQUIREMENT TRACEABILITY

Implementation should preserve the following SRS functional groups:

VRMS-FR-001 through VRMS-FR-005
Authentication and authorization

VRMS-FR-006 through VRMS-FR-014
Owner documents and verification

VRMS-FR-015 through VRMS-FR-018
Vehicle management

VRMS-FR-019 through VRMS-FR-022
Vehicle search and availability

VRMS-FR-023 through VRMS-FR-025
Rent calculation and booking

VRMS-FR-026 through VRMS-FR-030
Payment

VRMS-FR-031 through VRMS-FR-035
Handover and rejection

VRMS-FR-036 through VRMS-FR-039
Notifications

VRMS-FR-040 through VRMS-FR-043
Administration, reports and audit


# 39. NONFUNCTIONAL REQUIREMENTS

Preserve:

VRMS-NFR-001
Performance

VRMS-NFR-002
Vehicle search performance

VRMS-NFR-003
Rent calculation performance

VRMS-NFR-004
Approved vehicles only

VRMS-NFR-005
Successful payment before confirmation

VRMS-NFR-006
Transactional booking/payment operations

VRMS-NFR-007
Password hashing

VRMS-NFR-008
Secure documents

VRMS-NFR-009
HTTPS and secure sessions

VRMS-NFR-010
No payment details stored

VRMS-NFR-011
Least privilege

VRMS-NFR-012
Security logging

VRMS-NFR-013
Usability

VRMS-NFR-014
Reliability

VRMS-NFR-015
Availability

VRMS-NFR-016
Maintainability

VRMS-NFR-017
Browser portability

VRMS-NFR-018
Razorpay test-mode testability


# 40. BUSINESS RULES

BR-01
Vehicle requires successful owner/document verification before listing.

BR-02
Owner sets hourly rent.

BR-03
No overlapping confirmed bookings.

BR-04
Booking confirmation requires successful Razorpay payment.

BR-05
Owner verifies driving licence manually at handover.

BR-06
Owner can reject at handover with reason.

BR-07
Historical booking/payment records must remain unaffected by later rent changes.


# 41. OTHER REQUIREMENTS

Use:

- unique identifiers
- referential integrity
- one consistent timezone
- test-mode Razorpay
- secure document retention/deletion handling