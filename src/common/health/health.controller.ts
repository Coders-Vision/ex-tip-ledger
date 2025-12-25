import { Controller, Get } from '@nestjs/common';
import {
  HealthCheck,
  HealthCheckService,
  HttpHealthIndicator,
  // TypeOrmHealthIndicator,
  //   MemoryHealthIndicator,
  //   DiskHealthIndicator,
} from '@nestjs/terminus';

@Controller('health')
export class HealthController {
  constructor(
    private health: HealthCheckService,
    private http: HttpHealthIndicator,
    // private typeOrmCheck: TypeOrmHealthIndicator,

    //Optional
    // private memory: MemoryHealthIndicator,
    // private disk: DiskHealthIndicator,
  ) {}

  @Get()
  @HealthCheck()
  check() {
    return this.health.check([
      // Checks if the application is running
      () => this.http.pingCheck('nestjs-docs', 'https://docs.nestjs.com'),
      // Checks if the MongoDB connection is healthy
      // () => this.typeOrmCheck.pingCheck('TypeORM'),

      //Optional Checks
      // Memory check
      //   () => this.memory.checkHeap('memory_heap', 300 * 1024 * 1024),
      //   () => this.memory.checkRSS('memory_rss', 300 * 1024 * 1024),
      //   // Disk space check
      //   () =>
      //     this.disk.checkStorage('disk_space', {
      //       thresholdPercent: 0.9,
      //       path: '/',
      //     }),
    ]);
  }
}
