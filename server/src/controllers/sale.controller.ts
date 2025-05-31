import { Request, Response, NextFunction } from "express";
import { AuthenticatedRequest, StatusCode } from "../types/type";
import { HttpResponse } from "../utils/http.response";
import ISaleController from "../interfaces/controllers/sale.controller";
import ISaleService from "../interfaces/services/sale.service";
import saleService from "../services/sale.service";
import { SaleData } from "../types/user";

class SaleController implements ISaleController {
  constructor(private _saleSerive: ISaleService) { };

  async addSale(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { userId } = (req as AuthenticatedRequest).user;
      const { productName, quantity, totalPrice, customerName, saleDate, productId, customerId }: SaleData = req.body;
      const newSale = await saleService.addSale({
        productName,
        quantity,
        totalPrice,
        customerName,
        saleDate,
        userId,
        productId,
        customerId
      });
      res.status(StatusCode.CREATED).json(HttpResponse.created(newSale));
    } catch (error) {
      next(error);
    }
  }

  async editSale(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const saleId = req.params.id;
      const { productName, quantity, totalPrice, customerName, saleDate }: SaleData = req.body;

      const updatedSale = await this._saleSerive.editSale(saleId, {
        productName,
        quantity,
        totalPrice,
        customerName,
        saleDate,
      });

      res.status(StatusCode.OK).json(HttpResponse.success(updatedSale));
    } catch (error) {
      next(error);
    }
  }

  async getSales(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
      const search = (req.query.search as string) || '';

      const result = await this._saleSerive.getSales(page, limit, search);
      res.status(StatusCode.OK).json(HttpResponse.success(result));
    } catch (error) {
      next(error);
    }
  }

  async deleteSale(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = req.params.id;
      await this._saleSerive.deleteSale(id);
      res.status(StatusCode.OK).json(HttpResponse.success({}, "Product deleted successfully."))
    } catch (error) {
      next(error);
    }
  }

  async getSalesReport(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { userId } = (req as AuthenticatedRequest).user;
      const from = new Date(req.query.from as string);
      const to = new Date(req.query.to as string);
      const reportData = await this._saleSerive.getSalesReport(userId, from, to);
      res.status(StatusCode.OK).json(HttpResponse.success(reportData));
    } catch (error) {
      next(error);
    }
  }

  async getCustomerLedger(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { userId } = (req as AuthenticatedRequest).user;
      const from = new Date(req.query.from as string);
      const to = new Date(req.query.to as string);

      const report = await this._saleSerive.getCustomerLedgerReport(userId, from, to);
      res.status(StatusCode.OK).json(HttpResponse.success(report));
    } catch (error) {
      next(error);
    }
  }

}

export default new SaleController(saleService);