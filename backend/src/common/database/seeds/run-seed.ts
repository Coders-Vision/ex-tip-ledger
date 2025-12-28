import AppDataSource from '../type-orm/data-source';
import { seedDatabase } from './seed';

async function runSeed() {
  try {
    await AppDataSource.initialize();
    console.log('📦 Database connected\n');

    await seedDatabase(AppDataSource);

    await AppDataSource.destroy();
    console.log('\n📦 Database connection closed');
    process.exit(0);
  } catch (error) {
    console.error('❌ Seeding failed:', error);
    process.exit(1);
  }
}

runSeed();
