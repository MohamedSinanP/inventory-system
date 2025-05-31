import { useEffect, useState } from 'react';
import { Search, Plus, Edit3, Trash2 } from 'lucide-react';
import AddProductModal from '../../components/AddProductModal';
import EditProductModal from '../../components/EditProductModal';
import DeleteConfirmationModal from '../../components/DeleteConfirmationModal';
import Pagination from '../../components/Pagination';
import Navbar from '../../components/Navbar';
import { toast } from 'react-toastify';
import { addProduct, deleteProduct, editProduct, getProducts } from '../../apis/userApis';
import type { InventoryItem, ProductFormData } from '../../types/type';
import { formatPrice } from '../../utils/common';

const InventoryPage = () => {
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [showAddModal, setShowAddModal] = useState<boolean>(false);
  const [showEditModal, setShowEditModal] = useState<boolean>(false);
  const [showDeleteModal, setShowDeleteModal] = useState<boolean>(false);
  const [selectedProduct, setSelectedProduct] = useState<InventoryItem | null>(null);
  const [inventoryData, setInventoryData] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState<string>('');
  const itemsPerPage = 10;

  // Updated fetchInventoryData to use server API
  const fetchInventoryData = async (page: number = 1, search: string = '') => {
    setLoading(true);
    try {
      const response = await getProducts(page, itemsPerPage, search);
      setInventoryData(response.data.data);
      setTotalPages(response.data.totalPages);
      setCurrentPage(response.data.currentPage);
    } catch (error: any) {
      toast.error(error.message || "Failed to fetch products.");
      setInventoryData([]);
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
    fetchInventoryData(currentPage, debouncedSearchTerm);
  }, [currentPage, debouncedSearchTerm]);

  // Reset to page 1 when search term changes
  useEffect(() => {
    if (currentPage !== 1) {
      setCurrentPage(1);
    }
  }, [debouncedSearchTerm]);

  const getStatusColor = (status: string): string => {
    switch (status) {
      case 'In Stock': return 'text-green-400 bg-green-400/10';
      case 'Low Stock': return 'text-yellow-400 bg-yellow-400/10';
      case 'Out of Stock': return 'text-red-400 bg-red-400/10';
      default: return 'text-gray-400 bg-gray-400/10';
    }
  };

  const getStatus = (stock: number): string => {
    if (stock === 0) return 'Out of Stock';
    if (stock <= 10) return 'Low Stock';
    return 'In Stock';
  };


  const handleAddProduct = async (productData: ProductFormData) => {
    try {
      const result = await addProduct(productData);
      toast.success(result.message);
      // Refresh the data from server after adding
      await fetchInventoryData(currentPage, debouncedSearchTerm);
    } catch (error: any) {
      toast.error(error.message || "Failed to add product.");
    }
  };

  const handleEditProduct = async (id: string, productData: ProductFormData) => {
    try {
      const result = await editProduct(id, productData);
      toast.success(result.message);
      setShowEditModal(false);
      setSelectedProduct(null);
      // Refresh the data from server after editing
      await fetchInventoryData(currentPage, debouncedSearchTerm);
    } catch (error: any) {
      toast.error(error.message || "Failed to edit product.");
    }
  };

  const handleDeleteProduct = async () => {
    if (!selectedProduct) return;

    try {
      await deleteProduct(selectedProduct.id);
      toast.success("Product deleted successfully.");

      // Close modal first
      setShowDeleteModal(false);
      setSelectedProduct(null);

      // Calculate if we need to go to previous page after deletion
      const itemsOnCurrentPage = inventoryData.length;
      const shouldGoToPreviousPage = itemsOnCurrentPage === 1 && currentPage > 1;

      if (shouldGoToPreviousPage) {
        // If this was the last item on current page and not on page 1, go to previous page
        const newPage = currentPage - 1;
        setCurrentPage(newPage);
        await fetchInventoryData(newPage, debouncedSearchTerm);
      } else {
        // Otherwise, refresh current page
        await fetchInventoryData(currentPage, debouncedSearchTerm);
      }
    } catch (error: any) {
      toast.error(error.message || "Failed to delete product.");
      setShowDeleteModal(false);
      setSelectedProduct(null);
    }
  };

  const openEditModal = (product: InventoryItem) => {
    setSelectedProduct(product);
    setShowEditModal(true);
  };

  const openDeleteModal = (product: InventoryItem) => {
    setSelectedProduct(product);
    setShowDeleteModal(true);
  };

  // Handle search input change
  const handleSearchChange = (value: string) => {
    setSearchTerm(value);
  };

  return (
    <div className="min-h-screen bg-gray-900">
      <Navbar />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">Inventory Management</h1>
            <p className="text-gray-400">Manage your products and track stock levels</p>
          </div>
          <button
            onClick={() => setShowAddModal(true)}
            className="mt-4 sm:mt-0 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors font-medium flex items-center cursor-pointer"
          >
            <Plus className="h-5 w-5 mr-2" />
            Add Product
          </button>
        </div>

        {/* Search */}
        <div className="bg-black border border-red-600/20 rounded-lg p-6 mb-8">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search products by name or description..."
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
                {!loading && inventoryData.length > 0 && (
                  <span className="ml-2 text-gray-400">
                    ({inventoryData.length} result{inventoryData.length !== 1 ? 's' : ''})
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

        {/* Inventory Table */}
        <div className="bg-black border border-red-600/20 rounded-lg overflow-hidden">
          {loading ? (
            <div className="p-8 text-center text-gray-400">Loading...</div>
          ) : inventoryData.length === 0 ? (
            <div className="p-8 text-center text-gray-400">
              {debouncedSearchTerm ? (
                <div>
                  <p>No products found matching "{debouncedSearchTerm}"</p>
                  <button
                    onClick={() => setSearchTerm('')}
                    className="mt-2 text-red-400 hover:text-red-300 underline"
                  >
                    Clear search
                  </button>
                </div>
              ) : (
                'No products available.'
              )}
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="border-b border-gray-800">
                    <tr>
                      <th className="text-left py-4 px-6 text-gray-400 font-medium">Product</th>
                      <th className="text-left py-4 px-6 text-gray-400 font-medium">Description</th>
                      <th className="text-left py-4 px-6 text-gray-400 font-medium">Stock</th>
                      <th className="text-left py-4 px-6 text-gray-400 font-medium">Price</th>
                      <th className="text-left py-4 px-6 text-gray-400 font-medium">Status</th>
                      <th className="text-left py-4 px-6 text-gray-400 font-medium">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {inventoryData.map((item) => {
                      const status = getStatus(item.stock);
                      return (
                        <tr key={item.id} className="border-b border-gray-800 hover:bg-gray-800/50">
                          <td className="py-4 px-6">
                            <div>
                              <div className="text-white font-medium">{item.name}</div>
                            </div>
                          </td>
                          <td className="py-4 px-6 text-gray-300 max-w-xs">
                            <div className="truncate">{item.description}</div>
                          </td>
                          <td className="py-4 px-6 text-white font-medium">{item.stock}</td>
                          <td className="py-4 px-6 text-white font-medium">{formatPrice(item.price)}</td>
                          <td className="py-4 px-6">
                            <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(status)}`}>
                              {status}
                            </span>
                          </td>
                          <td className="py-4 px-6">
                            <div className="flex space-x-2">
                              <button
                                onClick={() => openEditModal(item)}
                                className="text-gray-400 hover:text-red-400 transition-colors cursor-pointer"
                              >
                                <Edit3 className="h-4 w-4" />
                              </button>
                              <button
                                onClick={() => openDeleteModal(item)}
                                className="text-gray-400 hover:text-red-400 transition-colors cursor-pointer"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
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
      <AddProductModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onAdd={handleAddProduct}
      />

      <EditProductModal
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        onEdit={handleEditProduct}
        product={selectedProduct}
      />

      <DeleteConfirmationModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={handleDeleteProduct}
        productName={selectedProduct?.name || ''}
      />
    </div>
  );
};

export default InventoryPage;