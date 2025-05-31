import { NextFunction, Request, Response } from "express"
export default interface IProductController {

  getAllProducts(req: Request, res: Response, next: NextFunction): Promise<void>;
  addProduct(req: Request, res: Response, next: NextFunction): Promise<void>;
  editProduct(req: Request, res: Response, next: NextFunction): Promise<void>;
  deleteProduct(req: Request, res: Response, next: NextFunction): Promise<void>;
  getProducts(req: Request, res: Response, next: NextFunction): Promise<void>;
  getItemsReport(req: Request, res: Response, next: NextFunction): Promise<void>;
}