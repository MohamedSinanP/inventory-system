import IBaseRepository from "./base.repository";
import { CustomerLedgerEntity, ISaleModel, SaleData, } from "../../types/user";

export default interface ISaleRepository extends IBaseRepository<ISaleModel> {
  findPaginated(page: number,
    limit: number,
    search: string
  ): Promise<{
    data: ISaleModel[]; total: number
  }>
  addNewSale(data: SaleData): Promise<ISaleModel>
  findByDateRange(userId: string, from: Date, to: Date): Promise<ISaleModel[]>
  getCustomerLedger(userId: string, fromDate: Date, toDate: Date): Promise<CustomerLedgerEntity[]>
};