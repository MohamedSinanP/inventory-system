import { Request, Response, NextFunction } from "express";
import ICustomerController from "../interfaces/controllers/customer.controller";
import ICustomerService from "../interfaces/services/customer.service";
import customerService from "../services/customer.service";
import { AuthenticatedRequest, StatusCode } from "../types/type";
import { HttpResponse } from "../utils/http.response";
import { HttpError } from "../utils/http.error";

class CustomerController implements ICustomerController {
  constructor(private _customerSerive: ICustomerService) { };

  async addCustomer(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { userId } = (req as AuthenticatedRequest).user;
      const { name, email, address, phoneNumber } = req.body;

      if (!name || !email || !address || !phoneNumber) {
        throw new HttpError(StatusCode.BAD_REQUEST, "Missing required customer fields");
      }

      const createdCustomer = await this._customerSerive.addCustomer({ userId, name, email, address, phoneNumber });

      res.status(StatusCode.CREATED).json(HttpResponse.created(createdCustomer, "Customer created successfully"));
    } catch (error) {
      next(error);
    }
  }

  async editCustomer(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const customerId = req.params.id;
      const updateData = req.body;

      const updatedCustomer = await this._customerSerive.editCustomer(customerId, updateData);

      if (!updatedCustomer) {
        throw new HttpError(StatusCode.NOT_FOUND, "Customer not found");
      }

      res.status(StatusCode.OK).json(HttpResponse.success(updatedCustomer, "Customer updated successfully"));
    } catch (error) {
      next(error);
    }
  }

  async getCustomers(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { userId } = (req as AuthenticatedRequest).user;
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
      const search = (req.query.search as string) || '';
      const customers = await this._customerSerive.getCustomers(userId, page, limit, search);
      res.status(StatusCode.OK).json(HttpResponse.success(customers, "Customers fetched successfully"));
    } catch (error) {
      next(error);
    }
  }

  async getAllCustomers(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { userId } = (req as AuthenticatedRequest).user;
      const customers = await this._customerSerive.getAllCustomers(userId);
      res.status(StatusCode.OK).json(HttpResponse.success(customers));
    } catch (error) {
      next(error);
    }
  }

}

export default new CustomerController(customerService);