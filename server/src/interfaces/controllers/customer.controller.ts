import { NextFunction, Request, Response } from "express"
export default interface ICustomerController {
  addCustomer(req: Request, res: Response, next: NextFunction): Promise<void>;
  editCustomer(req: Request, res: Response, next: NextFunction): Promise<void>;
  getCustomers(req: Request, res: Response, next: NextFunction): Promise<void>;
  getAllCustomers(req: Request, res: Response, next: NextFunction): Promise<void>;
}