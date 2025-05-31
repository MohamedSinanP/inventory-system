import { Schema, model } from "mongoose";
import { IUserModel } from "../types/user";

const UserSchema: Schema = new Schema<IUserModel>(
  {
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { type: String, requred: true },
    isBlocked: { type: Boolean, required: true },
    refreshToken: { type: String, requred: false }
  },
  {
    timestamps: true,
  }
);

export const UserModel = model<IUserModel>("User", UserSchema);
