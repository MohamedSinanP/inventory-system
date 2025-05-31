export interface Auth {
  user: { email: string | null; role: string | null } | null;
  accessToken: string | null;
}

export interface Product {
  id?: string;
  name: string;
  description: string;
  stock: number;
  price: number;
}

export interface InventoryItem {
  id: string;
  name: string;
  description: string;
  stock: number;
  price: number;
}

export interface ProductFormData {
  name: string;
  description: string;
  stock: number;
  price: number;
}

export interface SaleFormData {
  productName: string;
  quantity: number;
  totalPrice: number;
  customerName: string;
  saleDate: string;
}

export interface SaleItem extends SaleFormData {
  id: string;
}

export interface CustomerFormData {
  name: string;
  email: string;
  address: string;
  phoneNumber: string;
}