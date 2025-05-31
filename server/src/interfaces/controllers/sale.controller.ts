import { NextFunction, Request, Response } from "express"
export default interface ISaleController {
  addSale(req: Request, res: Response, next: NextFunction): Promise<void>;
  editSale(req: Request, res: Response, next: NextFunction): Promise<void>;
  getSales(req: Request, res: Response, next: NextFunction): Promise<void>;
  deleteSale(req: Request, res: Response, next: NextFunction): Promise<void>;
  getSalesReport(req: Request, res: Response, next: NextFunction): Promise<void>
  getCustomerLedger(req: Request, res: Response, next: NextFunction): Promise<void>
}