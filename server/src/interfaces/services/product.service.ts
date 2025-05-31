import { PaginatedData } from "../../types/type";
import { Product, ProductDTO } from "../../types/user";


export default interface IProductService {
  getAllProducts(userId: string): Promise<ProductDTO[] | null>;
  addProduct(data: Product): Promise<ProductDTO>;
  editProduct(data: Partial<Product>): Promise<ProductDTO>;
  deleteProduct(id: string): Promise<void>;
  getProducts(userId: string, page: number, limit: number, search: string): Promise<PaginatedData<ProductDTO>>
  getItemsReport(userId: string): Promise<ItemsReport>
}