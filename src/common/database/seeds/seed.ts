import { DataSource } from 'typeorm';
import { Merchant } from '../type-orm/entities/merchant.entity';
import { Employee } from '../type-orm/entities/employee.entity';
import { TableQR } from '../type-orm/entities/table-qr.entity';

/**
 * Seed database with initial test data
 */
export async function seedDatabase(dataSource: DataSource): Promise<void> {
  console.log('🌱 Seeding database...');

  const merchantRepo = dataSource.getRepository(Merchant);
  const employeeRepo = dataSource.getRepository(Employee);
  const tableQRRepo = dataSource.getRepository(TableQR);

  // Create test merchant
  const merchant = merchantRepo.create({
    name: 'Test Restaurant',
    email: 'restaurant@example.com',
    phone: '+1234567890',
    active: true,
  });
  await merchantRepo.save(merchant);
  console.log(`✅ Created merchant: ${merchant.name}`);

  // Create test employees
  const employees = await employeeRepo.save([
    {
      name: 'Ahmed Ali',
      email: 'ahmed@example.com',
      phone: '+1234567891',
      merchantId: merchant.id,
      active: true,
    },
    {
      name: 'Sara Mohammed',
      email: 'sara@example.com',
      phone: '+1234567892',
      merchantId: merchant.id,
      active: true,
    },
    {
      name: 'Omar Hassan',
      email: 'omar@example.com',
      phone: '+1234567893',
      merchantId: merchant.id,
      active: true,
    },
  ]);
  console.log(`✅ Created ${employees.length} employees`);

  // Create test table QR codes
  const tables = await tableQRRepo.save([
    {
      tableCode: 'T1',
      location: 'Main dining area - Table 1',
      merchantId: merchant.id,
      active: true,
    },
    {
      tableCode: 'T2',
      location: 'Main dining area - Table 2',
      merchantId: merchant.id,
      active: true,
    },
    {
      tableCode: 'T3',
      location: 'Patio - Table 3',
      merchantId: merchant.id,
      active: true,
    },
    {
      tableCode: 'T4',
      location: 'Bar area - Table 4',
      merchantId: merchant.id,
      active: true,
    },
    {
      tableCode: 'T5',
      location: 'Private room - Table 5',
      merchantId: merchant.id,
      active: true,
    },
  ]);
  console.log(`✅ Created ${tables.length} table QR codes`);

  console.log('\n🎉 Database seeded successfully!\n');
  console.log('📝 Test Data:');
  console.log(`   Merchant ID: ${merchant.id}`);
  console.log(`   Employees: ${employees.map((e) => e.id).join(', ')}`);
  console.log(`   Tables: ${tables.map((t) => t.tableCode).join(', ')}`);
}
