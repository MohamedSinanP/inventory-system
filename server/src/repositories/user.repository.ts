import { BaseRepository } from "./base.repository";
import { IUserModel } from "../types/user";
import IUserRepository from "../interfaces/repositories/user.repository";
import { Model } from "mongoose";
import { UserModel } from "../models/user.model";

class UserRepository extends BaseRepository<IUserModel> implements IUserRepository {
  constructor(private _userModel: Model<IUserModel>) {
    super(_userModel);
  };

};

export default new UserRepository(UserModel);

