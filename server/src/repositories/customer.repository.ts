import { BaseRepository } from "./base.repository";
import { customerData, ICustomerModel } from "../types/user";
import { Model, Types } from "mongoose";
import Customer from "../models/customer.model";
import ICustomerRepository from "../interfaces/repositories/customer.repository";
import { StatusCode } from "../types/type";
import { HttpError } from "../utils/http.error";

class CustomerRepository extends BaseRepository<ICustomerModel> implements ICustomerRepository {
  constructor(private _customerModel: Model<ICustomerModel>) {
    super(_customerModel);
  };

  async addCustomer(data: customerData): Promise<ICustomerModel> {
    if (!data.userId || typeof data.userId !== 'string') {
      throw new HttpError(StatusCode.BAD_REQUEST, "Invalid or missing userId");
    }
    const productData = {
      ...data,
      userId: new Types.ObjectId(data.userId as string),
    };

    return await this._customerModel.create(productData);
  }

  async findPaginated(
    userId: string,
    page: number,
    limit: number,
    search: string
  ): Promise<{ data: ICustomerModel[]; total: number }> {
    const skip = (page - 1) * limit;
    const query: any = {
      userId: new Types.ObjectId(userId),
    };

    if (search) {
      query.name = { $regex: search, $options: 'i' };
    }

    const data = await this._customerModel.find(query)
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 });

    const total = await this._customerModel.countDocuments(query);

    return { data, total };
  }
};

export default new CustomerRepository(Customer);

