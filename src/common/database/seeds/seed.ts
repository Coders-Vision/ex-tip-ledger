import { DataSource } from 'typeorm';
import { faker } from '@faker-js/faker';
import * as bcrypt from 'bcrypt';
import { User, UserRole } from '../type-orm/entities/user.entity';
import { Merchant } from '../type-orm/entities/merchant.entity';
import { Employee } from '../type-orm/entities/employee.entity';
import { TableQR } from '../type-orm/entities/table-qr.entity';

/**
 * Seed database with demo data using faker
 */
export async function seedDatabase(dataSource: DataSource): Promise<void> {
  console.log('🌱 Seeding database...\n');

  const userRepo = dataSource.getRepository(User);
  const merchantRepo = dataSource.getRepository(Merchant);
  const employeeRepo = dataSource.getRepository(Employee);
  const tableQRRepo = dataSource.getRepository(TableQR);

  // Check if already seeded
  const existingUsers = await userRepo.count();
  if (existingUsers > 0) {
    console.log('⏭️  Database already seeded, skipping...\n');
    return;
  }

  const hashedPassword = await bcrypt.hash('Password123!', 10);

  // Create 4 merchants with users
  const merchantData = [
    { name: 'Al Salam Restaurant', location: 'Main Hall' },
    { name: 'Golden Fork Cafe', location: 'Terrace' },
    { name: 'Ocean Breeze Grill', location: 'Patio' },
    { name: 'Mountain View Diner', location: 'Rooftop' },
  ];

  const merchants: Merchant[] = [];

  for (let i = 0; i < 4; i++) {
    const user = userRepo.create({
      email: faker.internet.email({ firstName: merchantData[i].name.split(' ')[0].toLowerCase() }),
      password: hashedPassword,
      name: faker.person.fullName(),
      phone: faker.phone.number(),
      role: UserRole.MERCHANT,
      active: true,
    });
    await userRepo.save(user);

    const merchant = merchantRepo.create({
      name: merchantData[i].name,
      email: user.email,
      phone: user.phone,
      userId: user.id,
      active: true,
    });
    await merchantRepo.save(merchant);
    merchants.push(merchant);
    console.log(`✅ Created merchant: ${merchant.name} (${user.email})`);
  }

  // Create 4 employees (1 per merchant) with users
  const employees: Employee[] = [];

  for (let i = 0; i < 4; i++) {
    const firstName = faker.person.firstName();
    const lastName = faker.person.lastName();
    const user = userRepo.create({
      email: faker.internet.email({ firstName, lastName }),
      password: hashedPassword,
      name: `${firstName} ${lastName}`,
      phone: faker.phone.number(),
      role: UserRole.EMPLOYEE,
      active: true,
    });
    await userRepo.save(user);

    const employee = employeeRepo.create({
      name: user.name,
      email: user.email,
      phone: user.phone,
      userId: user.id,
      merchantId: merchants[i].id,
      active: true,
    });
    await employeeRepo.save(employee);
    employees.push(employee);
    console.log(`✅ Created employee: ${employee.name} at ${merchants[i].name}`);
  }

  // Create 2 tables per merchant (8 total)
  const tables: TableQR[] = [];

  for (const merchant of merchants) {
    for (let t = 1; t <= 2; t++) {
      const table = tableQRRepo.create({
        tableCode: `T${t}`,
        location: `${merchantData[merchants.indexOf(merchant)].location} - Table ${t}`,
        merchantId: merchant.id,
        active: true,
      });
      await tableQRRepo.save(table);
      tables.push(table);
    }
  }
  console.log(`✅ Created ${tables.length} table QR codes`);

  console.log('\n🎉 Database seeded successfully!\n');
  console.log('📝 Summary:');
  console.log(`   Users: 8 (4 merchants + 4 employees)`);
  console.log(`   Merchants: ${merchants.length}`);
  console.log(`   Employees: ${employees.length}`);
  console.log(`   Tables: ${tables.length}`);
  console.log(`\n🔐 All users password: Password123!`);
}
