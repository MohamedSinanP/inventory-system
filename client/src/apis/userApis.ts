import { removeAuth, setAccessToken } from "../redux/slices/authSlice";
import type { AppDispatch } from "../redux/store";
import type { CustomerFormData, Product, SaleFormData } from "../types/type";
import api from "./api";

export const signup = async (formData: { email: string, password: string }) => {
  try {
    const response = await api.post('/auth/signup', formData);
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || error.message || "Signup failed");
  }
}
export const login = async (formData: { email: string, password: string }) => {
  try {
    const response = await api.post('/auth/login', formData);
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || error.message || "Login failed");
  }
}

export const logout = async () => {
  try {
    const response = await api.post('/auth/logout');
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || error.message || "Logout failed.");
  }
}

export const refreshAccessToken = () => async (dispatch: AppDispatch) => {
  try {
    const response = await api.post("/auth/refresh", { withCredentials: true });
    dispatch(setAccessToken(response.data.data.newAccessToken));
  } catch (error) {
    dispatch(removeAuth());
  }
};

export const addProduct = async (data: Product) => {
  try {
    const response = await api.post('/user/product', data);
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || error.message || "Product storing failed.");
  }
}

export const editProduct = async (id: string, data: Partial<Product>) => {
  try {
    const response = await api.put(`/user/product/${id}`, data);
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || error.message || "Product update failed.");
  }
}

export const deleteProduct = async (id: string) => {
  try {
    const response = await api.delete(`/user/product/${id}`);
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || error.message || "Product deletion failed.");
  }
}
export const getProducts = async (page: number, limit: number, search: string) => {
  try {
    const response = await api.get(`/user/product`, {
      params: {
        page,
        limit,
        search
      }
    });
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || error.message || "Product fetching failed.");
  }
}

export const addSale = async (data: SaleFormData) => {
  try {
    const response = await api.post('/user/sale', data);
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || error.message || "Sale storing failed.");
  }
}
export const ediSale = async (id: string, data: SaleFormData) => {
  try {
    const response = await api.put(`/user/sale/${id}`, data);
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || error.message || "sale updation failed.");
  }
}

export const getSales = async (page: number, limit: number, search: string) => {
  try {
    const response = await api.get(`/user/sale`, {
      params: {
        page,
        limit,
        search
      }
    });
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || error.message || "Sale fetching failed.");
  }
}

export const deleteSale = async (id: string) => {
  try {
    const response = await api.delete(`/user/sale/${id}`);
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || error.message || "Sale deleting failed.");
  }
}

export const getAllProducts = async () => {
  try {
    const response = await api.get('/user/all-product');
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || error.message || "Product fetching failed.");
  }
}
export const addCustomer = async (data: CustomerFormData) => {
  try {
    const response = await api.post('/user/customer', data);
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || error.message || "Customer storing failed.");
  }
}
export const editCustomer = async (id: string, data: CustomerFormData) => {
  try {
    const response = await api.put(`/user/customer/${id}`, data);
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || error.message || "Customer editing failed.");
  }
}
export const getCustomers = async (page: number, limit: number, search: string) => {
  try {
    const response = await api.get('/user/customer', {
      params: {
        page,
        limit,
        search
      }
    });
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || error.message || "Customer fetching failed.");
  }
}
export const getAllCustomers = async () => {
  try {
    const response = await api.get('/user/all-customer');
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || error.message || "Customer fetching failed.");
  }
}
export const getSalesReport = async (from: string, to: string) => {
  try {
    const response = await api.get('/user/sales-report', {
      params: { from, to }
    });
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || error.message || "Sales report fetch failed.");
  }
};
export const getItemsReport = async () => {
  try {
    const response = await api.get('/user/products-report');
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || error.message || "Items report fetch failed.");
  }
};

export const getCustomerLedger = async (from: string, to: string) => {
  try {
    const response = await api.get('/user/customer-ledger', {
      params: { from, to }
    });
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || error.message || "Customer ledger fetch failed.");
  }
};

export const exportReport = async (
  reportType: 'sales' | 'items' | 'customer-ledger',
  format: 'print' | 'excel' | 'pdf' | 'email',
  fromDate?: string,
  toDate?: string,
  email?: string
) => {
  try {
    const params = new URLSearchParams({
      reportType,
      format,
      ...(fromDate && { fromDate }),
      ...(toDate && { toDate }),
      ...(email && { email })
    });

    if (format === 'email') {
      const response = await api.get('/user/export', {
        params: params
      });
      return response.data;
    }

    const response = await api.get('/user/export', {
      params: params,
      responseType: 'arraybuffer'
    });

    return {
      content: response.data,
      status: response.status,
      headers: response.headers
    };
  } catch (error: any) {
    throw new Error(error.response?.data?.message || error.message || "Report exportation failed.");
  }
};