import IBaseRepository from "./base.repository";
import { customerData, ICustomerModel, } from "../../types/user";

export default interface ICustomerRepository extends IBaseRepository<ICustomerModel> {
  addCustomer(data: customerData): Promise<ICustomerModel>
  findPaginated(
    userId: string,
    page: number,
    limit: number,
    search: string
  ): Promise<{
    data: ICustomerModel[]; total: number
  }>
};