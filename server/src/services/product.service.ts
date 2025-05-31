import IProductRepository from "../interfaces/repositories/product.repository";
import IProductService from "../interfaces/services/product.service";
import productRepository from "../repositories/product.repository";
import { ItemsReport, Product, ProductDTO } from "../types/user";
import { HttpError } from "../utils/http.error";
import { PaginatedData, StatusCode } from "../types/type";

class ProductService implements IProductService {
  constructor(private _productRepository: IProductRepository) { }

  async addProduct(data: Product): Promise<ProductDTO> {
    if (!data.name || !data.description || data.stock <= 0 || data.price <= 0) {
      throw new HttpError(StatusCode.BAD_REQUEST, "Invalid product data provided.");
    }

    const existingProduct = await this._productRepository.findOne({ name: data.name });

    if (existingProduct) {
      throw new HttpError(StatusCode.BAD_REQUEST, "This product already exist.");
    }
    const productData = {
      ...data,
      isDeleted: false
    }
    const newProduct = await this._productRepository.addProduct(productData);
    if (!newProduct) {
      throw new HttpError(StatusCode.INTERNAL_SERVER_ERROR, "Failed to create product.");
    }

    const productDTO: ProductDTO = {
      id: newProduct._id.toString(),
      name: newProduct.name,
      description: newProduct.description,
      stock: newProduct.stock,
      price: newProduct.price,
    };

    return productDTO;
  }

  async editProduct(data: Partial<Product> & { id?: string }): Promise<ProductDTO> {
    const { id, name, description, stock, price } = data;

    if (!id) {
      throw new HttpError(StatusCode.BAD_REQUEST, "Product ID is required.");
    }

    const existingProduct = await this._productRepository.findById(id);
    if (!existingProduct) {
      throw new HttpError(StatusCode.NOT_FOUND, "Product not found.");
    }

    const updatedProduct = await this._productRepository.update(id, {
      name,
      description,
      stock,
      price,
    });

    if (!updatedProduct) {
      throw new HttpError(StatusCode.INTERNAL_SERVER_ERROR, "Failed to update product.");
    }

    const productDTO: ProductDTO = {
      id: updatedProduct._id.toString(),
      name: updatedProduct.name,
      description: updatedProduct.description,
      stock: updatedProduct.stock,
      price: updatedProduct.price,
    };

    return productDTO;
  }

  async deleteProduct(id: string): Promise<void> {
    if (!id) {
      throw new HttpError(StatusCode.BAD_REQUEST, "Product ID is required.");
    }

    const existingProduct = await this._productRepository.findById(id);
    if (!existingProduct) {
      throw new HttpError(StatusCode.NOT_FOUND, "Product not found.");
    }

    const deleted = await this._productRepository.update(id, { isDeleted: true });
    if (!deleted) {
      throw new HttpError(StatusCode.INTERNAL_SERVER_ERROR, "Failed to delete product.");
    }
  }

  async getProducts(userId: string, page: number, limit: number, search: string): Promise<PaginatedData<ProductDTO>> {
    const { data, total } = await this._productRepository.findPaginated(userId, page, limit, search);
    if (!data) {
      throw new HttpError(StatusCode.NOT_FOUND, "Can't get the cars.")
    };
    const productDTOs: ProductDTO[] = data.map(product => ({
      id: product._id.toString(),
      name: product.name,
      description: product.description,
      stock: product.stock,
      price: product.price,
    }));

    return {
      data: productDTOs,
      totalPages: Math.ceil(total / limit),
      currentPage: page
    };
  }

  async getAllProducts(userId: string): Promise<ProductDTO[] | null> {
    const products = await this._productRepository.findAll({ userId });
    if (products) {
      const productDTOs: ProductDTO[] = products.map(product => ({
        id: product._id.toString(),
        name: product.name,
        description: product.description,
        stock: product.stock,
        price: product.price,
      }));
      return productDTOs;
    } else {
      return null;
    }
  }

  async getItemsReport(userId: string): Promise<ItemsReport> {
    const products = await this._productRepository.findAll({ userId });
    const totalProducts = products.length;
    let totalStock = 0;
    let totalInventoryValue = 0;
    let lowStockCount = 0;

    products.forEach(product => {
      totalStock += product.stock;
      totalInventoryValue += product.stock * product.price;
      if (product.stock < 5) lowStockCount++;
    });

    return {
      totalProducts,
      totalStock,
      totalInventoryValue,
      lowStockCount,
    };
  }

}

export default new ProductService(productRepository);
