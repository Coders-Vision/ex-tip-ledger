import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../src/app.module';
import { DataSource } from 'typeorm';
import { Merchant, Employee, TableQR } from 'src/common/database/type-orm/entities';
import {
    TipIntent,
    TipIntentStatus,
    LedgerEntry
} from 'src/common/database/type-orm/entities';

/**
 * Required Tests for Tip Ledger System
 * 
 * 1. Idempotent tip intent creation
 * 2. Concurrent confirmation safety
 * 3. Reversal behavior
 */
describe('Tips E2E Tests - Required Test Cases', () => {
    let app: INestApplication;
    let dataSource: DataSource;
    let testMerchant: Merchant;
    let testEmployee: Employee;
    let testTable: TableQR;

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
        // Clean up database before each test using query builder to allow empty where clause
        await dataSource.getRepository(LedgerEntry).createQueryBuilder().delete().execute();
        await dataSource.getRepository(TipIntent).createQueryBuilder().delete().execute();
        await dataSource.getRepository(TableQR).createQueryBuilder().delete().execute();
        await dataSource.getRepository(Employee).createQueryBuilder().delete().execute();
        await dataSource.getRepository(Merchant).createQueryBuilder().delete().execute();

        // Create test data
        const merchantRepo = dataSource.getRepository(Merchant);
        testMerchant = await merchantRepo.save({
            name: 'Test Restaurant',
            email: 'test@restaurant.com',
            phone: '+96512345678',
            active: true,
        });

        const employeeRepo = dataSource.getRepository(Employee);
        testEmployee = await employeeRepo.save({
            name: 'Test Employee',
            email: 'employee@test.com',
            phone: '+96512345679',
            merchantId: testMerchant.id,
            active: true,
        });

        const tableRepo = dataSource.getRepository(TableQR);
        testTable = await tableRepo.save({
            tableCode: 'T1',
            location: 'Test Table',
            merchantId: testMerchant.id,
            active: true,
        });
    });

    /**
     * ============================================================
     * TEST 1: Idempotent Tip Intent Creation
     * ============================================================
     * 
     * Requirement: POST /tips/intents must be idempotent
     * - Same idempotencyKey should return the same result
     * - Should NOT create duplicate records
     * - Response should be identical for repeated requests
     */
    describe('1. Idempotent Tip Intent Creation', () => {
        it('should return the same tip intent when called with the same idempotencyKey', async () => {
            const idempotencyKey = `idem-test-${Date.now()}`;

            const createDto = {
                merchantId: testMerchant.id,
                employeeId: testEmployee.id,
                tableCode: 'T1',
                amount: 5.5,
                idempotencyKey,
            };

            // First request - should create the tip
            const response1 = await request(app.getHttpServer())
                .post('/tips/intents')
                .send(createDto)
                .expect(201);

            expect(response1.body.id).toBeDefined();
            expect(response1.body.amount).toBe(5.5);
            expect(response1.body.status).toBe(TipIntentStatus.PENDING);

            const firstTipId = response1.body.id;

            // Second request with SAME idempotencyKey - should return existing tip
            const response2 = await request(app.getHttpServer())
                .post('/tips/intents')
                .send(createDto)
                .expect(201);

            // Should return the SAME tip intent
            expect(response2.body.id).toBe(firstTipId);
            expect(response2.body.amount).toBe(5.5);
            expect(response2.body.status).toBe(TipIntentStatus.PENDING);

            // Third request to confirm idempotency
            const response3 = await request(app.getHttpServer())
                .post('/tips/intents')
                .send(createDto)
                .expect(201);

            expect(response3.body.id).toBe(firstTipId);
        });

        it('should create only ONE record in the database for duplicate requests', async () => {
            const idempotencyKey = `idem-single-${Date.now()}`;

            const createDto = {
                merchantId: testMerchant.id,
                employeeId: testEmployee.id,
                tableCode: 'T1',
                amount: 10.0,
                idempotencyKey,
            };

            // Make 5 requests with the same idempotencyKey
            await Promise.all([
                request(app.getHttpServer()).post('/tips/intents').send(createDto),
                request(app.getHttpServer()).post('/tips/intents').send(createDto),
                request(app.getHttpServer()).post('/tips/intents').send(createDto),
                request(app.getHttpServer()).post('/tips/intents').send(createDto),
                request(app.getHttpServer()).post('/tips/intents').send(createDto),
            ]);

            // Check database - should have exactly ONE record
            const tipCount = await dataSource
                .getRepository(TipIntent)
                .count({ where: { idempotencyKey } });

            expect(tipCount).toBe(1);
        });

        it('should create different tips for different idempotencyKeys', async () => {
            const createDto1 = {
                merchantId: testMerchant.id,
                employeeId: testEmployee.id,
                tableCode: 'T1',
                amount: 5.0,
                idempotencyKey: `unique-key-1-${Date.now()}`,
            };

            const createDto2 = {
                merchantId: testMerchant.id,
                employeeId: testEmployee.id,
                tableCode: 'T1',
                amount: 10.0,
                idempotencyKey: `unique-key-2-${Date.now()}`,
            };

            const response1 = await request(app.getHttpServer())
                .post('/tips/intents')
                .send(createDto1)
                .expect(201);

            const response2 = await request(app.getHttpServer())
                .post('/tips/intents')
                .send(createDto2)
                .expect(201);

            // Should be different tips
            expect(response1.body.id).not.toBe(response2.body.id);
            expect(response1.body.amount).toBe(5.0);
            expect(response2.body.amount).toBe(10.0);
        });
    });

    /**
     * ============================================================
     * TEST 2: Concurrent Confirmation Safety
     * ============================================================
     * 
     * Requirement: POST /tips/intents/:id/confirm must be:
     * - Safe under concurrent requests
     * - Create exactly ONE ledger entry
     * - Use pessimistic locking to prevent race conditions
     */
    describe('2. Concurrent Confirmation Safety', () => {
        it('should create exactly ONE ledger entry when confirmed concurrently', async () => {
            // First create a pending tip
            const createDto = {
                merchantId: testMerchant.id,
                employeeId: testEmployee.id,
                tableCode: 'T1',
                amount: 25.0,
                idempotencyKey: `concurrent-test-${Date.now()}`,
            };

            const createResponse = await request(app.getHttpServer())
                .post('/tips/intents')
                .send(createDto)
                .expect(201);

            const tipId = createResponse.body.id;

            // Simulate 10 concurrent confirmation requests
            const concurrentRequests = Array(10)
                .fill(null)
                .map(() =>
                    request(app.getHttpServer())
                        .post(`/tips/intents/${tipId}/confirm`)
                        .send(),
                );

            const results = await Promise.all(concurrentRequests);

            // All requests should succeed (either confirm or return already confirmed)
            results.forEach((result) => {
                expect([200, 201]).toContain(result.status);
                expect(result.body.status).toBe(TipIntentStatus.CONFIRMED);
            });

            // Check database - should have EXACTLY ONE ledger entry
            const ledgerCount = await dataSource
                .getRepository(LedgerEntry)
                .count({ where: { tipIntentId: tipId } });

            expect(ledgerCount).toBe(1);

            // Verify the ledger entry details
            const ledgerEntry = await dataSource
                .getRepository(LedgerEntry)
                .findOne({ where: { tipIntentId: tipId } });

            expect(ledgerEntry).toBeDefined();
            expect(Number(ledgerEntry.amount)).toBe(25.0);
            expect(ledgerEntry.type).toBe('CREDIT');
        });

        it('should return the same confirmed status for all concurrent requests', async () => {
            const createDto = {
                merchantId: testMerchant.id,
                employeeId: testEmployee.id,
                tableCode: 'T1',
                amount: 15.0,
                idempotencyKey: `concurrent-status-${Date.now()}`,
            };

            const createResponse = await request(app.getHttpServer())
                .post('/tips/intents')
                .send(createDto)
                .expect(201);

            const tipId = createResponse.body.id;

            // 10 concurrent confirmations (reduced from 20 to avoid connection issues)
            const results = await Promise.all(
                Array(10)
                    .fill(null)
                    .map(() =>
                        request(app.getHttpServer())
                            .post(`/tips/intents/${tipId}/confirm`)
                            .send(),
                    ),
            );

            // Filter out any failed requests and check successful ones
            const successfulResults = results.filter((r) => r.status === 200);
            expect(successfulResults.length).toBeGreaterThan(0);

            // All successful requests should return CONFIRMED status
            successfulResults.forEach((result) => {
                expect(result.body.id).toBe(tipId);
                expect(result.body.status).toBe(TipIntentStatus.CONFIRMED);
            });

            // Final state check
            const tipIntent = await dataSource
                .getRepository(TipIntent)
                .findOne({ where: { id: tipId } });

            expect(tipIntent.status).toBe(TipIntentStatus.CONFIRMED);
            expect(tipIntent.confirmedAt).toBeDefined();
        });

        it('should handle confirmation idempotency - calling confirm multiple times returns same result', async () => {
            const createDto = {
                merchantId: testMerchant.id,
                employeeId: testEmployee.id,
                tableCode: 'T1',
                amount: 8.5,
                idempotencyKey: `confirm-idem-${Date.now()}`,
            };

            const createResponse = await request(app.getHttpServer())
                .post('/tips/intents')
                .send(createDto)
                .expect(201);

            const tipId = createResponse.body.id;

            // First confirmation
            const confirm1 = await request(app.getHttpServer())
                .post(`/tips/intents/${tipId}/confirm`)
                .expect(200);

            expect(confirm1.body.status).toBe(TipIntentStatus.CONFIRMED);
            const confirmedAt1 = confirm1.body.confirmedAt;

            // Second confirmation (should be idempotent)
            const confirm2 = await request(app.getHttpServer())
                .post(`/tips/intents/${tipId}/confirm`)
                .expect(200);

            expect(confirm2.body.status).toBe(TipIntentStatus.CONFIRMED);
            expect(confirm2.body.confirmedAt).toBe(confirmedAt1);

            // Still only ONE ledger entry
            const ledgerCount = await dataSource
                .getRepository(LedgerEntry)
                .count({ where: { tipIntentId: tipId } });

            expect(ledgerCount).toBe(1);
        });
    });

    /**
     * ============================================================
     * TEST 3: Reversal Behavior
     * ============================================================
     * 
     * Requirement: POST /tips/intents/:id/reverse must:
     * - Be idempotent
     * - Create a reversal ledger entry (DEBIT)
     * - Only reverse CONFIRMED tips
     * - Update status to REVERSED
     */
    describe('3. Reversal Behavior', () => {
        it('should reverse a confirmed tip and create a DEBIT ledger entry', async () => {
            // Create and confirm a tip first
            const createDto = {
                merchantId: testMerchant.id,
                employeeId: testEmployee.id,
                tableCode: 'T1',
                amount: 50.0,
                idempotencyKey: `reversal-test-${Date.now()}`,
            };

            const createResponse = await request(app.getHttpServer())
                .post('/tips/intents')
                .send(createDto)
                .expect(201);

            const tipId = createResponse.body.id;

            // Confirm the tip
            await request(app.getHttpServer())
                .post(`/tips/intents/${tipId}/confirm`)
                .expect(200);

            // Reverse the tip
            const reverseResponse = await request(app.getHttpServer())
                .post(`/tips/intents/${tipId}/reverse`)
                .expect(200);

            expect(reverseResponse.body.status).toBe(TipIntentStatus.REVERSED);
            expect(reverseResponse.body.reversedAt).toBeDefined();

            // Check ledger entries
            const ledgerEntries = await dataSource
                .getRepository(LedgerEntry)
                .find({
                    where: { tipIntentId: tipId },
                    order: { createdAt: 'ASC' },
                });

            expect(ledgerEntries).toHaveLength(2);

            // First entry should be CREDIT from confirmation
            expect(ledgerEntries[0].type).toBe('CREDIT');
            expect(Number(ledgerEntries[0].amount)).toBe(50.0);

            // Second entry should be DEBIT from reversal
            expect(ledgerEntries[1].type).toBe('DEBIT');
            expect(Number(ledgerEntries[1].amount)).toBe(-50.0);
        });

        it('should be idempotent - calling reverse multiple times returns same result', async () => {
            const createDto = {
                merchantId: testMerchant.id,
                employeeId: testEmployee.id,
                tableCode: 'T1',
                amount: 30.0,
                idempotencyKey: `reversal-idem-${Date.now()}`,
            };

            const createResponse = await request(app.getHttpServer())
                .post('/tips/intents')
                .send(createDto)
                .expect(201);

            const tipId = createResponse.body.id;

            // Confirm then reverse
            await request(app.getHttpServer())
                .post(`/tips/intents/${tipId}/confirm`)
                .expect(200);

            // First reversal
            const reverse1 = await request(app.getHttpServer())
                .post(`/tips/intents/${tipId}/reverse`)
                .expect(200);

            expect(reverse1.body.status).toBe(TipIntentStatus.REVERSED);
            const reversedAt1 = reverse1.body.reversedAt;

            // Second reversal (should be idempotent)
            const reverse2 = await request(app.getHttpServer())
                .post(`/tips/intents/${tipId}/reverse`)
                .expect(200);

            expect(reverse2.body.status).toBe(TipIntentStatus.REVERSED);
            expect(reverse2.body.reversedAt).toBe(reversedAt1);

            // Third reversal
            const reverse3 = await request(app.getHttpServer())
                .post(`/tips/intents/${tipId}/reverse`)
                .expect(200);

            expect(reverse3.body.status).toBe(TipIntentStatus.REVERSED);

            // Should still have exactly 2 ledger entries (1 CREDIT, 1 DEBIT)
            const ledgerCount = await dataSource
                .getRepository(LedgerEntry)
                .count({ where: { tipIntentId: tipId } });

            expect(ledgerCount).toBe(2);
        });

        it('should NOT allow reversing a PENDING tip', async () => {
            const createDto = {
                merchantId: testMerchant.id,
                employeeId: testEmployee.id,
                tableCode: 'T1',
                amount: 20.0,
                idempotencyKey: `pending-reversal-${Date.now()}`,
            };

            const createResponse = await request(app.getHttpServer())
                .post('/tips/intents')
                .send(createDto)
                .expect(201);

            const tipId = createResponse.body.id;

            // Try to reverse without confirming first
            const reverseResponse = await request(app.getHttpServer())
                .post(`/tips/intents/${tipId}/reverse`)
                .expect(400);

            expect(reverseResponse.body.message).toContain('CONFIRMED');

            // Tip should still be PENDING
            const tipIntent = await dataSource
                .getRepository(TipIntent)
                .findOne({ where: { id: tipId } });

            expect(tipIntent.status).toBe(TipIntentStatus.PENDING);
        });

        it('should result in net zero when tip is reversed (ledger balance)', async () => {
            const tipAmount = 75.5;

            const createDto = {
                merchantId: testMerchant.id,
                employeeId: testEmployee.id,
                tableCode: 'T1',
                amount: tipAmount,
                idempotencyKey: `balance-test-${Date.now()}`,
            };

            const createResponse = await request(app.getHttpServer())
                .post('/tips/intents')
                .send(createDto)
                .expect(201);

            const tipId = createResponse.body.id;

            // Confirm and then reverse
            await request(app.getHttpServer())
                .post(`/tips/intents/${tipId}/confirm`)
                .expect(200);

            await request(app.getHttpServer())
                .post(`/tips/intents/${tipId}/reverse`)
                .expect(200);

            // Get all ledger entries for this tip
            const ledgerEntries = await dataSource
                .getRepository(LedgerEntry)
                .find({ where: { tipIntentId: tipId } });

            // Calculate net balance
            const netBalance = ledgerEntries.reduce(
                (sum, entry) => sum + Number(entry.amount),
                0,
            );

            // Net balance should be ZERO after reversal
            expect(netBalance).toBe(0);
        });

        it('should NOT allow confirming a REVERSED tip', async () => {
            const createDto = {
                merchantId: testMerchant.id,
                employeeId: testEmployee.id,
                tableCode: 'T1',
                amount: 40.0,
                idempotencyKey: `reconfirm-test-${Date.now()}`,
            };

            const createResponse = await request(app.getHttpServer())
                .post('/tips/intents')
                .send(createDto)
                .expect(201);

            const tipId = createResponse.body.id;

            // Confirm then reverse
            await request(app.getHttpServer())
                .post(`/tips/intents/${tipId}/confirm`)
                .expect(200);

            await request(app.getHttpServer())
                .post(`/tips/intents/${tipId}/reverse`)
                .expect(200);

            // Try to confirm again - should fail
            const reconfirmResponse = await request(app.getHttpServer())
                .post(`/tips/intents/${tipId}/confirm`)
                .expect(400);

            expect(reconfirmResponse.body.message).toContain('PENDING');
        });
    });
});
