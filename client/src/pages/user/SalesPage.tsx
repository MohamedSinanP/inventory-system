import { useEffect, useState } from 'react';
import { Search, Plus, Edit3, Trash2 } from 'lucide-react';
import AddSaleModal from '../../components/AddSaleModal';
import EditSaleModal from '../../components/EditSaleModal';
import DeleteConfirmationModal from '../../components/DeleteConfirmationModal';
import Pagination from '../../components/Pagination';
import Navbar from '../../components/Navbar';
import { toast } from 'react-toastify';
import { addSale, deleteSale, ediSale, getSales } from '../../apis/userApis';
import type { SaleItem, SaleFormData } from '../../types/type';
import { formatPrice } from '../../utils/common';

const SalesPage = () => {
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [showAddModal, setShowAddModal] = useState<boolean>(false);
  const [showEditModal, setShowEditModal] = useState<boolean>(false);
  const [showDeleteModal, setShowDeleteModal] = useState<boolean>(false);
  const [selectedSale, setSelectedSale] = useState<SaleItem | null>(null);
  const [salesData, setSalesData] = useState<SaleItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState<string>('');
  const itemsPerPage = 10;

  // Fetch sales data from server API
  const fetchSalesData = async (page: number = 1, search: string = '') => {
    setLoading(true);
    try {
      const response = await getSales(page, itemsPerPage, search);
      setSalesData(response.data.data);
      setTotalPages(response.data.totalPages);
      setCurrentPage(response.data.currentPage);
    } catch (error: any) {
      toast.error(error.message || "Failed to fetch sales.");
      setSalesData([]);
      setTotalPages(1);
    } finally {
      setLoading(false);
    }
  };

  // Debounce search term
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 500); // 500ms delay

    return () => clearTimeout(timer);
  }, [searchTerm]);

  useEffect(() => {
    fetchSalesData(currentPage, debouncedSearchTerm);
  }, [currentPage, debouncedSearchTerm]);

  useEffect(() => {
    if (currentPage !== 1) {
      setCurrentPage(1);
    }
  }, [debouncedSearchTerm]);

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleAddSale = async (saleData: SaleFormData) => {
    try {
      const result = await addSale(saleData);
      toast.success(result.message);
      await fetchSalesData(currentPage, debouncedSearchTerm);
    } catch (error: any) {
      toast.error(error.message || "Failed to add sale.");
    }
  };

  const handleEditSale = async (id: string, saleData: SaleFormData) => {
    try {
      await ediSale(id, saleData);
      setShowEditModal(false);
      setSelectedSale(null);
      await fetchSalesData(currentPage, debouncedSearchTerm);
    } catch (error: any) {
      toast.error(error.message || "Failed to edit sale.");
    }
  };

  const handleDeleteSale = async () => {
    if (!selectedSale) return;

    try {
      await deleteSale(selectedSale.id);
      setShowDeleteModal(false);
      setSelectedSale(null);

      const itemsOnCurrentPage = salesData.length;
      const shouldGoToPreviousPage = itemsOnCurrentPage === 1 && currentPage > 1;

      if (shouldGoToPreviousPage) {
        const newPage = currentPage - 1;
        setCurrentPage(newPage);
        await fetchSalesData(newPage, debouncedSearchTerm);
      } else {
        await fetchSalesData(currentPage, debouncedSearchTerm);
      }
    } catch (error: any) {
      toast.error(error.message || "Failed to delete sale.");
      setShowDeleteModal(false);
      setSelectedSale(null);
    }
  };

  const openEditModal = (sale: SaleItem) => {
    setSelectedSale(sale);
    setShowEditModal(true);
  };

  const openDeleteModal = (sale: SaleItem) => {
    setSelectedSale(sale);
    setShowDeleteModal(true);
  };

  const handleSearchChange = (value: string) => {
    setSearchTerm(value);
  };

  return (
    <div className="min-h-screen bg-gray-900">
      <Navbar />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">Sales Management</h1>
            <p className="text-gray-400">Track and manage your sales transactions</p>
          </div>
          <button
            onClick={() => setShowAddModal(true)}
            className="mt-4 sm:mt-0 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors font-medium flex items-center cursor-pointer"
          >
            <Plus className="h-5 w-5 mr-2" />
            Add Sale
          </button>
        </div>

        {/* Search */}
        <div className="bg-black border border-red-600/20 rounded-lg p-6 mb-8">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search sales by product name or customer..."
                value={searchTerm}
                onChange={(e) => handleSearchChange(e.target.value)}
                className="w-full bg-gray-800 border border-gray-600 rounded-lg pl-10 pr-4 py-2 text-white focus:border-red-600 focus:outline-none"
              />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm('')}
                  className="absolute right-3 top-3 text-gray-400 hover:text-white"
                >
                  ✕
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Search Results Indicator */}
        {debouncedSearchTerm && (
          <div className="mb-4 p-3 bg-gray-800 border border-gray-700 rounded-lg">
            <div className="flex items-center justify-between">
              <span className="text-gray-300">
                Search results for: <span className="text-white font-medium">"{debouncedSearchTerm}"</span>
                {!loading && salesData.length > 0 && (
                  <span className="ml-2 text-gray-400">
                    ({salesData.length} result{salesData.length !== 1 ? 's' : ''})
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

        {/* Sales Table */}
        <div className="bg-black border border-red-600/20 rounded-lg overflow-hidden">
          {loading ? (
            <div className="p-8 text-center text-gray-400">Loading...</div>
          ) : salesData.length === 0 ? (
            <div className="p-8 text-center text-gray-400">
              {debouncedSearchTerm ? (
                <div>
                  <p>No sales found matching "{debouncedSearchTerm}"</p>
                  <button
                    onClick={() => setSearchTerm('')}
                    className="mt-2 text-red-400 hover:text-red-300 underline"
                  >
                    Clear search
                  </button>
                </div>
              ) : (
                'No sales available.'
              )}
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="border-b border-gray-800">
                    <tr>
                      <th className="text-left py-4 px-6 text-gray-400 font-medium">Product Name</th>
                      <th className="text-left py-4 px-6 text-gray-400 font-medium">Quantity</th>
                      <th className="text-left py-4 px-6 text-gray-400 font-medium">Total Price</th>
                      <th className="text-left py-4 px-6 text-gray-400 font-medium">Customer Name</th>
                      <th className="text-left py-4 px-6 text-gray-400 font-medium">Sale Date</th>
                      <th className="text-left py-4 px-6 text-gray-400 font-medium">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {salesData.map((sale) => (
                      <tr key={sale.id} className="border-b border-gray-800 hover:bg-gray-800/50">
                        <td className="py-4 px-6">
                          <div className="text-white font-medium">{sale.productName}</div>
                        </td>
                        <td className="py-4 px-6 text-white font-medium">{sale.quantity}</td>
                        <td className="py-4 px-6 text-white font-medium">{formatPrice(sale.totalPrice)}</td>
                        <td className="py-4 px-6 text-gray-300">{sale.customerName}</td>
                        <td className="py-4 px-6 text-gray-300">{formatDate(sale.saleDate)}</td>
                        <td className="py-4 px-6">
                          <div className="flex space-x-2">
                            <button
                              onClick={() => openEditModal(sale)}
                              className="text-gray-400 hover:text-red-400 transition-colors cursor-pointer"
                            >
                              <Edit3 className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => openDeleteModal(sale)}
                              className="text-gray-400 hover:text-red-400 transition-colors cursor-pointer"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

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
      </main>

      {/* Modals */}
      <AddSaleModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onAdd={handleAddSale}
      />

      <EditSaleModal
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        onEdit={handleEditSale}
        sale={selectedSale}
      />

      <DeleteConfirmationModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={handleDeleteSale}
        productName={`Sale to ${selectedSale?.customerName || ''}`}
      />
    </div>
  );
};

export default SalesPage;