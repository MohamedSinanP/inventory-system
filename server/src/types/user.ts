import mongoose, { Document } from "mongoose";

export interface IUser {
  email: string;
  password: string;
  isBlocked: boolean;
  role: string;
  refreshToken?: string | null;
}

export type AuthDTO = {
  email: string;
  accessToken: string;
  refreshToken: string;
  role: string;
}

export interface IUserModel extends IUser, Document { }

export interface Product {
  id?: string;
  userId: string;
  name: string;
  description: string;
  stock: number;
  price: number;
}
export interface IProductModel extends Document {
  _id: mongoose.ObjectId;
  userId: mongoose.ObjectId;
  name: string;
  description: string;
  stock: number;
  price: number;
  isDeleted: boolean;
}

export type ProductDTO = {
  id: string;
  name: string;
  description: string;
  stock: number;
  price: number;
}

export interface SaleData {
  productName: string;
  quantity: number;
  totalPrice: number;
  customerName: string;
  saleDate: Date;
  productId?: string
  customerId?: string;
  userId?: string;
  isDeleted?: boolean;
}

export interface ISaleModel extends Document {
  _id: mongoose.ObjectId;
  productName: string;
  quantity: number;
  totalPrice: number;
  customerName: string;
  saleDate: Date;
  productId: mongoose.ObjectId;
  customerId: mongoose.ObjectId;
  userId: mongoose.ObjectId;
  isDeleted: boolean;
}

export type SaleDTO = {
  id: string;
  productName: string;
  quantity: number;
  totalPrice: number;
  customerName: string;
  saleDate: Date;
}

export interface customerData {
  name: string;
  email: string;
  address: string;
  phoneNumber: string;
  userId?: string;
}
export type CustomerDTO = {
  id: string;
  name: string;
  email: string;
  address: string;
  phoneNumber: string;
  userId: string;
}

export interface ICustomerModel extends Document {
  _id: mongoose.ObjectId;
  userId: mongoose.ObjectId;
  name: string;
  email: string;
  address: string;
  phoneNumber: string;
}

export interface SalesReportDTO {
  totalSales: number;
  totalRevenue: number;
  totalQuantity: number;
  topSellingProduct: string | null;
  uniqueCustomers: number;
  sales: SaleDTO[];
}

export type ItemsReport = {
  totalProducts: number;
  totalStock: number;
  totalInventoryValue: number;
  lowStockCount: number;
};

export interface CustomerLedgerDTO {
  customerId: string;
  customerName: string;
  email: string;
  phoneNumber: string;
  address: string;
  totalPurchases: number;
  totalAmount: number;
  totalQuantity: number;
  firstPurchase: Date;
  lastPurchase: Date;
  averageOrderValue: number;
  transactions: TransactionDTO[];
}

export interface CustomerLedgerSummaryDTO {
  totalCustomers: number;
  totalRevenue: number;
  totalTransactions: number;
  averageCustomerValue: number;
  topCustomer: string | null;
}

export interface CustomerLedgerReportDTO {
  summary: CustomerLedgerSummaryDTO;
  customers: CustomerLedgerDTO[];
}

export interface TransactionDTO {
  productName: string;
  quantity: number;
  totalPrice: number;
  saleDate: Date;
  productId: string;
}

export interface CustomerLedgerEntity {
  customerId: string;
  customerName: string;
  email: string;
  phoneNumber: string;
  address: string;
  totalPurchases: number;
  totalAmount: number;
  totalQuantity: number;
  firstPurchase: Date;
  lastPurchase: Date;
  averageOrderValue: number;
  transactions: TransactionDTO[];
}

export enum ExportFormat {
  PRINT = 'print',
  EXCEL = 'excel',
  PDF = 'pdf',
  EMAIL = 'email',
}

export type ReportType = 'sales' | 'items' | 'customer-ledger';

export interface ExportRequest {
  reportType: ReportType;
  format: ExportFormat;
  fromDate?: string;
  toDate?: string;
  email?: string;
}
export interface ItemsReportExportData {
  report: ItemsReport;
  products: ProductDTO[];
}