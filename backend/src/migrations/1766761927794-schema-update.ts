import { MigrationInterface, QueryRunner } from "typeorm";

export class SchemaUpdate1766761927794 implements MigrationInterface {
    name = 'SchemaUpdate1766761927794'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "merchants" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "name" character varying(255) NOT NULL, "email" character varying(255), "phone" character varying(50), "active" boolean NOT NULL DEFAULT true, CONSTRAINT "PK_4fd312ef25f8e05ad47bfe7ed25" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "table_qrs" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "tableCode" character varying(50) NOT NULL, "location" character varying(255), "active" boolean NOT NULL DEFAULT true, "merchantId" uuid NOT NULL, CONSTRAINT "UQ_2f3f8e1a775f422f2b25679ff7a" UNIQUE ("merchantId", "tableCode"), CONSTRAINT "PK_4aab4de369227d162d0d2244e46" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_f89ee8a6214d4af0ee069cb8fa" ON "table_qrs" ("merchantId") `);
        await queryRunner.query(`CREATE TYPE "public"."users_role_enum" AS ENUM('merchant', 'Employee')`);
        await queryRunner.query(`CREATE TABLE "users" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "email" character varying NOT NULL, "password" character varying NOT NULL, "name" character varying NOT NULL, "phone" character varying, "role" "public"."users_role_enum" NOT NULL DEFAULT 'Employee', "isOAuthUser" boolean NOT NULL DEFAULT false, "providerId" character varying, "provider" character varying, "active" boolean NOT NULL DEFAULT true, CONSTRAINT "UQ_97672ac88f789774dd47f7c8be3" UNIQUE ("email"), CONSTRAINT "PK_a3ffb1c0c8416b9fc6f907b7433" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "employees" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "name" character varying(255) NOT NULL, "email" character varying(255), "phone" character varying(50), "active" boolean NOT NULL DEFAULT true, "merchantId" uuid NOT NULL, CONSTRAINT "PK_b9535a98350d5b26e7eb0c26af4" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TYPE "public"."tip_intents_status_enum" AS ENUM('PENDING', 'CONFIRMED', 'REVERSED')`);
        await queryRunner.query(`CREATE TABLE "tip_intents" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "amount" numeric(10,3) NOT NULL, "status" "public"."tip_intents_status_enum" NOT NULL DEFAULT 'PENDING', "idempotencyKey" character varying(255) NOT NULL, "employeeHint" character varying(255), "confirmedAt" TIMESTAMP WITH TIME ZONE, "reversedAt" TIMESTAMP WITH TIME ZONE, "merchantId" uuid NOT NULL, "tableQRId" uuid, "employeeId" uuid, CONSTRAINT "UQ_2a95db8e2f30e023415fa703f66" UNIQUE ("idempotencyKey"), CONSTRAINT "PK_2e75016ffec56be9b4784bacc65" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE UNIQUE INDEX "IDX_2a95db8e2f30e023415fa703f6" ON "tip_intents" ("idempotencyKey") `);
        await queryRunner.query(`CREATE INDEX "IDX_3bb781b20fbd8e643c620b28ad" ON "tip_intents" ("status") `);
        await queryRunner.query(`CREATE INDEX "IDX_0c6cf5483bc50c12ad14c2dfd0" ON "tip_intents" ("employeeId") `);
        await queryRunner.query(`CREATE INDEX "IDX_366f8df5de8fc79e04f73595eb" ON "tip_intents" ("merchantId") `);
        await queryRunner.query(`CREATE TABLE "processed_events" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "eventId" uuid NOT NULL, "eventType" character varying(50) NOT NULL, "processedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "payload" jsonb, CONSTRAINT "UQ_6df2a6135cc301de873d3b3948c" UNIQUE ("eventId"), CONSTRAINT "PK_a08d68aa0747daea9efd2ddea53" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_5e6eeed1ae1dc48be80e94abfe" ON "processed_events" ("processedAt") `);
        await queryRunner.query(`CREATE INDEX "IDX_6ee6fd9a5cfc51fd9e0bec8dc2" ON "processed_events" ("eventType") `);
        await queryRunner.query(`CREATE UNIQUE INDEX "IDX_6df2a6135cc301de873d3b3948" ON "processed_events" ("eventId") `);
        await queryRunner.query(`CREATE TYPE "public"."ledger_entries_type_enum" AS ENUM('CREDIT', 'DEBIT')`);
        await queryRunner.query(`CREATE TABLE "ledger_entries" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "amount" numeric(10,3) NOT NULL, "type" "public"."ledger_entries_type_enum" NOT NULL, "notes" text, "tipIntentId" uuid NOT NULL, "employeeId" uuid NOT NULL, CONSTRAINT "PK_6efcb84411d3f08b08450ae75d5" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_da7b4e6e69b559869e3f822ce1" ON "ledger_entries" ("createdAt") `);
        await queryRunner.query(`CREATE INDEX "IDX_b2d145308a3b2947e9478a9bc2" ON "ledger_entries" ("tipIntentId") `);
        await queryRunner.query(`CREATE INDEX "IDX_f8e5b6645a4e0d6e258c5c2f00" ON "ledger_entries" ("employeeId") `);
        await queryRunner.query(`ALTER TABLE "table_qrs" ADD CONSTRAINT "FK_f89ee8a6214d4af0ee069cb8fa9" FOREIGN KEY ("merchantId") REFERENCES "merchants"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "employees" ADD CONSTRAINT "FK_4bea67555b92f8e058f95cbb0ce" FOREIGN KEY ("merchantId") REFERENCES "merchants"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "tip_intents" ADD CONSTRAINT "FK_366f8df5de8fc79e04f73595eb6" FOREIGN KEY ("merchantId") REFERENCES "merchants"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "tip_intents" ADD CONSTRAINT "FK_53c62a0c189dd003e8f154f6236" FOREIGN KEY ("tableQRId") REFERENCES "table_qrs"("id") ON DELETE SET NULL ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "tip_intents" ADD CONSTRAINT "FK_0c6cf5483bc50c12ad14c2dfd0b" FOREIGN KEY ("employeeId") REFERENCES "employees"("id") ON DELETE SET NULL ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "ledger_entries" ADD CONSTRAINT "FK_b2d145308a3b2947e9478a9bc2d" FOREIGN KEY ("tipIntentId") REFERENCES "tip_intents"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "ledger_entries" ADD CONSTRAINT "FK_f8e5b6645a4e0d6e258c5c2f009" FOREIGN KEY ("employeeId") REFERENCES "employees"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "ledger_entries" DROP CONSTRAINT "FK_f8e5b6645a4e0d6e258c5c2f009"`);
        await queryRunner.query(`ALTER TABLE "ledger_entries" DROP CONSTRAINT "FK_b2d145308a3b2947e9478a9bc2d"`);
        await queryRunner.query(`ALTER TABLE "tip_intents" DROP CONSTRAINT "FK_0c6cf5483bc50c12ad14c2dfd0b"`);
        await queryRunner.query(`ALTER TABLE "tip_intents" DROP CONSTRAINT "FK_53c62a0c189dd003e8f154f6236"`);
        await queryRunner.query(`ALTER TABLE "tip_intents" DROP CONSTRAINT "FK_366f8df5de8fc79e04f73595eb6"`);
        await queryRunner.query(`ALTER TABLE "employees" DROP CONSTRAINT "FK_4bea67555b92f8e058f95cbb0ce"`);
        await queryRunner.query(`ALTER TABLE "table_qrs" DROP CONSTRAINT "FK_f89ee8a6214d4af0ee069cb8fa9"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_f8e5b6645a4e0d6e258c5c2f00"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_b2d145308a3b2947e9478a9bc2"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_da7b4e6e69b559869e3f822ce1"`);
        await queryRunner.query(`DROP TABLE "ledger_entries"`);
        await queryRunner.query(`DROP TYPE "public"."ledger_entries_type_enum"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_6df2a6135cc301de873d3b3948"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_6ee6fd9a5cfc51fd9e0bec8dc2"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_5e6eeed1ae1dc48be80e94abfe"`);
        await queryRunner.query(`DROP TABLE "processed_events"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_366f8df5de8fc79e04f73595eb"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_0c6cf5483bc50c12ad14c2dfd0"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_3bb781b20fbd8e643c620b28ad"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_2a95db8e2f30e023415fa703f6"`);
        await queryRunner.query(`DROP TABLE "tip_intents"`);
        await queryRunner.query(`DROP TYPE "public"."tip_intents_status_enum"`);
        await queryRunner.query(`DROP TABLE "employees"`);
        await queryRunner.query(`DROP TABLE "users"`);
        await queryRunner.query(`DROP TYPE "public"."users_role_enum"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_f89ee8a6214d4af0ee069cb8fa"`);
        await queryRunner.query(`DROP TABLE "table_qrs"`);
        await queryRunner.query(`DROP TABLE "merchants"`);
    }

}
