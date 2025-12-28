import {
  Repository,
  FindOptionsWhere,
  DeepPartial,
  EntityTarget,
  EntityManager,
  QueryRunner,
  ObjectLiteral,
} from 'typeorm';

export class BaseRepository<T extends ObjectLiteral> extends Repository<T> {
  constructor(
    target: EntityTarget<T>,
    manager: EntityManager,
    queryRunner?: QueryRunner,
  ) {
    super(target, manager, queryRunner);
  }

  async createEntity(data: DeepPartial<T>): Promise<T> {
    const entity = this.create(data);
    return await this.save(entity);
  }

  async findAll(): Promise<T[]> {
    return await this.find();
  }

  async findOneById(id: number): Promise<T | null> {
    return await this.findOneBy({
      id,
    } as unknown as FindOptionsWhere<T>);
  }

  async findByCondition(condition: FindOptionsWhere<T>): Promise<T | null> {
    return this.findOne({ where: condition });
  }

  async updateEntity(id: number, data: DeepPartial<T>): Promise<T | null> {
    const entity = await this.findOneById(id);
    if (!entity) return null;

    const updatedEntity = Object.assign(entity, data); // Merge new data into the existing entity
    return await this.save(updatedEntity);
  }

  async deleteEntity(id: string | number): Promise<void> {
    await this.delete(id);
  }
}
