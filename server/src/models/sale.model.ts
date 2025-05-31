import { model, Schema } from "mongoose";
import { ISaleModel } from "../types/user";

const saleSchema = new Schema<ISaleModel>({
  productName: {
    type: String,
    required: true,
    trim: true
  },
  quantity: {
    type: Number,
    required: true,
    min: 1
  },
  totalPrice: {
    type: Number,
    required: true,
    min: 0
  },
  customerName: {
    type: String,
    required: true,
    trim: true
  },
  saleDate: {
    type: Date,
    required: true
  },
  productId: {
    type: Schema.Types.ObjectId,
    ref: 'Product',
    required: true
  },
  customerId: {
    type: Schema.Types.ObjectId,
    ref: 'Customer',
    required: true
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
}, {
  timestamps: true
});

const Sale = model<ISaleModel>('Sale', saleSchema);
export default Sale;