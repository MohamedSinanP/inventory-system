import { BaseRepository } from "./base.repository";
import { IProductModel, Product } from "../types/user";
import { Model, Types } from "mongoose";
import IProductRepository from "../interfaces/repositories/product.repository";
import { ProductModel } from "../models/product.model";
import { HttpError } from "../utils/http.error";
import { StatusCode } from "../types/type";

class ProductRepository extends BaseRepository<IProductModel> implements IProductRepository {
  constructor(private _productModel: Model<IProductModel>) {
    super(_productModel);
  };

  async findPaginated(
    userId: string,
    page: number,
    limit: number,
    search: string
  ): Promise<{ data: IProductModel[]; total: number }> {
    const skip = (page - 1) * limit;

    const query: any = {
      userId: new Types.ObjectId(userId),
      isDeleted: false
    };

    if (search) {
      query.name = { $regex: search, $options: 'i' };
    }

    const data = await this._productModel.find(query)
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 });

    const total = await this._productModel.countDocuments(query);

    return { data, total };
  }

  async addProduct(data: Product): Promise<IProductModel> {
    if (!data.userId || typeof data.userId !== 'string') {
      throw new HttpError(StatusCode.BAD_REQUEST, "Invalid or missing userId");
    }
    const productData = {
      ...data,
      userId: new Types.ObjectId(data.userId as string),
    };

    return await this._productModel.create(productData);
  }
};

export default new ProductRepository(ProductModel);