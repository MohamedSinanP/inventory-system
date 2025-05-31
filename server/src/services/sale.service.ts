import IProductRepository from "../interfaces/repositories/product.repository";
import ISaleRepository from "../interfaces/repositories/sale.repository";
import ISaleService from "../interfaces/services/sale.service";
import productRepository from "../repositories/product.repository";
import saleRepsitory from "../repositories/sale.repsitory";
import { PaginatedData, StatusCode } from "../types/type";
import { CustomerLedgerDTO, CustomerLedgerReportDTO, ProductDTO, SaleData, SaleDTO, SalesReportDTO } from "../types/user";
import { HttpError } from "../utils/http.error";


class SaleService implements ISaleService {
  constructor(
    private _saleRepository: ISaleRepository,
    private _productRepository: IProductRepository
  ) { };

  async addSale(data: SaleData): Promise<SaleDTO> {
    const product = await this._productRepository.findOne({ name: data.productName })
    if (!product) {
      throw new HttpError(StatusCode.BAD_REQUEST, "Product not found");
    }

    if (product.stock < data.quantity) {
      throw new HttpError(StatusCode.BAD_REQUEST, "Not enough stock available");
    }

    product.stock -= data.quantity;
    await this._productRepository.update(String(product._id), { stock: product.stock });

    const createdSale = await this._saleRepository.addNewSale({
      productName: data.productName,
      quantity: data.quantity,
      totalPrice: data.totalPrice,
      customerName: data.customerName,
      saleDate: new Date(data.saleDate),
      userId: data.userId,
      productId: data.productId,
      customerId: data.customerId,
      isDeleted: false
    });

    return {
      id: createdSale._id.toString(),
      productName: createdSale.productName,
      quantity: createdSale.quantity,
      totalPrice: createdSale.totalPrice,
      customerName: createdSale.customerName,
      saleDate: createdSale.saleDate
    };
  }

  async editSale(id: string, data: SaleData): Promise<SaleDTO> {
    const existingSale = await this._saleRepository.findById(id);
    if (!existingSale) {
      throw new HttpError(StatusCode.NOT_FOUND, "Sale not found");
    }

    const product = await this._productRepository.findOne({ name: data.productName });
    if (!product) {
      throw new HttpError(StatusCode.BAD_REQUEST, "Product not found");
    }

    // Restore previous quantity
    product.stock += existingSale.quantity;

    // Check if there's enough stock for the new quantity
    if (product.stock < data.quantity) {
      throw new HttpError(StatusCode.BAD_REQUEST, "Not enough stock available");
    }

    // Deduct new quantity
    product.stock -= data.quantity;

    await this._productRepository.update(String(product._id), { stock: product.stock });

    const updatedSale = await this._saleRepository.update(id, {
      productName: data.productName,
      quantity: data.quantity,
      totalPrice: data.totalPrice,
      customerName: data.customerName,
      saleDate: new Date(data.saleDate)
    });

    if (!updatedSale) {
      throw new HttpError(StatusCode.INTERNAL_SERVER_ERROR, "Can't update your sale data");
    }

    return {
      id: updatedSale._id.toString(),
      productName: updatedSale.productName,
      quantity: updatedSale.quantity,
      totalPrice: updatedSale.totalPrice,
      customerName: updatedSale.customerName,
      saleDate: updatedSale.saleDate
    };
  }

  async getSales(page: number, limit: number, search: string): Promise<PaginatedData<SaleDTO>> {
    const { data, total } = await this._saleRepository.findPaginated(page, limit, search);
    if (!data) {
      throw new HttpError(StatusCode.NOT_FOUND, "Can't get the cars.")
    };
    const saleDTOs: SaleDTO[] = data.map(sale => ({
      id: sale._id.toString(),
      productName: sale.productName,
      quantity: sale.quantity,
      totalPrice: sale.totalPrice,
      customerName: sale.customerName,
      saleDate: sale.saleDate
    }));

    return {
      data: saleDTOs,
      totalPages: Math.ceil(total / limit),
      currentPage: page
    };
  }

  async deleteSale(id: string): Promise<void> {
    if (!id) {
      throw new HttpError(StatusCode.BAD_REQUEST, "Product ID is required.");
    }

    const existingProduct = await this._saleRepository.findById(id);
    if (!existingProduct) {
      throw new HttpError(StatusCode.NOT_FOUND, "Product not found.");
    }

    const deleted = await this._saleRepository.update(id, { isDeleted: true });
    if (!deleted) {
      throw new HttpError(StatusCode.INTERNAL_SERVER_ERROR, "Failed to delete product.");
    }
  }

  async getSalesReport(userId: string, from: Date, to: Date): Promise<SalesReportDTO> {
    const sales = await this._saleRepository.findByDateRange(userId, from, to);

    if (!sales || sales.length === 0) {
      return {
        totalSales: 0,
        totalRevenue: 0,
        totalQuantity: 0,
        topSellingProduct: null,
        uniqueCustomers: 0,
        sales: []
      };
    }

    let totalRevenue = 0;
    let totalQuantity = 0;
    const productCount: Record<string, number> = {};
    const customerSet = new Set<string>();

    const saleDTOs: SaleDTO[] = sales.map(sale => {
      totalRevenue += sale.totalPrice;
      totalQuantity += sale.quantity;

      productCount[sale.productName] = (productCount[sale.productName] || 0) + sale.quantity;
      customerSet.add(sale.customerId.toString());

      return {
        id: sale._id.toString(),
        productName: sale.productName,
        quantity: sale.quantity,
        totalPrice: sale.totalPrice,
        customerName: sale.customerName,
        saleDate: sale.saleDate
      };
    });

    const topSellingProduct = Object.entries(productCount).sort((a, b) => b[1] - a[1])[0]?.[0] || null;

    return {
      totalSales: sales.length,
      totalRevenue,
      totalQuantity,
      topSellingProduct,
      uniqueCustomers: customerSet.size,
      sales: saleDTOs
    };
  }

  async getCustomerLedgerReport(userId: string, from: Date, to: Date): Promise<CustomerLedgerReportDTO> {
    const customerLedger = await this._saleRepository.getCustomerLedger(userId, from, to);

    const summary = {
      totalCustomers: customerLedger.length,
      totalRevenue: customerLedger.reduce((sum, c) => sum + c.totalAmount, 0),
      totalTransactions: customerLedger.reduce((sum, c) => sum + c.totalPurchases, 0),
      averageCustomerValue:
        customerLedger.length > 0
          ? customerLedger.reduce((sum, c) => sum + c.totalAmount, 0) / customerLedger.length
          : 0,
      topCustomer: customerLedger.length > 0 ? customerLedger[0].customerName : null,
    };

    return {
      summary,
      customers: customerLedger,
    };
  }
}

export default new SaleService(saleRepsitory, productRepository);
