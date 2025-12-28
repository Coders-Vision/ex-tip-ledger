import { TipIntent } from '../entities';
import { BaseRepository } from './base.repository';

export class TipIntentRepository extends BaseRepository<TipIntent> {
  /**
   * Get summary of tip intents grouped by status for a merchant.
   * @param {string} merchantId - Merchant ID
   * @returns {Promise<TipIntent[] | null>}
   */
  async getSummaryByStatus(
    merchantId: string,
  ): Promise<any[] | null> {
    const summary = await this
      .createQueryBuilder('tip')
      .select('tip.status', 'status')
      .addSelect('COUNT(*)', 'count')
      .addSelect('COALESCE(SUM(tip.amount), 0)', 'totalAmount')
      .where('tip.merchantId = :merchantId', { merchantId })
      .groupBy('tip.status')
      .getRawMany();

    return summary || [];
  }

}
