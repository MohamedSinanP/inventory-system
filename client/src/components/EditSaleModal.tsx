import React, { useEffect } from 'react';
import { X } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import type { SaleItem, SaleFormData } from '../types/type';

interface EditSaleModalProps {
  isOpen: boolean;
  onClose: () => void;
  onEdit: (id: string, saleData: SaleFormData) => Promise<void>;
  sale: SaleItem | null;
}

const saleSchema = z.object({
  productName: z.string().min(1, 'Product name is required'),
  quantity: z.coerce.number().min(1, 'Quantity must be at least 1'),
  totalPrice: z.coerce.number().min(0.01, 'Total price must be greater than 0'),
  customerName: z.string().min(1, 'Customer name is required'),
  saleDate: z.string().min(1, 'Sale date is required'),
});

type FormValues = z.infer<typeof saleSchema>;

const EditSaleModal: React.FC<EditSaleModalProps> = ({ isOpen, onClose, onEdit, sale }) => {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(saleSchema),
    defaultValues: {
      productName: '',
      quantity: 1,
      totalPrice: 0,
      customerName: '',
      saleDate: new Date().toISOString().slice(0, 16),
    },
  });

  useEffect(() => {
    if (isOpen && sale) {
      reset({
        productName: sale.productName,
        quantity: sale.quantity,
        totalPrice: sale.totalPrice,
        customerName: sale.customerName,
        saleDate: new Date(sale.saleDate).toISOString().slice(0, 16),
      });
    }
  }, [isOpen, sale, reset]);

  const onSubmit = async (data: FormValues) => {
    if (!sale) return;
    await onEdit(sale.id, data);
  };

  if (!isOpen || !sale) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-800 rounded-lg w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-700">
          <h2 className="text-xl font-semibold text-white">Edit Sale</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-4">
          {/* Product Name */}
          <div>
            <label htmlFor="productName" className="block text-sm font-medium text-gray-300 mb-1">
              Product Name *
            </label>
            <input
              id="productName"
              {...register('productName')}
              className={`w-full px-3 py-2 bg-gray-700 border rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-red-500 ${errors.productName ? 'border-red-500' : 'border-gray-600'
                }`}
              placeholder="Enter product name"
            />
            {errors.productName && (
              <p className="mt-1 text-sm text-red-400">{errors.productName.message}</p>
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
              {...register('quantity')}
              className={`w-full px-3 py-2 bg-gray-700 border rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-red-500 ${errors.quantity ? 'border-red-500' : 'border-gray-600'
                }`}
              placeholder="Enter quantity"
              min="1"
              step="1"
            />
            {errors.quantity && (
              <p className="mt-1 text-sm text-red-400">{errors.quantity.message}</p>
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
              {...register('totalPrice')}
              readOnly
              className="w-full px-3 py-2 bg-gray-600 border border-gray-600 rounded-lg text-gray-300 cursor-not-allowed"
              placeholder="Total price"
            />
            <p className="text-sm text-gray-400 mt-1">
              This field is read-only and shows the current total price
            </p>
          </div>

          {/* Customer Name */}
          <div>
            <label htmlFor="customerName" className="block text-sm font-medium text-gray-300 mb-1">
              Customer Name *
            </label>
            <input
              id="customerName"
              {...register('customerName')}
              className={`w-full px-3 py-2 bg-gray-700 border rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-red-500 ${errors.customerName ? 'border-red-500' : 'border-gray-600'
                }`}
              placeholder="Enter customer name"
            />
            {errors.customerName && (
              <p className="mt-1 text-sm text-red-400">{errors.customerName.message}</p>
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
              className={`w-full px-3 py-2 bg-gray-700 border rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-red-500 ${errors.saleDate ? 'border-red-500' : 'border-gray-600'
                }`}
            />
            {errors.saleDate && (
              <p className="mt-1 text-sm text-red-400">{errors.saleDate.message}</p>
            )}
          </div>

          {/* Submit */}
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={isSubmitting}
              className="bg-red-600 hover:bg-red-700 text-white font-semibold py-2 px-4 rounded-lg disabled:opacity-50"
            >
              {isSubmitting ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditSaleModal;