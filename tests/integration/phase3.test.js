const request = require('supertest');
const app = require('../../server/app');
const { query } = require('../../server/config/database');

describe('Phase 3 - Authentication Tests', () => {
  let server;
  let ownerAccessToken;
  let customerAccessToken;
  let ownerId;
  let customerId;

  beforeAll((done) => {
    server = app.listen(0, () => {
      done();
    });
  });

  afterAll(async () => {
    await query('DELETE FROM users WHERE email LIKE "%test%"');
    server.close(() => {});
  });

  describe('POST /api/auth/register', () => {
    it('should register a new OWNER with valid data', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send({
          name: 'Test Owner',
          email: 'owner.test@vrms.in',
          phone: '+919876543210',
          password: 'SecurePass123!',
          role: 'OWNER'
        })
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('Registration successful');
      expect(response.body.data.user).toBeDefined();
      expect(response.body.data.user.role).toBe('OWNER');
      expect(response.body.data.user.email).toBe('owner.test@vrms.in');
      expect(response.headers['set-cookie']).toBeDefined();
    });

    it('should register a new CUSTOMER with valid data', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send({
          name: 'Test Customer',
          email: 'customer.test@vrms.in',
          phone: '+919876543211',
          password: 'SecurePass123!',
          role: 'CUSTOMER'
        })
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data.user.role).toBe('CUSTOMER');
    });

    it('should reject registration with invalid email', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send({
          name: 'Test User',
          email: 'invalid-email',
          phone: '+919876543212',
          password: 'SecurePass123!',
          role: 'CUSTOMER'
        })
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.errorCode).toBe('VALIDATION_ERROR');
    });

    it('should reject registration with weak password', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send({
          name: 'Test User',
          email: 'weak.test@vrms.in',
          phone: '+919876543213',
          password: 'weak',
          role: 'CUSTOMER'
        })
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.errorCode).toBe('VALIDATION_ERROR');
    });

    it('should reject registration with invalid phone format', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send({
          name: 'Test User',
          email: 'phone.test@vrms.in',
          phone: '1234567890',
          password: 'SecurePass123!',
          role: 'CUSTOMER'
        })
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.errorCode).toBe('VALIDATION_ERROR');
    });

    it('should reject registration with invalid role', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send({
          name: 'Test User',
          email: 'role.test@vrms.in',
          phone: '+919876543214',
          password: 'SecurePass123!',
          role: 'ADMIN'
        })
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.errorCode).toBe('VALIDATION_ERROR');
    });

    it('should reject duplicate email registration', async () => {
      await request(app)
        .post('/api/auth/register')
        .send({
          name: 'Duplicate User',
          email: 'duplicate.test@vrms.in',
          phone: '+919876543215',
          password: 'SecurePass123!',
          role: 'CUSTOMER'
        })
        .expect(201);

      const response = await request(app)
        .post('/api/auth/register')
        .send({
          name: 'Duplicate User 2',
          email: 'duplicate.test@vrms.in',
          phone: '+919876543216',
          password: 'SecurePass123!',
          role: 'CUSTOMER'
        })
        .expect(409);

      expect(response.body.success).toBe(false);
      expect(response.body.errorCode).toBe('EMAIL_EXISTS');
    });

    it('should reject registration with missing required fields', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send({
          email: 'missing.test@vrms.in',
          password: 'SecurePass123!'
        })
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.errorCode).toBe('VALIDATION_ERROR');
    });
  });

  describe('POST /api/auth/login', () => {
    beforeAll(async () => {
      const ownerRes = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'owner.test@vrms.in',
          password: 'SecurePass123!'
        });
      ownerAccessToken = ownerRes.headers['set-cookie']?.find(c => c.startsWith('accessToken='));
      const ownerMe = await request(app)
        .get('/api/auth/me')
        .set('Cookie', ownerAccessToken);
      ownerId = ownerMe.body.data.user.id;

      const customerRes = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'customer.test@vrms.in',
          password: 'SecurePass123!'
        });
      customerAccessToken = customerRes.headers['set-cookie']?.find(c => c.startsWith('accessToken='));
      const customerMe = await request(app)
        .get('/api/auth/me')
        .set('Cookie', customerAccessToken);
      customerId = customerMe.body.data.user.id;
    });

    it('should login with valid credentials', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'owner.test@vrms.in',
          password: 'SecurePass123!'
        })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('Login successful');
      expect(response.body.data.user).toBeDefined();
      expect(response.body.data.user.email).toBe('owner.test@vrms.in');
      expect(response.headers['set-cookie']).toBeDefined();
    });

    it('should reject login with invalid email', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'nonexistent@vrms.in',
          password: 'SecurePass123!'
        })
        .expect(401);

      expect(response.body.success).toBe(false);
      expect(response.body.errorCode).toBe('INVALID_CREDENTIALS');
    });

    it('should reject login with invalid password', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'owner.test@vrms.in',
          password: 'WrongPassword123!'
        })
        .expect(401);

      expect(response.body.success).toBe(false);
      expect(response.body.errorCode).toBe('INVALID_CREDENTIALS');
    });

    it('should reject login with missing credentials', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'owner.test@vrms.in'
        })
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.errorCode).toBe('VALIDATION_ERROR');
    });

    it('should enforce rate limiting on login attempts', async () => {
      for (let i = 0; i < 10; i++) {
        await request(app)
          .post('/api/auth/login')
          .send({
            email: 'ratelimit.test@vrms.in',
            password: 'WrongPass123!'
          });
      }

      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'ratelimit.test@vrms.in',
          password: 'WrongPass123!'
        })
        .expect(429);

      expect(response.body.success).toBe(false);
      expect(response.body.errorCode).toBe('AUTH_RATE_LIMIT_EXCEEDED');
    });
  });

  describe('GET /api/auth/me', () => {
    it('should return current user with valid token', async () => {
      const response = await request(app)
        .get('/api/auth/me')
        .set('Cookie', ownerAccessToken)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.user.id).toBe(ownerId);
      expect(response.body.data.user.email).toBe('owner.test@vrms.in');
      expect(response.body.data.user.role).toBe('OWNER');
    });

    it('should reject request without token', async () => {
      const response = await request(app)
        .get('/api/auth/me')
        .expect(401);

      expect(response.body.success).toBe(false);
      expect(response.body.errorCode).toBe('UNAUTHORIZED');
    });

    it('should reject request with invalid token', async () => {
      const response = await request(app)
        .get('/api/auth/me')
        .set('Cookie', 'accessToken=invalid.token.here')
        .expect(401);

      expect(response.body.success).toBe(false);
      expect(response.body.errorCode).toBe('UNAUTHORIZED');
    });
  });

  describe('POST /api/auth/logout', () => {
    it('should logout successfully and clear cookies', async () => {
      const response = await request(app)
        .post('/api/auth/logout')
        .set('Cookie', customerAccessToken)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('Logout successful');
      expect(response.headers['set-cookie']).toBeDefined();

      const cookies = response.headers['set-cookie'];
      const accessCleared = cookies.some(c => c.startsWith('accessToken=;') && (c.includes('Max-Age=0') || c.includes('Expires=Thu, 01 Jan 1970')));
      const refreshCleared = cookies.some(c => c.startsWith('refreshToken=;') && (c.includes('Max-Age=0') || c.includes('Expires=Thu, 01 Jan 1970')));
      expect(accessCleared).toBe(true);
      expect(refreshCleared).toBe(true);
    });

    it('should logout without token (idempotent)', async () => {
      const response = await request(app)
        .post('/api/auth/logout')
        .expect(200);

      expect(response.body.success).toBe(true);
    });
  });

  describe('Role-based authorization', () => {
    it('should allow OWNER to access own endpoints', async () => {
      const response = await request(app)
        .get('/api/auth/me')
        .set('Cookie', ownerAccessToken)
        .expect(200);

      expect(response.body.data.user.role).toBe('OWNER');
    });

    it('should allow CUSTOMER to access own endpoints', async () => {
      const response = await request(app)
        .get('/api/auth/me')
        .set('Cookie', customerAccessToken)
        .expect(200);

      expect(response.body.data.user.role).toBe('CUSTOMER');
    });
  });
});