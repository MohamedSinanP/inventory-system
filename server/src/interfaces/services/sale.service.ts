import { PaginatedData } from "../../types/type";
import { CustomerLedgerReportDTO, SaleData, SaleDTO, SalesReportDTO } from "../../types/user";


export default interface ISaleService {
  addSale(data: SaleData): Promise<SaleDTO>;
  editSale(id: string, data: SaleData): Promise<SaleDTO>;
  getSales(page: number, limit: number, search: string): Promise<PaginatedData<SaleDTO>>;
  deleteSale(id: string): Promise<void>;
  getSalesReport(userId: string, from: Date, to: Date): Promise<SalesReportDTO>
  getCustomerLedgerReport(userId: string, from: Date, to: Date): Promise<CustomerLedgerReportDTO>
}