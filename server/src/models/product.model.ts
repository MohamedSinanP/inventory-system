import { model, Schema } from "mongoose";
import { IProductModel } from "../types/user";

const productSchema = new Schema<IProductModel>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
    },
    stock: {
      type: Number,
      required: true,
      min: [1, 'Stock must be greater than 0'],
    },
    price: {
      type: Number,
      required: true,
      min: [1, 'Price must be greater than 0'],
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    isDeleted: {
      type: Boolean,
      required: true
    }
  },
  {
    timestamps: true,
  }
);

export const ProductModel = model<IProductModel>('Product', productSchema);