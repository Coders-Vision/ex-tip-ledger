import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { LedgerEntry, Employee } from 'src/common/database/type-orm/entities';
import { EmployeeTipsDto } from './dto';
import { BaseRepository } from 'src/common/database/type-orm/repositories';

@Injectable()
export class EmployeesService {
  private readonly logger = new Logger(EmployeesService.name);
  constructor(
    @InjectRepository(LedgerEntry)
    private readonly ledgerRepo: BaseRepository<LedgerEntry>,
    @InjectRepository(Employee)
    private readonly employeeRepo: BaseRepository<Employee>,
  ) { }

  /**
   * Get ledger entries and total for an employee
   */
  async getEmployeeTips(employeeId: string): Promise<EmployeeTipsDto> {
  
    // Verify employee exists
    const employee = await this.employeeRepo.findOne({
      where: { id: employeeId },
    });

    if (!employee) {
      this.logger.warn(`Employee with ID '${employeeId}' not found`);
      throw new NotFoundException(`Employee with ID '${employeeId}' not found`);
    }

    // Get ledger entries ordered by creation date (newest first)
    const entries = await this.ledgerRepo.find({
      where: { employeeId },
      order: { createdAt: 'DESC' },
    });

    // Calculate total amount (sum of all entries including negative DEBIT amounts)
    const totalAmount = entries.reduce(
      (sum, entry) => sum + Number(entry.amount),
      0,
    );

    return {
      employeeId,
      entries,
      totalAmount: Math.round(totalAmount * 1000) / 1000, // Round to 3 decimal places
    };
  }
}
