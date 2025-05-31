import { BaseRepository } from "./base.repository";
import { CustomerLedgerEntity, ISaleModel, SaleData } from "../types/user";
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

    const query: any = {
      isDeleted: false
    };

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
    const start = new Date(from);
    start.setHours(0, 0, 0, 0);

    const end = new Date(to);
    end.setHours(23, 59, 59, 999);


    return await this._saleModel.find({
      userId: new Types.ObjectId(userId),
      saleDate: {
        $gte: start,
        $lte: end
      }
    });
  }

  async getCustomerLedger(userId: string, fromDate: Date, toDate: Date): Promise<CustomerLedgerEntity[]> {
    const start = new Date(fromDate);
    start.setHours(0, 0, 0, 0);

    const end = new Date(toDate);
    end.setHours(23, 59, 59, 999);
    return await this._saleModel.aggregate([
      {
        $match: {
          userId: new Types.ObjectId(userId),
          saleDate: { $gte: start, $lte: end },
        },
      },
      {
        $group: {
          _id: "$customerId",
          customerName: { $first: "$customerName" },
          totalPurchases: { $sum: 1 },
          totalAmount: { $sum: "$totalPrice" },
          totalQuantity: { $sum: "$quantity" },
          firstPurchase: { $min: "$saleDate" },
          lastPurchase: { $max: "$saleDate" },
          transactions: {
            $push: {
              productName: "$productName",
              quantity: "$quantity",
              totalPrice: "$totalPrice",
              saleDate: "$saleDate",
              productId: "$productId",
            },
          },
        },
      },
      {
        $lookup: {
          from: "customers",
          localField: "_id",
          foreignField: "_id",
          as: "customerDetails",
        },
      },
      { $unwind: "$customerDetails" },
      {
        $project: {
          customerId: "$_id",
          customerName: 1,
          email: "$customerDetails.email",
          phoneNumber: "$customerDetails.phoneNumber",
          address: "$customerDetails.address",
          totalPurchases: 1,
          totalAmount: 1,
          totalQuantity: 1,
          firstPurchase: 1,
          lastPurchase: 1,
          averageOrderValue: { $divide: ["$totalAmount", "$totalPurchases"] },
          transactions: 1,
        },
      },
      { $sort: { totalAmount: -1 } },
    ]);
  }
};

export default new SaleRepository(SaleModel);

