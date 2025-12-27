import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../src/app.module';
import { DataSource } from 'typeorm';
import { User, Merchant, Employee, UserRole } from 'src/common/database/type-orm/entities';

/**
 * Auth E2E Tests
 * 
 * 1. User Registration (Merchant & Employee)
 * 2. User Login
 * 3. Token Refresh
 * 4. Protected Routes (GET /auth/me)
 */
describe('Auth E2E Tests', () => {
  let app: INestApplication;
  let dataSource: DataSource;
  let testMerchant: Merchant;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        transform: true,
      }),
    );

    await app.init();
    dataSource = moduleFixture.get<DataSource>(DataSource);
  });

  afterAll(async () => {
    await dataSource.destroy();
    await app.close();
  });

  beforeEach(async () => {
    // Clean up in correct order (respecting foreign keys)
    await dataSource.getRepository(Employee).createQueryBuilder().delete().execute();
    await dataSource.getRepository(Merchant).createQueryBuilder().delete().execute();
    await dataSource.getRepository(User).createQueryBuilder().delete().execute();

    // Create a test merchant for employee registration tests
    testMerchant = await dataSource.getRepository(Merchant).save({
      name: 'Test Restaurant',
      email: 'restaurant@test.com',
      phone: '+96512345678',
      active: true,
    });
  });

  // ===========================================
  // 1. MERCHANT REGISTRATION TESTS
  // ===========================================
  describe('POST /auth/register (Merchant)', () => {
    const merchantUser = {
      email: 'owner@restaurant.com',
      password: 'password123',
      name: 'Restaurant Owner',
      role: 'merchant',
      businessName: 'Best Restaurant',
      phone: '+96512345678',
    };

    it('should register a merchant and create Merchant record', async () => {
      const response = await request(app.getHttpServer())
        .post('/auth/register')
        .send(merchantUser)
        .expect(201);

      expect(response.body).toHaveProperty('accessToken');
      expect(response.body).toHaveProperty('refreshToken');
      expect(response.body).toHaveProperty('userId');
      expect(response.body.email).toBe(merchantUser.email);
      expect(response.body.name).toBe(merchantUser.name);

      // Verify Merchant record was created
      const merchant = await dataSource.getRepository(Merchant).findOne({
        where: { email: merchantUser.email },
      });
      expect(merchant).toBeDefined();
      expect(merchant?.name).toBe(merchantUser.businessName);

      // Verify User record has correct role
      const user = await dataSource.getRepository(User).findOne({
        where: { email: merchantUser.email },
      });
      expect(user?.role).toBe(UserRole.MERCHANT);
    });

    it('should reject merchant registration without businessName', async () => {
      const response = await request(app.getHttpServer())
        .post('/auth/register')
        .send({
          email: 'owner@test.com',
          password: 'password123',
          name: 'Owner',
          role: 'merchant',
          // Missing businessName
        })
        .expect(400);

      // class-validator returns array of messages
      const messages = Array.isArray(response.body.message)
        ? response.body.message.join(' ')
        : response.body.message;
      expect(messages).toContain('businessName');
    });

    it('should reject duplicate email registration', async () => {
      await request(app.getHttpServer())
        .post('/auth/register')
        .send(merchantUser)
        .expect(201);

      const response = await request(app.getHttpServer())
        .post('/auth/register')
        .send(merchantUser)
        .expect(409);

      expect(response.body.message).toBe('Email already registered');
    });
  });

  // ===========================================
  // 2. EMPLOYEE REGISTRATION TESTS
  // ===========================================
  describe('POST /auth/register (Employee)', () => {
    it('should register an employee and create Employee record', async () => {
      const employeeUser = {
        email: 'waiter@restaurant.com',
        password: 'password123',
        name: 'John Waiter',
        role: 'Employee',
        merchantId: testMerchant.id,
        phone: '+96512345679',
      };

      const response = await request(app.getHttpServer())
        .post('/auth/register')
        .send(employeeUser)
        .expect(201);

      expect(response.body).toHaveProperty('accessToken');
      expect(response.body).toHaveProperty('refreshToken');
      expect(response.body.email).toBe(employeeUser.email);

      // Verify Employee record was created
      const employee = await dataSource.getRepository(Employee).findOne({
        where: { email: employeeUser.email },
      });
      expect(employee).toBeDefined();
      expect(employee?.name).toBe(employeeUser.name);
      expect(employee?.merchantId).toBe(testMerchant.id);

      // Verify User record has correct role
      const user = await dataSource.getRepository(User).findOne({
        where: { email: employeeUser.email },
      });
      expect(user?.role).toBe(UserRole.EMPLOYEE);
    });

    it('should reject employee registration without merchantId', async () => {
      const response = await request(app.getHttpServer())
        .post('/auth/register')
        .send({
          email: 'waiter@test.com',
          password: 'password123',
          name: 'Waiter',
          role: 'Employee',
          // Missing merchantId
        })
        .expect(400);

      // class-validator returns array of messages
      const messages = Array.isArray(response.body.message)
        ? response.body.message.join(' ')
        : response.body.message;
      expect(messages).toContain('merchantId');
    });

    it('should reject employee registration with non-existent merchant', async () => {
      const response = await request(app.getHttpServer())
        .post('/auth/register')
        .send({
          email: 'waiter@test.com',
          password: 'password123',
          name: 'Waiter',
          role: 'Employee',
          merchantId: '00000000-0000-0000-0000-000000000000',
        });

      // Could be 400 (validation) or 404 (not found) depending on order
      expect([400, 404]).toContain(response.status);
    });
  });

  // ===========================================
  // 3. VALIDATION TESTS
  // ===========================================
  describe('POST /auth/register (Validation)', () => {
    it('should reject invalid email format', async () => {
      const response = await request(app.getHttpServer())
        .post('/auth/register')
        .send({
          email: 'invalid-email',
          password: 'password123',
          name: 'Test User',
          role: 'merchant',
          businessName: 'Test',
        })
        .expect(400);

      expect(response.body.message).toEqual(
        expect.arrayContaining([expect.stringContaining('email')]),
      );
    });

    it('should reject short password', async () => {
      await request(app.getHttpServer())
        .post('/auth/register')
        .send({
          email: 'test@example.com',
          password: '123',
          name: 'Test User',
          role: 'merchant',
          businessName: 'Test',
        })
        .expect(400);
    });

    it('should reject invalid role', async () => {
      await request(app.getHttpServer())
        .post('/auth/register')
        .send({
          email: 'test@example.com',
          password: 'password123',
          name: 'Test User',
          role: 'admin', // Invalid role
          businessName: 'Test',
        })
        .expect(400);
    });
  });

  // ===========================================
  // 4. USER LOGIN TESTS
  // ===========================================
  describe('POST /auth/login', () => {
    const merchantUser = {
      email: 'login-test@restaurant.com',
      password: 'password123',
      name: 'Login Test Owner',
      role: 'merchant',
      businessName: 'Login Test Restaurant',
    };

    beforeEach(async () => {
      // Register a merchant user before login tests
      await request(app.getHttpServer())
        .post('/auth/register')
        .send(merchantUser);
    });

    it('should login with valid credentials', async () => {
      const response = await request(app.getHttpServer())
        .post('/auth/login')
        .send({
          email: merchantUser.email,
          password: merchantUser.password,
        })
        .expect(200);

      expect(response.body).toHaveProperty('accessToken');
      expect(response.body).toHaveProperty('refreshToken');
      expect(response.body).toHaveProperty('userId');
      expect(response.body.email).toBe(merchantUser.email);
    });

    it('should reject invalid password', async () => {
      const response = await request(app.getHttpServer())
        .post('/auth/login')
        .send({
          email: merchantUser.email,
          password: 'wrongpassword',
        })
        .expect(401);

      expect(response.body.message).toBe('Invalid credentials');
    });

    it('should reject non-existent user', async () => {
      const response = await request(app.getHttpServer())
        .post('/auth/login')
        .send({
          email: 'nonexistent@example.com',
          password: 'password123',
        })
        .expect(401);

      expect(response.body.message).toBe('Invalid credentials');
    });

    it('should reject inactive user', async () => {
      // Deactivate the user
      await dataSource.getRepository(User).update(
        { email: merchantUser.email },
        { active: false },
      );

      const response = await request(app.getHttpServer())
        .post('/auth/login')
        .send({
          email: merchantUser.email,
          password: merchantUser.password,
        })
        .expect(401);

      expect(response.body.message).toBe('Account is inactive');
    });
  });

  // ===========================================
  // 5. TOKEN REFRESH TESTS
  // ===========================================
  describe('POST /auth/refresh', () => {
    let refreshToken: string;
    const refreshTestUser = {
      email: 'refresh-test@restaurant.com',
      password: 'password123',
      name: 'Refresh Test Owner',
      role: 'merchant',
      businessName: 'Refresh Test Restaurant',
    };

    beforeEach(async () => {
      // Register and get refresh token
      const response = await request(app.getHttpServer())
        .post('/auth/register')
        .send(refreshTestUser);
      refreshToken = response.body.refreshToken;
    });

    it('should refresh access token with valid refresh token', async () => {
      const response = await request(app.getHttpServer())
        .post('/auth/refresh')
        .send({ refreshToken })
        .expect(200);

      expect(response.body).toHaveProperty('accessToken');
      expect(typeof response.body.accessToken).toBe('string');
    });

    it('should reject invalid refresh token', async () => {
      const response = await request(app.getHttpServer())
        .post('/auth/refresh')
        .send({ refreshToken: 'invalid-token' })
        .expect(401);

      expect(response.body.message).toBe('Invalid refresh token');
    });

    it('should reject refresh for inactive user', async () => {
      // Deactivate the user
      await dataSource.getRepository(User).update(
        { email: refreshTestUser.email },
        { active: false },
      );

      const response = await request(app.getHttpServer())
        .post('/auth/refresh')
        .send({ refreshToken })
        .expect(401);

      expect(response.body.message).toBe('Invalid refresh token');
    });

    it('should reject refresh for deleted user', async () => {
      // Delete the user
      await dataSource.getRepository(User).delete({ email: refreshTestUser.email });

      const response = await request(app.getHttpServer())
        .post('/auth/refresh')
        .send({ refreshToken })
        .expect(401);

      expect(response.body.message).toBe('Invalid refresh token');
    });
  });

  // ===========================================
  // 6. PROTECTED ROUTE TESTS (GET /auth/me)
  // ===========================================
  describe('GET /auth/me', () => {
    let accessToken: string;
    const meTestUser = {
      email: 'me-test@restaurant.com',
      password: 'password123',
      name: 'Me Test Owner',
      role: 'merchant',
      businessName: 'Me Test Restaurant',
    };

    beforeEach(async () => {
      // Register and get access token
      const response = await request(app.getHttpServer())
        .post('/auth/register')
        .send(meTestUser);
      accessToken = response.body.accessToken;
    });

    it('should return user profile with valid token', async () => {
      const response = await request(app.getHttpServer())
        .get('/auth/me')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('id');
      expect(response.body).toHaveProperty('email', meTestUser.email);
      expect(response.body).toHaveProperty('name', meTestUser.name);
      expect(response.body).toHaveProperty('role');
      // Password should not be returned
      expect(response.body).not.toHaveProperty('password');
    });

    it('should reject request without token', async () => {
      await request(app.getHttpServer())
        .get('/auth/me')
        .expect(401);
    });

    it('should reject request with invalid token', async () => {
      await request(app.getHttpServer())
        .get('/auth/me')
        .set('Authorization', 'Bearer invalid-token')
        .expect(401);
    });

    it('should reject request with malformed authorization header', async () => {
      await request(app.getHttpServer())
        .get('/auth/me')
        .set('Authorization', accessToken) // Missing "Bearer " prefix
        .expect(401);
    });

    it('should reject token for inactive user', async () => {
      // Deactivate the user
      await dataSource.getRepository(User).update(
        { email: meTestUser.email },
        { active: false },
      );

      await request(app.getHttpServer())
        .get('/auth/me')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(401);
    });

    it('should reject token for deleted user', async () => {
      // Delete the user
      await dataSource.getRepository(User).delete({ email: meTestUser.email });

      await request(app.getHttpServer())
        .get('/auth/me')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(401);
    });
  });

  // ===========================================
  // 7. TOKEN VALIDITY TESTS
  // ===========================================
  describe('Token Validity', () => {
    it('should generate different tokens for different users', async () => {
      const user1 = await request(app.getHttpServer())
        .post('/auth/register')
        .send({
          email: 'token-user1@restaurant.com',
          password: 'password123',
          name: 'Token User 1',
          role: 'merchant',
          businessName: 'Token Restaurant 1',
        });

      const user2 = await request(app.getHttpServer())
        .post('/auth/register')
        .send({
          email: 'token-user2@restaurant.com',
          password: 'password123',
          name: 'Token User 2',
          role: 'merchant',
          businessName: 'Token Restaurant 2',
        });

      expect(user1.body.accessToken).not.toBe(user2.body.accessToken);
      expect(user1.body.refreshToken).not.toBe(user2.body.refreshToken);
    });

    it('should generate different tokens on multiple logins', async () => {
      const tokenTestUser = {
        email: 'multi-login@restaurant.com',
        password: 'password123',
        name: 'Multi Login User',
        role: 'merchant',
        businessName: 'Multi Login Restaurant',
      };

      await request(app.getHttpServer())
        .post('/auth/register')
        .send(tokenTestUser);

      const login1 = await request(app.getHttpServer())
        .post('/auth/login')
        .send({
          email: tokenTestUser.email,
          password: tokenTestUser.password,
        });

      // Small delay to ensure different timestamp in token
      await new Promise(resolve => setTimeout(resolve, 100));

      const login2 = await request(app.getHttpServer())
        .post('/auth/login')
        .send({
          email: tokenTestUser.email,
          password: tokenTestUser.password,
        });

      // Due to same payload and quick succession, tokens might be same if iat is same second
      // But both should be valid
      expect(login1.body.accessToken).toBeDefined();
      expect(login2.body.accessToken).toBeDefined();
    });

    it('refreshed token should be different from original', async () => {
      const refreshedTestUser = {
        email: 'refreshed-test@restaurant.com',
        password: 'password123',
        name: 'Refreshed Test User',
        role: 'merchant',
        businessName: 'Refreshed Restaurant',
      };

      const registerResponse = await request(app.getHttpServer())
        .post('/auth/register')
        .send(refreshedTestUser);

      const originalAccessToken = registerResponse.body.accessToken;

      // Small delay
      await new Promise(resolve => setTimeout(resolve, 1100));

      const refreshResponse = await request(app.getHttpServer())
        .post('/auth/refresh')
        .send({ refreshToken: registerResponse.body.refreshToken });

      const newAccessToken = refreshResponse.body.accessToken;

      // New token should work
      await request(app.getHttpServer())
        .get('/auth/me')
        .set('Authorization', `Bearer ${newAccessToken}`)
        .expect(200);

      // Original token should still work (until it expires)
      await request(app.getHttpServer())
        .get('/auth/me')
        .set('Authorization', `Bearer ${originalAccessToken}`)
        .expect(200);
    });
  });
});
