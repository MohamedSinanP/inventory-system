export default interface IBaseRepository<T> {
  findAll(filter?: Partial<Record<keyof T, any>>): Promise<T[]>;
  findOne(filter: Partial<Record<keyof T, any>>): Promise<T | null>;
  findById(id: string): Promise<T | null>;
  create(data: Partial<T>): Promise<T>;
  update(id: string, data: Partial<T>): Promise<T | null>;
  delete(id: string): Promise<boolean>;
}