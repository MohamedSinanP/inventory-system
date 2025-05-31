import React, { useEffect, useState } from 'react';
import {
  UserPlus,
  Search,
  Mail,
  Phone,
  MapPin,
  Edit3,
  User,
  Loader2
} from 'lucide-react';
import Navbar from '../../components/Navbar';
import CustomerModal from '../../components/CustomerModal';
import type { CustomerFormData } from '../../components/CustomerModal';
import Pagination from '../../components/Pagination';
import { useNavigate } from 'react-router-dom';
import type { RootStateType } from '../../redux/store';
import { useSelector } from 'react-redux';
import { addCustomer, editCustomer, getCustomers } from '../../apis/userApis';

interface Customer {
  id: string;
  name: string;
  email: string;
  address: string;
  phoneNumber: string;
}

const CustomersPage: React.FC = () => {
  const navigate = useNavigate();
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [isAddModalOpen, setIsAddModalOpen] = useState<boolean>(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState<boolean>(false);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [formLoading, setFormLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState<string>('');
  const limit = 6;

  const { user, accessToken } = useSelector((state: RootStateType) => state.auth);

  useEffect(() => {
    if (!user || !accessToken) {
      navigate('/login');
    } else {
      fetchCustomers(currentPage, debouncedSearchTerm);
    }
  }, [user, accessToken, navigate, currentPage, debouncedSearchTerm]);

  // Debounce search term
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 500);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  useEffect(() => {
    if (currentPage !== 1) {
      setCurrentPage(1);
    }
  }, [debouncedSearchTerm]);

  const fetchCustomers = async (page: number = 1, search: string = ''): Promise<void> => {
    try {
      setLoading(true);
      setError('');

      const result = await getCustomers(page, limit, search);
      setCustomers(result.data.data || []);
      setTotalPages(result.totalPages || 1);
      setCurrentPage(result.currentPage || 1);
    } catch (error: any) {
      console.error('Error fetching customers:', error);
      setError(error.message || 'Failed to load customers. Please try again.');
      setCustomers([]);
    } finally {
      setLoading(false);
    }
  };

  const handleAddCustomer = async (formData: CustomerFormData): Promise<void> => {
    try {
      setFormLoading(true);
      setError('');

      const response = await addCustomer(formData);

      setCustomers(prev => [response.data, ...prev]);
      setIsAddModalOpen(false);

      // Refresh the customer list
      await fetchCustomers(currentPage, debouncedSearchTerm);
    } catch (error: any) {
      console.error('Error adding customer:', error);
      setError(error.message || 'Failed to add customer. Please try again.');
      throw error; // Re-throw to let the modal handle the error state
    } finally {
      setFormLoading(false);
    }
  };

  const handleEditCustomer = async (formData: CustomerFormData): Promise<void> => {
    if (!selectedCustomer) {
      setError('No customer selected for editing');
      return;
    }

    try {
      setFormLoading(true);
      setError('');

      const response = await editCustomer(selectedCustomer.id, formData);

      // Update the customer in the list
      setCustomers(prev =>
        prev.map(customer =>
          customer.id === selectedCustomer.id ? response.data : customer
        )
      );

      setIsEditModalOpen(false);
      setSelectedCustomer(null);
    } catch (error: any) {
      console.error('Error updating customer:', error);
      setError(error.message || 'Failed to update customer. Please try again.');
      throw error; // Re-throw to let the modal handle the error state
    } finally {
      setFormLoading(false);
    }
  };

  const openEditModal = (customer: Customer): void => {
    setSelectedCustomer(customer);
    setError('');
    setIsEditModalOpen(true);
  };

  const openAddModal = (): void => {
    setError('');
    setIsAddModalOpen(true);
  };

  const closeModals = (): void => {
    setIsAddModalOpen(false);
    setIsEditModalOpen(false);
    setSelectedCustomer(null);
    setError('');
  };

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>): void => {
    setSearchTerm(e.target.value);
  };

  return (
    <div className="min-h-screen bg-gray-900">
      <Navbar />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">Customer Management</h1>
            <p className="text-gray-400">Manage your customer database</p>
          </div>
          <button
            onClick={openAddModal}
            className="mt-4 sm:mt-0 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors font-medium flex items-center"
          >
            <UserPlus className="h-5 w-5 mr-2" />
            Add Customer
          </button>
        </div>

        {/* Search */}
        <div className="bg-black border border-red-600/20 rounded-lg p-6 mb-8">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
            <input
              type="text"
              placeholder="Search customers by name, email, phone, or address..."
              value={searchTerm}
              onChange={handleSearch}
              className="w-full bg-gray-800 border border-gray-600 rounded-lg pl-10 pr-4 py-2 text-white focus:border-red-600 focus:outline-none"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white"
              >
                ✕
              </button>
            )}
          </div>
        </div>

        {/* Search Results Indicator */}
        {debouncedSearchTerm && (
          <div className="mb-4 p-3 bg-gray-800 border border-gray-700 rounded-lg">
            <div className="flex items-center justify-between">
              <span className="text-gray-300">
                Search results for: <span className="text-white font-medium">"{debouncedSearchTerm}"</span>
                {!loading && customers.length > 0 && (
                  <span className="ml-2 text-gray-400">
                    ({customers.length} result{customers.length !== 1 ? 's' : ''})
                  </span>
                )}
              </span>
              <button
                onClick={() => setSearchTerm('')}
                className="text-red-400 hover:text-red-300 text-sm font-medium"
              >
                Clear search
              </button>
            </div>
          </div>
        )}

        {/* Customers Table */}
        <div className="bg-black border border-red-600/20 rounded-lg overflow-hidden">
          <div className="p-6 border-b border-gray-800">
            <h3 className="text-xl font-semibold text-white">Customers List</h3>
          </div>

          {loading ? (
            <div className="p-12 text-center">
              <Loader2 className="h-8 w-8 animate-spin text-red-600 mx-auto mb-4" />
              <p className="text-gray-400">Loading customers...</p>
            </div>
          ) : customers.length === 0 ? (
            <div className="p-12 text-center">
              <User className="h-16 w-16 text-gray-600 mx-auto mb-4" />
              <p className="text-gray-400 text-lg">
                {debouncedSearchTerm ? (
                  <div>
                    <p>No customers found matching "{debouncedSearchTerm}"</p>
                    <button
                      onClick={() => setSearchTerm('')}
                      className="mt-2 text-red-400 hover:text-red-300 underline"
                    >
                      Clear search
                    </button>
                  </div>
                ) : (
                  'No customers found.'
                )}
              </p>
              {!debouncedSearchTerm && (
                <button
                  onClick={openAddModal}
                  className="mt-4 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors font-medium"
                >
                  Add Your First Customer
                </button>
              )}
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-800">
                      <th className="text-left text-gray-400 py-4 px-6 font-medium">Name</th>
                      <th className="text-left text-gray-400 py-4 px-6 font-medium">Email</th>
                      <th className="text-left text-gray-400 py-4 px-6 font-medium">Phone</th>
                      <th className="text-left text-gray-400 py-4 px-6 font-medium">Address</th>
                      <th className="text-left text-gray-400 py-4 px-6 font-medium">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {customers.map((customer) => (
                      <tr key={customer.id} className="border-b border-gray-800/50 hover:bg-gray-800/30 transition-colors">
                        <td className="py-4 px-6">
                          <div className="flex items-center">
                            <div className="bg-red-600/10 p-2 rounded-lg mr-3">
                              <User className="h-5 w-5 text-red-600" />
                            </div>
                            <div>
                              <p className="text-white font-medium">{customer.name}</p>
                            </div>
                          </div>
                        </td>
                        <td className="py-4 px-6">
                          <div className="flex items-center text-gray-300">
                            <Mail className="h-4 w-4 mr-2 text-gray-400" />
                            {customer.email}
                          </div>
                        </td>
                        <td className="py-4 px-6">
                          <div className="flex items-center text-gray-300">
                            <Phone className="h-4 w-4 mr-2 text-gray-400" />
                            {customer.phoneNumber}
                          </div>
                        </td>
                        <td className="py-4 px-6">
                          <div className="flex items-start text-gray-300">
                            <MapPin className="h-4 w-4 mr-2 text-gray-400 mt-0.5 flex-shrink-0" />
                            <span className="line-clamp-2">{customer.address}</span>
                          </div>
                        </td>
                        <td className="py-4 px-6">
                          <button
                            onClick={() => openEditModal(customer)}
                            className="bg-blue-600/10 text-blue-400 p-2 rounded hover:bg-blue-600/20 transition-colors"
                            title="Edit Customer"
                          >
                            <Edit3 className="h-4 w-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <Pagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  onPageChange={setCurrentPage}
                />
              )}
            </>
          )}
        </div>

        {/* Add Customer Modal */}
        <CustomerModal
          isOpen={isAddModalOpen}
          onClose={closeModals}
          onSubmit={handleAddCustomer}
          isEdit={false}
          loading={formLoading}
          error={error}
        />

        {/* Edit Customer Modal */}
        <CustomerModal
          isOpen={isEditModalOpen}
          onClose={closeModals}
          onSubmit={handleEditCustomer}
          isEdit={true}
          loading={formLoading}
          error={error}
          customer={selectedCustomer}
        />
      </main>
    </div>
  );
};

export default CustomersPage;