import IBaseRepository from "./base.repository";
import { IUserModel } from "../../types/user";

export default interface IUserRepository extends IBaseRepository<IUserModel> {

};