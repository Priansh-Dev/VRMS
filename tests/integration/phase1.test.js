const request = require('supertest');
const app = require('../../server/app');
const { testConnection } = require('../../server/config/database');

describe('Phase 1 - Project Foundation Tests', () => {
  let server;

  beforeAll((done) => {
    server = app.listen(0, () => {
      done();
    });
  });

  afterAll((done) => {
    server.close(() => {
      done();
    });
  });

  describe('GET /api/health', () => {
    it('should return 200 with success message', async () => {
      const response = await request(app)
        .get('/api/health')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('VRMS API is running');
      expect(response.body.timestamp).toBeDefined();
      expect(['development', 'test']).toContain(response.body.environment);
      expect(response.body.database).toBeDefined();
    });

    it('should have correct content type', async () => {
      const response = await request(app)
        .get('/api/health')
        .expect('Content-Type', /json/);
    });
  });

  describe('Database Connectivity', () => {
    it('should test database connection function exists', () => {
      expect(typeof testConnection).toBe('function');
    });

    it('should return boolean from testConnection', async () => {
      const result = await testConnection();
      expect(typeof result).toBe('boolean');
    });
  });

  describe('Error Handler', () => {
    it('should return 404 for unknown routes', async () => {
      const response = await request(app)
        .get('/api/unknown-route')
        .expect(404);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Endpoint not found');
      expect(response.body.errorCode).toBe('NOT_FOUND');
    });

    it('should return 404 for unknown API routes with JSON', async () => {
      const response = await request(app)
        .get('/api/does-not-exist')
        .expect(404);

      expect(response.body.success).toBe(false);
      expect(response.body.errorCode).toBe('NOT_FOUND');
    });
  });

  describe('Middleware', () => {
    it('should parse JSON bodies', async () => {
      const response = await request(app)
        .post('/api/vehicles')
        .send({ make: 'Test', model: 'Model' })
        .expect(501);

      expect(response.body.success).toBe(false);
      expect(response.body.errorCode).toBe('NOT_IMPLEMENTED');
    });

    it('should have CORS headers', async () => {
      const response = await request(app)
        .get('/api/health')
        .expect(200);

      expect(response.headers['access-control-allow-origin']).toBeDefined();
    });

    it('should have security headers from helmet', async () => {
      const response = await request(app)
        .get('/api/health')
        .expect(200);

      expect(response.headers['x-content-type-options']).toBe('nosniff');
    });
  });
});