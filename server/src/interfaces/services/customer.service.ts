import { Request, Response } from "express";
import { AuthDTO, customerData, CustomerDTO, IUser } from "../../types/user";
import { PaginatedData } from "../../types/type";


export default interface ICustomerService {
  addCustomer(data: customerData): Promise<CustomerDTO>;
  editCustomer(id: string, data: Partial<customerData>): Promise<CustomerDTO>;
  getCustomers(userId: string, page: number, limit: number, search: string): Promise<PaginatedData<CustomerDTO>>
  getAllCustomers(userId: string): Promise<CustomerDTO[] | null>;
}