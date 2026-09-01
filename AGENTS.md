# VRMS — Nemotron/OpenCode Development Instructions

## 1. PROJECT

Project:

Vehicle Rental Management System (VRMS)

VRMS is a web-based vehicle rental management system connecting:

- Admin
- Vehicle Owner
- Customer

The system supports:

- User registration and authentication
- Role-based authorization
- Owner document submission
- Admin document verification
- Vehicle listing
- Vehicle availability
- Customer vehicle search
- Date/time slot selection
- Automatic rent calculation
- Booking
- Razorpay test-mode payment
- Booking confirmation
- Manual driving licence verification at handover
- Handover completion
- Booking rejection at handover
- Notifications
- Administration
- Reports
- Audit logging


## 2. AUTHORITATIVE DOCUMENTS

Always read:

1. docs/SRS.pdf
2. docs/PROJECT_SPEC.md
3. docs/IMPLEMENTATION_PHASES.md
4. AGENTS.md

The functional requirements and implementation decisions are FINAL.

Do not invent alternative business requirements.

Do not ask the user to resolve requirements that have already been finalized.

If a genuine contradiction exists between the documents, stop the affected implementation and report the contradiction.


## 3. TECHNOLOGY STACK

### Frontend

Use:

- HTML5
- Vanilla CSS
- Vanilla JavaScript

Do NOT use:

- React
- Vue
- Angular
- Svelte
- Next.js
- Nuxt
- frontend component frameworks

The frontend must remain framework-free.


### Backend

Use:

- Node.js
- Express.js


### Database

Use:

- MySQL 8+

MySQL is the finalized database choice.

Use:

- migrations
- foreign keys
- primary keys
- unique constraints
- indexes
- transactions
- referential integrity


### Payments

Use:

- Razorpay
- TEST MODE only

No real payments shall ever be processed by this project.


## 4. USER ROLES

There are exactly three application roles:

ADMIN
OWNER
CUSTOMER


### ADMIN

Admin can:

- review pending vehicle verifications
- inspect RC
- inspect owner ID
- inspect number-plate photograph
- record verification matches
- approve vehicles
- reject vehicles
- record rejection reasons
- manage users
- deactivate users where authorized
- view reports
- view audit logs


### OWNER

Owner can:

- register
- log in
- submit RC
- submit government ID
- submit number-plate photograph
- create vehicle listings
- update vehicle details
- update rent per hour
- change vehicle availability
- remove vehicle listings
- view incoming bookings
- view confirmed booking details
- manually verify customer's driving licence at handover
- mark booking as handed over
- reject booking at handover
- provide rejection reason


### CUSTOMER

Customer can:

- register
- log in
- search vehicles
- filter vehicles
- select date/time
- view calculated rent
- create booking
- make Razorpay test-mode payment
- retry failed/cancelled payment
- view booking status
- receive notifications


## 5. FINALIZED BUSINESS DECISIONS

The following decisions are FINAL.

### Database

MySQL 8+.


### Driving Licence

Driving licence verification at handover is performed manually by the vehicle owner.

The system does NOT require driving-licence image upload as part of the standard handover workflow.

The system records the resulting handover/rejection action.


### SMS

SMS is NOT part of the required implementation.

Implement:

- on-screen notifications

Email notification support may be implemented through a configured gateway if included in the approved implementation.


### Handover Rejection / Refund

When a confirmed booking is rejected at handover:

- rejection reason must be recorded
- booking status becomes REJECTED
- customer is notified
- an audit record is created
- the system invokes a refund-service abstraction where applicable

Do not invent a new customer-facing refund policy.

The refund integration must remain isolated so its business policy can be configured without redesigning booking logic.


## 6. SECURITY

Security is mandatory.

Never:

- store plaintext passwords
- expose private documents publicly
- trust frontend authorization
- trust frontend pricing
- trust frontend availability
- trust frontend booking status
- trust frontend payment status
- store card details
- hardcode credentials
- expose SQL queries to users
- expose server stack traces to users

Always:

- hash passwords
- validate authorization server-side
- validate resource ownership
- validate uploaded files
- protect private documents
- use parameterized SQL
- use transactions
- verify Razorpay payments server-side
- verify Razorpay signatures
- handle webhooks safely
- maintain audit logs


## 7. AUTHENTICATION

Registration supports:

- OWNER
- CUSTOMER

Admin accounts must be provisioned securely.

Implement:

POST /api/auth/register
POST /api/auth/login
POST /api/auth/logout
GET /api/auth/me

Requirements:

- password hashing
- session/token security
- logout invalidation
- generic authentication errors
- failed-login throttling/locking
- authorization middleware


## 8. AUTHORIZATION

Every protected endpoint must verify authentication.

Role-specific endpoints must verify the required role.

Owner operations must verify ownership.

Admin operations must be restricted to ADMIN.

Customers must not access owner/admin operations.

Owners must not access admin operations.


## 9. DOCUMENT SECURITY

Sensitive documents:

- RC
- Owner government ID
- Vehicle number-plate photograph

Documents must:

- be stored privately
- never be placed in public static directories
- have server-generated filenames
- have validated MIME types
- have validated extensions
- have file-size limits
- be protected against path traversal
- be accessible only to authorized users

Authorized access:

- concerned owner
- concerned customer where applicable
- admin


## 10. VEHICLE VERIFICATION

A new vehicle starts as:

PENDING

Admin reviews:

1. RC
2. Owner ID
3. Number-plate photograph

Admin records:

name_match
registration_match

Vehicle can be approved ONLY when:

name_match = true

AND

registration_match = true

Possible verification states:

PENDING
APPROVED
REJECTED

Rejected vehicles require a rejection reason.

The backend must enforce approval conditions.


## 11. VEHICLE AVAILABILITY

Vehicles may be:

ACTIVE
UNAVAILABLE
REMOVED

Only approved and appropriately active vehicles may appear in customer search.

A vehicle must not appear in customer search until admin approval.


## 12. BOOKING

Booking states:

PENDING_PAYMENT
CONFIRMED
HANDED_OVER
REJECTED

Allowed flow:

PENDING_PAYMENT
    ↓
CONFIRMED
    ↓
HANDED_OVER

or:

CONFIRMED
    ↓
REJECTED


Do not permit arbitrary state transitions.

A booking must not become CONFIRMED without successful Razorpay payment confirmation.


## 13. BOOKING OVERLAP

A vehicle cannot have two overlapping confirmed bookings.

Overlap condition:

existing_start < requested_end
AND
existing_end > requested_start

The backend must enforce this.

Frontend availability is informational only.

Booking creation must use appropriate transaction/locking strategy to prevent race conditions.


## 14. RENT CALCULATION

Owner defines:

rent_per_hour

Total rent:

duration_hours × rent_per_hour

Backend is authoritative.

Never trust:

- frontend duration
- frontend hourly rate
- frontend total
- frontend availability

Booking must preserve historical pricing.

Store:

hourly_rate_snapshot

Historical bookings must not change when the owner later changes the vehicle's rent.


## 15. PAYMENT

Razorpay TEST MODE only.

Flow:

PENDING_PAYMENT
    ↓
Razorpay order
    ↓
Razorpay checkout
    ↓
server-side verification
    ↓
successful payment
    ↓
CONFIRMED


Failed/cancelled payment:

PENDING_PAYMENT remains.

Customer may retry.

Implement:

- order creation
- payment verification
- signature verification
- webhook handling
- idempotency
- payment status
- Razorpay transaction references


## 16. HANDOVER

Only CONFIRMED bookings may be handed over.

Owner sees:

- customer name
- booking ID
- vehicle
- booking time

Owner manually checks the customer's driving licence.

Successful verification:

CONFIRMED → HANDED_OVER

Identity/licence issue:

CONFIRMED → REJECTED

Rejection requires a reason.


## 17. NOTIFICATIONS

Required notification events:

- vehicle approved
- vehicle rejected
- booking confirmed
- payment result where appropriate
- booking rejected at handover

Required notification channel:

- on-screen/in-app

Email may be implemented through a configured gateway.

SMS is not required.


## 18. AUDIT LOGGING

Audit important events including:

- successful login
- failed login
- vehicle submission
- verification decision
- vehicle approval
- vehicle rejection
- booking creation
- booking confirmation
- booking handover
- booking rejection
- payment events
- user deactivation

Audit logs are ADMIN-only.


## 19. DATABASE

Core entities:

- users
- vehicles
- vehicle_documents
- bookings
- payments
- notifications
- audit_logs

Use:

- foreign keys
- indexes
- unique constraints
- transactions
- referential integrity

Historical records must remain consistent.

Do not delete historical bookings/payments simply because a user or vehicle becomes inactive.


## 20. TIME

Use one project-wide timezone.

Store and display date/time consistently.

Use an unambiguous datetime format.

Configure timezone explicitly rather than relying on machine defaults.


## 21. API

Use REST-style APIs.

Primary route groups:

/api/auth/*
/api/vehicles/*
/api/bookings/*
/api/payments/*
/api/notifications/*
/api/admin/*


## 22. FRONTEND

Use only:

HTML
CSS
Vanilla JavaScript

Required UI characteristics:

- responsive
- accessible
- clear navigation
- validation messages
- loading states
- empty states
- error states
- success states
- confirmation dialogs


## 23. PERFORMANCE

Respect SRS performance targets:

- 95% of normal interactive page requests within 3 seconds
- vehicle search normally within 3 seconds
- rent calculation normally within 2 seconds

Do not prematurely optimize.

Use proper database indexes and efficient queries.


## 24. TESTING

Each phase must include appropriate tests.

Test:

- authentication
- authorization
- ownership
- document security
- verification
- vehicle search
- availability
- overlap prevention
- pricing
- booking state transitions
- payments
- Razorpay verification
- handover
- rejection
- refund-service invocation
- notifications
- reports
- audit logging


## 25. DEVELOPMENT PROCESS

Work phase-by-phase.

Before implementation:

1. Read the relevant specifications.
2. Inspect the existing repository.
3. Inspect related code.
4. Identify affected files.
5. Implement only the requested phase.

After implementation:

1. Run tests.
2. Run lint/static checks if configured.
3. Start the application where appropriate.
4. Verify database migrations.
5. Fix errors.
6. Summarize changes.

Do NOT automatically start the next phase.


## 26. FILE MODIFICATION

Before modifying an existing file:

- inspect it
- understand it
- preserve working behavior

Do not rewrite unrelated code.

Do not delete existing functionality without a reason.


## 27. DEPENDENCIES

Do not add unnecessary dependencies.

Before adding a dependency:

1. Check whether existing code can solve the problem.
2. Check whether Node.js/browser APIs solve it.
3. Check whether an existing dependency already provides the functionality.

No frontend framework.


## 28. ENVIRONMENT

Never commit secrets.

Use:

.env

Provide:

.env.example

Expected configuration categories:

DATABASE_HOST
DATABASE_PORT
DATABASE_NAME
DATABASE_USER
DATABASE_PASSWORD

RAZORPAY_KEY_ID
RAZORPAY_KEY_SECRET
RAZORPAY_WEBHOOK_SECRET

Authentication/session secrets as required.


## 29. ERROR HANDLING

Use centralized error handling.

API errors must not expose:

- stack traces
- database credentials
- filesystem paths
- SQL statements
- secrets


## 30. FINAL STOP RULE

After every phase report:

# INDIAN MARKET LOCALIZATION — MANDATORY

This Vehicle Rental Management System is designed primarily for the INDIAN MARKET.

India is the target market and all business, pricing, payment, localization, document, and UX decisions must be appropriate for Indian users.

Do not assume US/EU market conventions.

## Currency

All rental prices and monetary values are in:

INR (Indian Rupees)

Use:

₹

Examples:

₹500/hour
₹1,250
₹12,500

Do not use USD, EUR, GBP, etc. for customer-facing rental pricing.

Database monetary values must be stored using an appropriate exact decimal representation, not floating-point arithmetic.

Recommended:

DECIMAL(12,2)

The backend is authoritative for all monetary calculations.

## Indian Number Formatting

Customer-facing amounts should use Indian numbering conventions.

Examples:

₹1,000
₹10,000
₹1,00,000
₹12,50,000

Use Indian locale formatting where appropriate:

en-IN

Do not use western grouping such as:

₹100,000

when displaying customer-facing values.

## GST / Taxes

Do not invent GST or other tax calculations unless explicitly defined by the business requirements.

If tax functionality is implemented later, it must be configurable and India-compatible.

Never silently add a tax percentage to the rental amount.

## Payment

Use Razorpay TEST MODE.

Razorpay is the payment gateway for the Indian-market implementation.

Support the payment methods made available through the configured Razorpay test environment.

Do not implement Stripe as the primary payment gateway.

Never store card details.

## Phone Numbers

Indian phone numbers are the primary supported phone format.

Support:

+91XXXXXXXXXX

and appropriate local 10-digit formats.

Normalize phone numbers internally where practical.

Do not assume US +1 phone formatting.

## Email

Email addresses must follow normal RFC-compatible validation.

## Addresses

The address model should support Indian addresses.

Where address fields are required, support concepts such as:

- address line
- locality
- city
- district where applicable
- state
- PIN code
- country

Default country:

India

Default country code:

IN

## PIN Codes

Indian PIN codes are six digits.

Example:

201301

Validate Indian PIN codes appropriately where PIN-code validation is required.

Do not use US ZIP-code assumptions.

## States and Union Territories

Where state selection is required, use Indian States and Union Territories.

Do not use US state abbreviations.

Store the selected state as structured data rather than relying only on free-text input.

## Driving Licence

Driving licence verification is designed for the Indian market.

The owner manually verifies the customer's driving licence at vehicle handover.

Do not invent a foreign driver's-license workflow.

Do not require an automated US DMV-style verification system.

## Vehicle Documents

The vehicle/document verification workflow is India-oriented.

Relevant documents include:

- Registration Certificate (RC)
- Government ID
- Vehicle number-plate photograph

Use Indian terminology such as:

RC
Registration Number
Number Plate
Driving Licence

Do not replace these with foreign equivalents.

## Vehicle Registration

Indian vehicle registration numbers must be treated as the primary registration format.

Do not assume US-style license plate formats.

Registration number validation should be tolerant enough to support legitimate Indian registration formats rather than enforcing a US pattern.

## Date and Time

Use Indian Standard Time (IST) for the application's primary operating context.

Timezone:

Asia/Kolkata

Customer-facing dates should follow Indian conventions.

Use:

DD/MM/YYYY

where a numeric date is displayed.

Use 24-hour time internally and where appropriate.

Customer-facing time may use a clear 12-hour or 24-hour presentation, but it must be unambiguous.

## Language

The primary application language is:

English

However, UX terminology should be understandable to Indian users.

Do not introduce American-specific terminology where an Indian/common business term is more appropriate.

Examples:

"Vehicle Registration Number"
"Driving Licence"
"RC"
"PIN Code"
"Mobile Number"

## Indian Market Pricing

Vehicle rental prices must be realistic for an Indian rental-market context.

Do not insert arbitrary US/EU rental prices into seed data.

Development/demo pricing should be expressed in INR.

Example:

rent_per_hour = 500.00

not:

rent_per_hour = 50.00 USD

Seed data should use plausible Indian vehicle categories and INR pricing.

Do not claim that seed prices represent actual market rates unless verified externally.

## Indian Vehicle Categories

The system should support vehicle categories relevant to India, such as:

- Hatchback
- Sedan
- SUV
- MUV
- Motorcycle
- Scooter
- Other

Do not hardcode only US-specific categories.

## Indian Cities

Demo/seed data should use Indian cities.

Examples:

Delhi
Noida
Ghaziabad
Gurugram
Mumbai
Pune
Bengaluru
Hyderabad
Chennai
Kolkata

Do not use US cities for default demo data.

## Indian Market Principle

Whenever a design decision is ambiguous, prefer the implementation that is appropriate for:

Indian customers
Indian vehicle owners
Indian rental businesses
Indian payment infrastructure
Indian documents
Indian currency
Indian date/time conventions

Do not silently introduce US/EU assumptions.

### Implemented
Features completed.

### Files Changed
All created/modified files.

### Database Changes
Tables, migrations, indexes, seeds.

### API Changes
New/modified endpoints.

### Tests
Tests run and results.

### Known Issues
Remaining technical issues.

### Specification Traceability
Relevant SRS requirement IDs.

Then STOP.

Do not automatically begin the next phase.