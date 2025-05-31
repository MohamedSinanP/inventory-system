import IBaseRepository from "./base.repository";
import { IProductModel, Product, } from "../../types/user";

export default interface IProductRepository extends IBaseRepository<IProductModel> {
  addProduct(data: Product): Promise<IProductModel>
  findPaginated(
    userId: string,
    page: number,
    limit: number,
    search: string
  ): Promise<{
    data: IProductModel[]; total: number
  }>
};