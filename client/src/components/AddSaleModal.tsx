import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { X } from 'lucide-react';
import { getAllProducts, getAllCustomers } from '../apis/userApis';

interface Product {
  id: string;
  name: string;
  description: string;
  stock: number;
  price: number;
}

interface Customer {
  id: string;
  name: string;
  email: string;
  phoneNumber: string;
  address: string;
}

const saleSchema = z.object({
  productId: z.string().min(1, 'Product selection is required'),
  quantity: z
    .number({ invalid_type_error: 'Quantity must be a number' })
    .min(1, 'Quantity must be at least 1'),
  totalPrice: z
    .number({ invalid_type_error: 'Total price must be a number' })
    .min(0.01, 'Total price must be greater than 0'),
  customerId: z.string().min(1, 'Customer selection is required'),
  saleDate: z.string().min(1, 'Sale date is required'),
});

type SaleFormData = z.infer<typeof saleSchema>;

interface AddSaleModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (data: SaleFormData & { productName: string; customerName: string }) => Promise<void>;
}

const AddSaleModal: React.FC<AddSaleModalProps> = ({ isOpen, onClose, onAdd }) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<SaleFormData>({
    resolver: zodResolver(saleSchema),
    defaultValues: {
      productId: '',
      quantity: 1,
      totalPrice: 0,
      customerId: '',
      saleDate: new Date().toISOString().slice(0, 16),
    },
  });

  const selectedProductId = watch('productId');
  const selectedCustomerId = watch('customerId');
  const selectedProduct = products.find(p => p.id === selectedProductId);
  const selectedCustomer = customers.find(c => c.id === selectedCustomerId);

  // Fetch products and customers when modal opens
  useEffect(() => {
    if (isOpen) {
      fetchData();
      reset({
        productId: '',
        quantity: 1,
        totalPrice: 0,
        customerId: '',
        saleDate: new Date().toISOString().slice(0, 16),
      });
    }
  }, [isOpen, reset]);

  useEffect(() => {
    if (selectedProduct && watch('quantity')) {
      const quantity = watch('quantity');
      const totalPrice = selectedProduct.price * quantity;
      setValue('totalPrice', Number(totalPrice.toFixed(2)));
    }
  }, [selectedProduct, watch('quantity'), setValue]);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [productData, customerData] = await Promise.all([
        getAllProducts(),
        getAllCustomers()
      ]);

      // Handle products
      if (productData && Array.isArray(productData.data)) {
        setProducts(productData.data);
      } else {
        setProducts([]);
      }

      // Handle customers
      if (customerData && Array.isArray(customerData.data)) {
        setCustomers(customerData.data);
      } else {
        setCustomers([]);
      }

      // Set error if both are empty
      if ((!productData?.data || productData.data.length === 0) &&
        (!customerData?.data || customerData.data.length === 0)) {
        setError('No products or customers available');
      } else if (!productData?.data || productData.data.length === 0) {
        setError('No products available');
      } else if (!customerData?.data || customerData.data.length === 0) {
        setError('No customers available');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to fetch data');
      setProducts([]);
      setCustomers([]);
    } finally {
      setLoading(false);
    }
  };

  const onSubmit = async (data: SaleFormData) => {
    const selectedProduct = products.find(p => p.id === data.productId);
    const selectedCustomer = customers.find(c => c.id === data.customerId);

    if (!selectedProduct) {
      setError('Selected product not found');
      return;
    }

    if (!selectedCustomer) {
      setError('Selected customer not found');
      return;
    }

    // Check stock availability
    if (data.quantity > selectedProduct.stock) {
      setError(`Insufficient stock. Available: ${selectedProduct.stock}`);
      return;
    }

    // Include product name and customer name in submission data
    const submissionData = {
      ...data,
      productName: selectedProduct.name,
      customerName: selectedCustomer.name,
      productId: selectedProduct.id,
      customerId: selectedCustomer.id
    };

    await onAdd(submissionData);
    onClose();
  };

  if (!isOpen) return null;

  const isFormDisabled = loading || products.length === 0 || customers.length === 0;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-800 rounded-lg w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-700">
          <h2 className="text-xl font-semibold text-white">Add New Sale</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors">
            <X className="h-6 w-6" />
          </button>
        </div>

        {error && (
          <div className="mx-6 mt-4 p-3 bg-red-900/50 border border-red-600 rounded-lg text-red-300 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-4">
          {/* Product Selection */}
          <div>
            <label htmlFor="productId" className="block text-sm font-medium text-gray-300 mb-1">
              Product *
            </label>
            {loading ? (
              <div className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-gray-400">
                Loading products...
              </div>
            ) : (
              <select
                id="productId"
                {...register('productId')}
                disabled={isFormDisabled}
                className={`w-full px-3 py-2 bg-gray-700 border rounded-lg text-white focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed ${errors.productId ? 'border-red-500' : 'border-gray-600'
                  }`}
              >
                <option value="">
                  {products.length === 0 ? 'No products available' : 'Select a product'}
                </option>
                {products.map((product) => (
                  <option key={product.id} value={product.id}>
                    {product.name} - ₹{product.price} (Stock: {product.stock})
                  </option>
                ))}
              </select>
            )}
            {errors.productId && <p className="text-sm text-red-400 mt-1">{errors.productId.message}</p>}
            {selectedProduct && (
              <p className="text-sm text-gray-400 mt-1">
                {selectedProduct.description} | Available stock: {selectedProduct.stock}
              </p>
            )}
          </div>

          {/* Quantity */}
          <div>
            <label htmlFor="quantity" className="block text-sm font-medium text-gray-300 mb-1">
              Quantity *
            </label>
            <input
              type="number"
              id="quantity"
              {...register('quantity', { valueAsNumber: true })}
              min="1"
              max={selectedProduct?.stock || undefined}
              step="1"
              disabled={!selectedProduct}
              className={`w-full px-3 py-2 bg-gray-700 border rounded-lg text-white focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed ${errors.quantity ? 'border-red-500' : 'border-gray-600'
                }`}
              placeholder="Enter quantity"
            />
            {errors.quantity && <p className="text-sm text-red-400 mt-1">{errors.quantity.message}</p>}
            {selectedProduct && watch('quantity') > selectedProduct.stock && (
              <p className="text-sm text-red-400 mt-1">
                Quantity exceeds available stock ({selectedProduct.stock})
              </p>
            )}
          </div>

          {/* Total Price - Read Only */}
          <div>
            <label htmlFor="totalPrice" className="block text-sm font-medium text-gray-300 mb-1">
              Total Price
            </label>
            <input
              type="number"
              id="totalPrice"
              {...register('totalPrice', { valueAsNumber: true })}
              readOnly
              className="w-full px-3 py-2 bg-gray-600 border border-gray-600 rounded-lg text-gray-300 cursor-not-allowed"
              placeholder="Auto-calculated"
            />
            <p className="text-sm text-gray-400 mt-1">
              Auto-calculated based on product price and quantity
            </p>
          </div>

          {/* Customer Selection */}
          <div>
            <label htmlFor="customerId" className="block text-sm font-medium text-gray-300 mb-1">
              Customer *
            </label>
            {loading ? (
              <div className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-gray-400">
                Loading customers...
              </div>
            ) : (
              <select
                id="customerId"
                {...register('customerId')}
                disabled={isFormDisabled}
                className={`w-full px-3 py-2 bg-gray-700 border rounded-lg text-white focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed ${errors.customerId ? 'border-red-500' : 'border-gray-600'
                  }`}
              >
                <option value="">
                  {customers.length === 0 ? 'No customers available' : 'Select a customer'}
                </option>
                {customers.map((customer) => (
                  <option key={customer.id} value={customer.id}>
                    {customer.name} - {customer.email}
                  </option>
                ))}
              </select>
            )}
            {errors.customerId && <p className="text-sm text-red-400 mt-1">{errors.customerId.message}</p>}
            {selectedCustomer && (
              <p className="text-sm text-gray-400 mt-1">
                Phone: {selectedCustomer.phoneNumber} | Address: {selectedCustomer.address}
              </p>
            )}
          </div>

          {/* Sale Date */}
          <div>
            <label htmlFor="saleDate" className="block text-sm font-medium text-gray-300 mb-1">
              Sale Date *
            </label>
            <input
              type="datetime-local"
              id="saleDate"
              {...register('saleDate')}
              className={`w-full px-3 py-2 bg-gray-700 border rounded-lg text-white focus:outline-none ${errors.saleDate ? 'border-red-500' : 'border-gray-600'
                }`}
            />
            {errors.saleDate && <p className="text-sm text-red-400 mt-1">{errors.saleDate.message}</p>}
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || isFormDisabled || !selectedProduct || !selectedCustomer}
              className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? 'Adding...' : 'Add Sale'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddSaleModal;