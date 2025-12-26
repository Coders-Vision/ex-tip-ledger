import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { TipIntent, TipIntentStatus,Merchant } from 'src/common/database/type-orm/entities';
import { TipIntentRepository,BaseRepository } from 'src/common/database/type-orm/repositories';
import { MerchantTipSummaryDto, TipStatusSummary } from './dto';
@Injectable()
export class MerchantsService {
  private readonly logger = new Logger(MerchantsService.name);

  constructor(
    @InjectRepository(TipIntent)
    private readonly tipIntentRepo: TipIntentRepository,
    @InjectRepository(Merchant)
    private readonly merchantRepo: BaseRepository<Merchant>,
  ) {}

  /**
   * Get tip summary for a merchant grouped by status
   */
  async getTipSummary(merchantId: string): Promise<MerchantTipSummaryDto> {
    // Verify merchant exists
    const merchant = await this.merchantRepo.findOne({
      where: { id: merchantId },
    });

    if (!merchant) {
      throw new NotFoundException(`Merchant with ID '${merchantId}' not found`);
    }

    // Get summary from repository
    const summary = await this.tipIntentRepo.getSummaryByStatus(merchantId);

    // Initialize summaries
    const pending: TipStatusSummary = { count: 0, totalAmount: 0 };
    const confirmed: TipStatusSummary = { count: 0, totalAmount: 0 };
    const reversed: TipStatusSummary = { count: 0, totalAmount: 0 };

    // Map results
    summary?.forEach((row) => {
      const count = parseInt(row.count);
      const totalAmount = parseFloat(row.totalAmount);

      switch (row.status) {
        case TipIntentStatus.PENDING:
          pending.count = count;
          pending.totalAmount = totalAmount;
          break;
        case TipIntentStatus.CONFIRMED:
          confirmed.count = count;
          confirmed.totalAmount = totalAmount;
          break;
        case TipIntentStatus.REVERSED:
          reversed.count = count;
          reversed.totalAmount = totalAmount;
          break;
      }
    });

    // Calculate net total (confirmed - reversed)
    const netTotal = confirmed.totalAmount - reversed.totalAmount;

    return {
      merchantId,
      pending,
      confirmed,
      reversed,
      netTotal,
    };
  }
}
