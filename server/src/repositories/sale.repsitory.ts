import { BaseRepository } from "./base.repository";
import { ISaleModel, SaleData } from "../types/user";
import { Model, Types } from "mongoose";
import SaleModel from "../models/sale.model";
import ISaleRepository from "../interfaces/repositories/sale.repository";
import { StatusCode } from "../types/type";
import { HttpError } from "../utils/http.error";

class SaleRepository extends BaseRepository<ISaleModel> implements ISaleRepository {
  constructor(private _saleModel: Model<ISaleModel>) {
    super(_saleModel);
  };

  async findPaginated(page: number, limit: number, search: string): Promise<{ data: ISaleModel[]; total: number; }> {
    const skip = (page - 1) * limit;

    const query: any = {};

    if (search) {
      query.productName = { $regex: search, $options: 'i' };
    }

    const data = await this._saleModel.find(query)
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 });

    const total = await this._saleModel.countDocuments(query);

    return { data, total };
  }

  async addNewSale(data: SaleData): Promise<ISaleModel> {
    if (!data.productId || typeof data.productId !== 'string') {
      throw new HttpError(StatusCode.BAD_REQUEST, "Invalid or missing productId");
    }
    const productData = {
      ...data,
      productId: new Types.ObjectId(data.productId as string),
    };

    return await this._saleModel.create(productData);
  }

  async findByDateRange(userId: string, from: Date, to: Date): Promise<ISaleModel[]> {
    return await this._saleModel.find({
      userId,
      saleDate: {
        $gte: from,
        $lte: to
      }
    });
  }
};

export default new SaleRepository(SaleModel);

