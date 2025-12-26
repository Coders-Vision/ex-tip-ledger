import { Controller, Get, Param } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { MerchantsService } from './merchants.service';
import { MerchantTipSummaryDto } from './dto';

@ApiTags('Merchants')
@Controller('merchants')
export class MerchantsController {
  constructor(private readonly merchantsService: MerchantsService) {}

  @Get(':id/tips/summary')
  @ApiOperation({ summary: 'Get tip summary for a merchant grouped by status' })
  @ApiResponse({
    status: 200,
    description: 'Tip summary retrieved successfully',
    type: MerchantTipSummaryDto,
  })
  @ApiResponse({ status: 404, description: 'Merchant not found' })
  async getTipSummary(
    @Param('id') id: string,
  ): Promise<MerchantTipSummaryDto> {
    return this.merchantsService.getTipSummary(id);
  }
}
