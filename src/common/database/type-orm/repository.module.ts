import { DynamicModule, Global, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { BaseRepository } from './repositories/base.repository';

@Global()
@Module({})
export class RepositoryModule {
  static forRepositories(
    entitiesWithCustomRepositories: {
      entity: Function;
      repository?: new (...args: any[]) => any;
    }[],
  ): DynamicModule {
    const providers = entitiesWithCustomRepositories.map(
      ({ entity, repository }) => ({
        provide: repository
          ? repository.name // Custom repository, e.g., "CategoryRepository"
          : `${entity.name}Repository`, // Default repository, e.g., "BaseRepository<Category>"
        useFactory: (dataSource: DataSource) => {
          const baseRepo = dataSource.getRepository(entity);

          if (repository) {
            // If a custom repository is provided, use it
            return new repository(
              baseRepo.target,
              baseRepo.manager,
              baseRepo.queryRunner,
            );
          }

          // Return the default BaseRepository for the entity
          return new BaseRepository(
            baseRepo.target,
            baseRepo.manager,
            baseRepo.queryRunner,
          );
        },
        inject: [DataSource],
      }),
    );

    return {
      module: RepositoryModule,
      imports: [
        TypeOrmModule.forFeature(
          entitiesWithCustomRepositories.map((e) => e.entity),
        ),
      ],
      providers,
      exports: providers,
    };
  }
}
