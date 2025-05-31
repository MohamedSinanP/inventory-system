import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  X,
  Save,
  AlertCircle,
  Loader2
} from 'lucide-react';

// Zod validation schema
const customerSchema = z.object({
  name: z.string()
    .min(1, 'Name is required')
    .min(2, 'Name must be at least 2 characters')
    .max(50, 'Name must be less than 50 characters'),
  email: z.string()
    .min(1, 'Email is required')
    .email('Please enter a valid email address'),
  phoneNumber: z.string()
    .min(1, 'Phone number is required')
    .regex(/^[\+]?[\d\s\-\(\)]{10,}$/, 'Please enter a valid phone number'),
  address: z.string()
    .min(1, 'Address is required')
    .min(10, 'Address must be at least 10 characters')
    .max(200, 'Address must be less than 200 characters')
});

export type CustomerFormData = z.infer<typeof customerSchema>;

interface Customer {
  id: string;
  name: string;
  email: string;
  address: string;
  phoneNumber: string;
}

interface CustomerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CustomerFormData) => Promise<void>;
  isEdit: boolean;
  loading: boolean;
  error: string;
  customer?: Customer | null;
}

const CustomerModal: React.FC<CustomerModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  isEdit,
  loading,
  error,
  customer
}) => {
  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
    reset,
    setValue
  } = useForm<CustomerFormData>({
    resolver: zodResolver(customerSchema),
    mode: 'onChange'
  });

  // Reset form when modal opens/closes or customer changes
  useEffect(() => {
    if (isOpen) {
      if (isEdit && customer) {
        setValue('name', customer.name);
        setValue('email', customer.email);
        setValue('phoneNumber', customer.phoneNumber);
        setValue('address', customer.address);
      } else {
        reset();
      }
    }
  }, [isOpen, isEdit, customer, setValue, reset]);

  const handleFormSubmit = async (data: CustomerFormData) => {
    await onSubmit(data);
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-900 border border-red-600/20 rounded-lg p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-white">
            {isEdit ? 'Edit Customer' : 'Add New Customer'}
          </h2>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-white transition-colors"
            disabled={loading}
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
          {error && (
            <div className="bg-red-600/10 border border-red-600/20 rounded-lg p-3 flex items-center text-red-400">
              <AlertCircle className="h-5 w-5 mr-2 flex-shrink-0" />
              <span className="text-sm">{error}</span>
            </div>
          )}

          <div>
            <label className="block text-gray-400 text-sm font-medium mb-2">Name *</label>
            <input
              type="text"
              {...register('name')}
              className={`w-full bg-gray-800 border rounded-lg px-4 py-2 text-white focus:outline-none transition-colors ${errors.name
                ? 'border-red-500 focus:border-red-500'
                : 'border-gray-600 focus:border-red-600'
                }`}
              placeholder="Enter customer name"
              disabled={loading}
            />
            {errors.name && (
              <p className="text-red-400 text-sm mt-1 flex items-center">
                <AlertCircle className="h-4 w-4 mr-1" />
                {errors.name.message}
              </p>
            )}
          </div>

          <div>
            <label className="block text-gray-400 text-sm font-medium mb-2">Email *</label>
            <input
              type="email"
              {...register('email')}
              className={`w-full bg-gray-800 border rounded-lg px-4 py-2 text-white focus:outline-none transition-colors ${errors.email
                ? 'border-red-500 focus:border-red-500'
                : 'border-gray-600 focus:border-red-600'
                }`}
              placeholder="Enter email address"
              disabled={loading}
            />
            {errors.email && (
              <p className="text-red-400 text-sm mt-1 flex items-center">
                <AlertCircle className="h-4 w-4 mr-1" />
                {errors.email.message}
              </p>
            )}
          </div>

          <div>
            <label className="block text-gray-400 text-sm font-medium mb-2">Phone Number *</label>
            <input
              type="tel"
              {...register('phoneNumber')}
              className={`w-full bg-gray-800 border rounded-lg px-4 py-2 text-white focus:outline-none transition-colors ${errors.phoneNumber
                ? 'border-red-500 focus:border-red-500'
                : 'border-gray-600 focus:border-red-600'
                }`}
              placeholder="Enter phone number"
              disabled={loading}
            />
            {errors.phoneNumber && (
              <p className="text-red-400 text-sm mt-1 flex items-center">
                <AlertCircle className="h-4 w-4 mr-1" />
                {errors.phoneNumber.message}
              </p>
            )}
          </div>

          <div>
            <label className="block text-gray-400 text-sm font-medium mb-2">Address *</label>
            <textarea
              {...register('address')}
              rows={3}
              className={`w-full bg-gray-800 border rounded-lg px-4 py-2 text-white focus:outline-none resize-none transition-colors ${errors.address
                ? 'border-red-500 focus:border-red-500'
                : 'border-gray-600 focus:border-red-600'
                }`}
              placeholder="Enter complete address"
              disabled={loading}
            />
            {errors.address && (
              <p className="text-red-400 text-sm mt-1 flex items-center">
                <AlertCircle className="h-4 w-4 mr-1" />
                {errors.address.message}
              </p>
            )}
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors font-medium flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <>
                  <Save className="h-5 w-5 mr-2" />
                  {isEdit ? 'Update Customer' : 'Add Customer'}
                </>
              )}
            </button>
            <button
              type="button"
              onClick={handleClose}
              disabled={loading}
              className="flex-1 bg-gray-700 text-white px-4 py-2 rounded-lg hover:bg-gray-600 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CustomerModal;