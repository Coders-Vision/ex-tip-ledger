import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { TableQR } from 'src/common/database/type-orm/entities';
import { BaseRepository } from 'src/common/database/type-orm/repositories';
import { TableQRListResponseDto, TableQRResponseDto } from './dto';

@Injectable()
export class TableQRsService {
  private readonly logger = new Logger(TableQRsService.name);

  constructor(
    @InjectRepository(TableQR)
    private readonly tableQRRepo: BaseRepository<TableQR>,
  ) {}

  /**
   * Get all table QRs
   */
  async findAll(): Promise<TableQRListResponseDto> {
    const [tableQRs, total] = await this.tableQRRepo.findAndCount({
      order: { createdAt: 'DESC' },
    });

    return {
      tableQRs: tableQRs.map((tableQR) => this.mapToResponse(tableQR)),
      total,
    };
  }

  /**
   * Get all table QRs for a specific merchant
   */
  async findByMerchantId(merchantId: string): Promise<TableQRListResponseDto> {
    const [tableQRs, total] = await this.tableQRRepo.findAndCount({
      where: { merchantId },
      order: { createdAt: 'DESC' },
    });

    return {
      tableQRs: tableQRs.map((tableQR) => this.mapToResponse(tableQR)),
      total,
    };
  }

  /**
   * Find a table QR by ID
   */
  async findById(id: string): Promise<TableQR | null> {
    return this.tableQRRepo.findOne({ where: { id } });
  }

  /**
   * Find a table QR by merchant ID and table code
   */
  async findByMerchantAndCode(
    merchantId: string,
    tableCode: string,
  ): Promise<TableQR | null> {
    return this.tableQRRepo.findOne({
      where: { merchantId, tableCode },
    });
  }

  /**
   * Map entity to response DTO
   */
  private mapToResponse(tableQR: TableQR): TableQRResponseDto {
    return {
      id: tableQR.id,
      tableCode: tableQR.tableCode,
      location: tableQR.location,
      active: tableQR.active,
      merchantId: tableQR.merchantId,
      createdAt: tableQR.createdAt,
    };
  }
}
