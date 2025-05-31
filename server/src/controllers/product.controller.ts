import { Request, Response, NextFunction } from "express";
import IProductController from "../interfaces/controllers/product.controller";
import IProductService from "../interfaces/services/product.service";
import productService from "../services/product.service";
import { AuthenticatedRequest, StatusCode } from "../types/type";
import { HttpResponse } from "../utils/http.response";

class ProductController implements IProductController {
  constructor(private _productService: IProductService) { };

  async addProduct(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { userId } = (req as AuthenticatedRequest).user;
      const { name, description, stock, price } = req.body;
      const result = await this._productService.addProduct({ name, userId, description, stock, price });
      res.status(StatusCode.CREATED).json(HttpResponse.created(result));
    } catch (error) {
      next(error);
    }
  }

  async editProduct(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const { name, description, stock, price } = req.body;
      const result = await this._productService.editProduct({ id, name, description, stock, price });
      res.status(StatusCode.OK).json(HttpResponse.success(result));
    } catch (error) {
      next(error);
    }
  }

  async deleteProduct(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = req.params.id;
      await this._productService.deleteProduct(id);
      res.status(StatusCode.OK).json(HttpResponse.success({}, "Product deleted successfully."))
    } catch (error) {
      next(error);
    }
  }

  async getProducts(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { userId } = (req as AuthenticatedRequest).user;
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
      const search = (req.query.search as string) || '';

      const result = await this._productService.getProducts(userId, page, limit, search);
      res.status(StatusCode.OK).json(HttpResponse.success(result));
    } catch (error) {
      next(error)
    }
  }

  async getAllProducts(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { userId } = (req as AuthenticatedRequest).user;
      const products = await this._productService.getAllProducts(userId);
      res.status(StatusCode.OK).json(HttpResponse.success(products));
    } catch (error) {
      next(error);
    }
  }

  async getItemsReport(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { userId } = (req as AuthenticatedRequest).user;
      const products = await this._productService.getItemsReport(userId);
      res.status(StatusCode.OK).json(HttpResponse.success(products));
    } catch (error) {
      next(error);
    }
  }

}

export default new ProductController(productService);