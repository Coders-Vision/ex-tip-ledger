import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ConflictException,
  Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {  DataSource } from 'typeorm';
import { TipIntent, TipIntentStatus,LedgerEntry, LedgerEntryType  } from 'src/common/database/type-orm/entities';
import { TableQR } from 'src/common/database/type-orm/entities';
import { CreateTipIntentDto, TipIntentResponseDto } from './dto';
import { BaseRepository, TipIntentRepository } from 'src/common/database/type-orm/repositories';

@Injectable()
export class TipsService {
 private readonly logger = new Logger(TipsService.name);
 
  constructor(
    @InjectRepository(TipIntent)
    private readonly tipIntentRepo: TipIntentRepository,
    @InjectRepository(LedgerEntry)
    private readonly ledgerRepo: BaseRepository<LedgerEntry>,
    @InjectRepository(TableQR)
    private readonly tableQRRepo: BaseRepository<TableQR>,
    private readonly dataSource: DataSource,    
    
  ) {}

  /**
   * Create a new tip intent
   */
  async createTipIntent(dto: CreateTipIntentDto): Promise<TipIntentResponseDto> {
    // Check idempotency key first
    const existing = await this.tipIntentRepo.findOne({
      where: { idempotencyKey: dto.idempotencyKey },
    });

    if (existing) {
      return this.mapToResponse(existing);
    }

    // Find table QR code
    const tableQR = await this.tableQRRepo.findOne({
      where: {
        merchantId: dto.merchantId,
        tableCode: dto.tableCode,
      },
    });

    if (!tableQR) {
      throw new NotFoundException(
        `Table with code '${dto.tableCode}' not found for this merchant`,
      );
    }

    // Create new tip intent
    const tipIntent = this.tipIntentRepo.create({
      merchantId: dto.merchantId,
      employeeId: dto.employeeId,
      tableQRId: tableQR.id,
      amount: dto.amount,
      status: TipIntentStatus.PENDING,
      idempotencyKey: dto.idempotencyKey,
      employeeHint: dto.employeeHint,
      tableCode: dto.tableCode,
    });

    await this.tipIntentRepo.save(tipIntent);

    return this.mapToResponse(tipIntent);
  }

  /**
   * Confirm a tip intent
   *  Idempotent - multiple calls return same result
   *  Concurrency safe - uses pessimistic locking
   *  Creates exactly one ledger entry
   */
  async confirmTipIntent(id: string): Promise<TipIntentResponseDto> {
    return await this.dataSource.transaction(async (manager) => {
      //  Pessimistic lock - prevents concurrent modifications
      const tipIntent = await manager.findOne(TipIntent, {
        where: { id },
        lock: { mode: 'pessimistic_write' },
      });

      if (!tipIntent) {
        throw new NotFoundException(`Tip intent with ID '${id}' not found`);
      }

      //  Idempotent - already confirmed
      if (tipIntent.status === TipIntentStatus.CONFIRMED) {
        this.logger.log(`Tip intent '${id}' is already confirmed`);
        return this.mapToResponse(tipIntent);
      }

      // Validate state transition
      if (tipIntent.status !== TipIntentStatus.PENDING) {
        throw new BadRequestException(
          `Cannot confirm tip with status '${tipIntent.status}'. Only PENDING tips can be confirmed.`,
        );
      }

      if (!tipIntent.employeeId) {
        throw new BadRequestException(
          'Cannot confirm tip without an assigned employee',
        );
      }

      // Update tip intent status
      tipIntent.status = TipIntentStatus.CONFIRMED;
      tipIntent.confirmedAt = new Date();
      await manager.save(TipIntent, tipIntent);

      //  Create exactly ONE ledger entry (CREDIT)
      const ledgerEntry = manager.create(LedgerEntry, {
        tipIntentId: tipIntent.id,
        employeeId: tipIntent.employeeId,
        amount: tipIntent.amount,
        type: LedgerEntryType.CREDIT,
        notes: `Tip confirmed from ${tipIntent.tableCode}`,
      });
      await manager.save(LedgerEntry, ledgerEntry);

      return this.mapToResponse(tipIntent);
    });
  }

  /**
   * Reverse a confirmed tip intent
   *  Idempotent - multiple calls return same result
   *  Creates reversal ledger entry (DEBIT)
   */
  async reverseTipIntent(id: string): Promise<TipIntentResponseDto> {
    return await this.dataSource.transaction(async (manager) => {
      // Pessimistic lock
      const tipIntent = await manager.findOne(TipIntent, {
        where: { id },
        lock: { mode: 'pessimistic_write' },
      });

      if (!tipIntent) {
        throw new NotFoundException(`Tip intent with ID '${id}' not found`);
      }

      //  Idempotent - already reversed
      if (tipIntent.status === TipIntentStatus.REVERSED) {
        return this.mapToResponse(tipIntent);
      }

      // Can only reverse CONFIRMED tips
      if (tipIntent.status !== TipIntentStatus.CONFIRMED) {
        throw new BadRequestException(
          `Cannot reverse tip with status '${tipIntent.status}'. Only CONFIRMED tips can be reversed.`,
        );
      }

      // Update tip intent status
      tipIntent.status = TipIntentStatus.REVERSED;
      tipIntent.reversedAt = new Date();
      await manager.save(TipIntent, tipIntent);

      //  Create reversal ledger entry (DEBIT with negative amount)
      const reversalEntry = manager.create(LedgerEntry, {
        tipIntentId: tipIntent.id,
        employeeId: tipIntent.employeeId,
        amount: -tipIntent.amount, // Negative to reverse the credit
        type: LedgerEntryType.DEBIT,
        notes: `Tip reversed from ${tipIntent.tableCode}`,
      });
      await manager.save(LedgerEntry, reversalEntry);

      return this.mapToResponse(tipIntent);
    });
  }

  /**
   * Get a tip intent by ID
   */
  async getTipIntent(id: string): Promise<TipIntentResponseDto> {
    const tipIntent = await this.tipIntentRepo.findOne({ where: { id } });

    if (!tipIntent) {
      throw new NotFoundException(`Tip intent with ID '${id}' not found`);
    }

    return this.mapToResponse(tipIntent);
  }

  /**
   * Map entity to response DTO
   */
  private mapToResponse(tipIntent: TipIntent): TipIntentResponseDto {
    return {
      id: tipIntent.id,
      merchantId: tipIntent.merchantId,
      tableQRId: tipIntent.tableQRId,
      employeeId: tipIntent.employeeId,
      amount: Number(tipIntent.amount),
      status: tipIntent.status,
      tableCode: tipIntent.tableCode,
      employeeHint: tipIntent.employeeHint,
      createdAt: tipIntent.createdAt,
      confirmedAt: tipIntent.confirmedAt,
      reversedAt: tipIntent.reversedAt,
    };
  }
}
