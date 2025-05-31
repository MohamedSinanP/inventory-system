import { model, Schema } from "mongoose";
import { ICustomerModel } from "../types/user";

const customerSchema = new Schema<ICustomerModel>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    address: {
      type: String,
      required: true,
      trim: true,
    },
    phoneNumber: {
      type: String,
      required: true,
      trim: true,
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true
    }
  },
  {
    timestamps: true,
  }
);

const Customer = model<ICustomerModel>("Customer", customerSchema);

export default Customer;