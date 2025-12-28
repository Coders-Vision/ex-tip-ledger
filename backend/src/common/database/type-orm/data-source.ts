import { DataSource } from 'typeorm';
// import { join } from 'path';
import { config } from 'dotenv';
// // import { join } from 'path';

config();

const AppDataSource = new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST,
  port: parseInt(process.env?.DB_PORT || '0000'),
  username: process.env.DB_USERNAME,
  password: `${process.env.DB_PASSWORD}`,
  database: process.env.DB_NAME,
  synchronize: false,
  dropSchema: false,
  logging: true,
  logger: 'advanced-console',
  // entities: [join(__dirname, '/src/**/*.entity{.ts,.js}')],
  // migrations: [join(__dirname, '/src/migrations/*{.ts,.js}')],
  entities: ['src/**/*.entity{.ts,.js}'],
  migrations: ['src/migrations/**/*.ts'],
  // subscribers: ['src/subscriber/**/*.ts'],
  migrationsTableName: 'migration_table',
  ssl: process.env.DB_SSL === 'true' ? true : false,
});

export default AppDataSource;
