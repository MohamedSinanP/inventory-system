import React, { useEffect, useState } from 'react';
import {
  BarChart3,
  Package,
  DollarSign,
  Download,
  Calendar,
  ShoppingCart,
  AlertTriangle,
  Users,
  Loader2,
  ChevronLeft,
  ChevronRight,
  Search,
  Package2,
  TrendingDown,
  Mail,
} from 'lucide-react';
import Navbar from '../../components/Navbar';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { exportReport, getSalesReport, getItemsReport, getProducts, getCustomerLedger } from '../../apis/userApis';
import { saveAs } from 'file-saver';

interface RootStateType {
  auth: {
    user: any;
    accessToken: string | null;
  };
}

interface ReportType {
  id: string;
  name: string;
  icon: React.ComponentType<any>;
}

interface SaleData {
  id: string;
  productName: string;
  quantity: number;
  totalPrice: number;
  customerName: string;
  saleDate: string;
}

interface SalesReportData {
  totalSales: number;
  totalRevenue: number;
  totalQuantity: number;
  topSellingProduct: string | null;
  uniqueCustomers: number;
  sales: SaleData[];
}

interface ItemsReportData {
  totalProducts: number;
  totalStock: number;
  totalInventoryValue: number;
  lowStockCount: number;
}

interface ProductData {
  id: string;
  name: string;
  price: number;
  stock: number;
  description: string;
}

interface PaginatedProductsData {
  data: ProductData[];
  totalPages: number;
  currentPage: number;
}

interface CustomerLedgerSummary {
  totalCustomers: number;
  totalRevenue: number;
  totalTransactions: number;
  averageCustomerValue: number;
  topCustomer: string | null;
}

interface CustomerLedgerTransaction {
  productName: string;
  quantity: number;
  totalPrice: number;
  saleDate: string;
  productId: string;
}

interface CustomerLedgerEntity {
  customerId: string;
  customerName: string;
  email: string;
  phoneNumber: string;
  address: string;
  totalPurchases: number;
  totalAmount: number;
  totalQuantity: number;
  firstPurchase: string;
  lastPurchase: string;
  averageOrderValue: number;
  transactions: CustomerLedgerTransaction[];
}

interface CustomerLedgerReportDTO {
  summary: CustomerLedgerSummary;
  customers: CustomerLedgerEntity[];
}

const ReportsPage: React.FC = () => {
  const navigate = useNavigate();
  const [selectedReport, setSelectedReport] = useState<string>('sales');
  const [fromDate, setFromDate] = useState<string>('');
  const [toDate, setToDate] = useState<string>('');
  const [exportFormat, setExportFormat] = useState<'print' | 'excel' | 'pdf' | 'email'>('pdf');
  const [exportEmail, setExportEmail] = useState<string>('');
  const [exportLoading, setExportLoading] = useState<boolean>(false);
  const [exportError, setExportError] = useState<string>('');
  const [exportSuccess, setExportSuccess] = useState<string>('');
  const [salesReportData, setSalesReportData] = useState<SalesReportData | null>(null);
  const [itemsReportData, setItemsReportData] = useState<ItemsReportData | null>(null);
  const [productsData, setProductsData] = useState<PaginatedProductsData | null>(null);
  const [customerLedgerData, setCustomerLedgerData] = useState<CustomerLedgerReportDTO | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [salesCurrentPage, setSalesCurrentPage] = useState<number>(1);
  const [salesPerPage] = useState<number>(10);
  const [paginatedSales, setPaginatedSales] = useState<SaleData[]>([]);
  const [totalSalesPages, setTotalSalesPages] = useState<number>(1);
  const [ledgerCurrentPage, setLedgerCurrentPage] = useState<number>(1);
  const [ledgerPerPage] = useState<number>(10);
  const [paginatedLedger, setPaginatedLedger] = useState<CustomerLedgerEntity[]>([]);
  const [totalLedgerPages, setTotalLedgerPages] = useState<number>(1);
  const [expandedCustomer, setExpandedCustomer] = useState<string | null>(null);

  const { user, accessToken } = useSelector((state: RootStateType) => state.auth);

  useEffect(() => {
    if (!user || !accessToken) {
      navigate('/login');
    }
  }, [user, accessToken, navigate]);

  useEffect(() => {
    const today = new Date();
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(today.getDate() - 30);

    setToDate(today.toISOString().split('T')[0]);
    setFromDate(thirtyDaysAgo.toISOString().split('T')[0]);
  }, []);

  const reportTypes: ReportType[] = [
    { id: 'sales', name: 'Sales Report', icon: DollarSign },
    { id: 'items', name: 'Items Reports', icon: Package },
    { id: 'customer-ledger', name: 'Customer Ledger', icon: Users },
  ];

  const paginateSalesData = (sales: SaleData[], page: number) => {
    const startIndex = (page - 1) * salesPerPage;
    const endIndex = startIndex + salesPerPage;
    const paginatedData = sales.slice(startIndex, endIndex);
    const totalPages = Math.ceil(sales.length / salesPerPage);

    setPaginatedSales(paginatedData);
    setTotalSalesPages(totalPages);
  };

  const paginateLedgerData = (customers: CustomerLedgerEntity[], page: number) => {
    const startIndex = (page - 1) * ledgerPerPage;
    const endIndex = startIndex + ledgerPerPage;
    const paginatedData = customers.slice(startIndex, endIndex);
    const totalPages = Math.ceil(customers.length / ledgerPerPage);

    setPaginatedLedger(paginatedData);
    setTotalLedgerPages(totalPages);
  };

  const fetchSalesReportData = async () => {
    try {
      setLoading(true);
      setError('');

      if (!fromDate || !toDate) {
        setError('Please select both from and to dates');
        return;
      }

      if (new Date(fromDate) > new Date(toDate)) {
        setError('From date cannot be later than to date');
        return;
      }

      const reportResponse = await getSalesReport(fromDate, toDate);
      setSalesReportData(reportResponse.data);

      setSalesCurrentPage(1);
      if (reportResponse.data.sales) {
        paginateSalesData(reportResponse.data.sales, 1);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to fetch sales data');
      console.error('Error fetching sales data:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchItemsReportData = async () => {
    try {
      setLoading(true);
      setError('');

      const reportResponse = await getItemsReport();
      setItemsReportData(reportResponse.data);

      const productsResponse = await getProducts(currentPage, 10, searchTerm);
      setProductsData(productsResponse.data);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch items data');
      console.error('Error fetching items data:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchCustomerLedgerData = async () => {
    try {
      setLoading(true);
      setError('');

      if (!fromDate || !toDate) {
        setError('Please select both from and to dates');
        return;
      }

      if (new Date(fromDate) > new Date(toDate)) {
        setError('From date cannot be later than to date');
        return;
      }

      const reportResponse = await getCustomerLedger(fromDate, toDate);
      if (!reportResponse.data || !reportResponse.data.customers) {
        throw new Error('Invalid response structure: customers data missing');
      }

      setCustomerLedgerData(reportResponse.data);
      setLedgerCurrentPage(1);
      if (reportResponse.data.customers) {
        paginateLedgerData(reportResponse.data.customers, 1);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to fetch customer ledger data');
      console.error('Error fetching customer ledger data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleExportReport = async () => {
    setExportLoading(true);
    setExportError('');
    setExportSuccess('');

    try {
      if ((selectedReport === 'sales' || selectedReport === 'customer-ledger') && (!fromDate || !toDate)) {
        setExportError('Please select both from and to dates for this report type');
        setExportLoading(false);
        return;
      }

      if (exportFormat === 'email' && !exportEmail) {
        setExportError('Email address is required for email export');
        setExportLoading(false);
        return;
      }

      if (exportFormat === 'email' && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(exportEmail)) {
        setExportError('Invalid email address');
        setExportLoading(false);
        return;
      }

      const response = await exportReport(
        selectedReport as 'sales' | 'items' | 'customer-ledger',
        exportFormat,
        fromDate,
        toDate,
        exportEmail
      );

      if (exportFormat === 'email') {
        setExportSuccess(`Report sent to ${exportEmail}`);
        setExportLoading(false);
        return;
      }

      // Handle binary file download
      const mimeTypes: Record<string, string> = {
        print: 'text/html',
        excel: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        pdf: 'application/pdf',
      };

      const extensions: Record<string, string> = {
        print: 'html',
        excel: 'xlsx',
        pdf: 'pdf',
      };

      const formattedDate = new Date().toISOString().split('T')[0].replace(/-/g, '');
      const filename = `${selectedReport}_Report_${formattedDate}.${extensions[exportFormat]}`;

      // Create blob from ArrayBuffer
      const blob = new Blob([response.content], { type: mimeTypes[exportFormat] });
      saveAs(blob, filename);
      setExportSuccess('Report downloaded successfully');

    } catch (err: any) {
      setExportError(err.message || 'Failed to export report');
      console.error('Error exporting report:', err);
    } finally {
      setExportLoading(false);
    }
  };

  useEffect(() => {
    if (selectedReport === 'sales' && fromDate && toDate) {
      fetchSalesReportData();
    } else if (selectedReport === 'items') {
      setCurrentPage(1);
      fetchItemsReportData();
    } else if (selectedReport === 'customer-ledger' && fromDate && toDate) {
      fetchCustomerLedgerData();
    }
  }, [selectedReport, fromDate, toDate]);

  useEffect(() => {
    if (selectedReport === 'items') {
      fetchProductsData();
    }
  }, [currentPage, searchTerm]);

  useEffect(() => {
    if (salesReportData?.sales) {
      paginateSalesData(salesReportData.sales, salesCurrentPage);
    }
  }, [salesCurrentPage, salesReportData?.sales]);

  useEffect(() => {
    if (customerLedgerData?.customers) {
      paginateLedgerData(customerLedgerData.customers, ledgerCurrentPage);
    }
  }, [ledgerCurrentPage, customerLedgerData?.customers]);

  const fetchProductsData = async () => {
    try {
      setLoading(true);
      const productsResponse = await getProducts(currentPage, 10, searchTerm);
      setProductsData(productsResponse.data);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch products data');
      console.error('Error fetching products data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleReportChange = (e: React.ChangeEvent<HTMLSelectElement>): void => {
    setSelectedReport(e.target.value);
    setError('');
    setExportError('');
    setExportSuccess('');
    setCurrentPage(1);
    setSearchTerm('');
    setSalesCurrentPage(1);
    setLedgerCurrentPage(1);
    setExpandedCustomer(null);
  };

  const handleFromDateChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    setFromDate(e.target.value);
    setExportError('');
    setExportSuccess('');
  };

  const handleToDateChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    setToDate(e.target.value);
    setExportError('');
    setExportSuccess('');
  };

  const handleExportFormatChange = (e: React.ChangeEvent<HTMLSelectElement>): void => {
    setExportFormat(e.target.value as 'print' | 'excel' | 'pdf' | 'email');
    setExportError('');
    setExportSuccess('');
  };

  const handleExportEmailChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    setExportEmail(e.target.value);
    setExportError('');
    setExportSuccess('');
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    setSearchTerm(e.target.value);
    setCurrentPage(1);
  };

  const handlePageChange = (page: number): void => {
    setCurrentPage(page);
  };

  const handleSalesPageChange = (page: number): void => {
    setSalesCurrentPage(page);
  };

  const handleLedgerPageChange = (page: number): void => {
    setLedgerCurrentPage(page);
  };

  const toggleExpanded = (customerId: string) => {
    setExpandedCustomer(expandedCustomer === customerId ? null : customerId);
  };

  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString();
  };

  const shouldShowDateFilter = selectedReport === 'sales' || selectedReport === 'customer-ledger';

  const Pagination: React.FC<{ currentPage: number; totalPages: number; onPageChange: (page: number) => void }> = ({
    currentPage,
    totalPages,
    onPageChange,
  }) => {
    return (
      <div className="flex items-center justify-between mt-6">
        <div className="text-gray-400 text-sm">
          Page {currentPage} of {totalPages}
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={() => onPageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className="p-2 rounded-lg bg-gray-800 text-gray-400 hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
            const pageNum = Math.max(1, Math.min(totalPages - 4, currentPage - 2)) + i;
            if (pageNum > totalPages) return null;

            return (
              <button
                key={pageNum}
                onClick={() => onPageChange(pageNum)}
                className={`px-3 py-2 rounded-lg text-sm ${pageNum === currentPage
                  ? 'bg-red-600 text-white'
                  : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                  }`}
              >
                {pageNum}
              </button>
            );
          })}
          <button
            onClick={() => onPageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="p-2 rounded-lg bg-gray-800 text-gray-400 hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-900">
      <Navbar />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">Reports & Analytics</h1>
            <p className="text-gray-400">Analyze your business performance and trends</p>
          </div>
        </div>

        <div className="bg-black border border-red-600/20 rounded-lg p-6 mb-8">
          <h3 className="text-xl font-semibold text-white mb-4">Report Options</h3>
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1">
              <label className="block text-gray-400 text-sm font-medium mb-2">Report Type</label>
              <select
                value={selectedReport}
                onChange={handleReportChange}
                className="w-full bg-gray-800 border border-gray-600 rounded-lg px-4 py-2 text-white focus:border-red-600 focus:outline-none"
              >
                {reportTypes.map((type) => (
                  <option key={type.id} value={type.id}>
                    {type.name}
                  </option>
                ))}
              </select>
            </div>
            {shouldShowDateFilter && (
              <>
                <div className="flex-1">
                  <label className="block text-gray-400 text-sm font-medium mb-2">From Date</label>
                  <input
                    type="date"
                    value={fromDate}
                    onChange={handleFromDateChange}
                    className="w-full bg-gray-800 border border-gray-600 rounded-lg px-4 py-2 text-white focus:border-red-600 focus:outline-none"
                  />
                </div>
                <div className="flex-1">
                  <label className="block text-gray-400 text-sm font-medium mb-2">To Date</label>
                  <input
                    type="date"
                    value={toDate}
                    onChange={handleToDateChange}
                    className="w-full bg-gray-800 border border-gray-600 rounded-lg px-4 py-2 text-white focus:border-red-600 focus:outline-none"
                  />
                </div>
              </>
            )}
            {selectedReport === 'items' && (
              <div className="flex-1">
                <label className="block text-gray-400 text-sm font-medium mb-2">Search Products</label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={handleSearchChange}
                    placeholder="Search by product name..."
                    className="w-full bg-gray-800 border border-gray-600 rounded-lg pl-10 pr-4 py-2 text-white focus:border-red-600 focus:outline-none"
                  />
                </div>
              </div>
            )}
          </div>
          {shouldShowDateFilter && fromDate && toDate && new Date(fromDate) > new Date(toDate) && (
            <div className="mt-3 text-red-400 text-sm flex items-center">
              <AlertTriangle className="h-4 w-4 mr-1" />
              From date cannot be later than to date
            </div>
          )}
        </div>

        <div className="bg-black border border-red-600/20 rounded-lg p-6 mb-8">
          <h3 className="text-xl font-semibold text-white mb-4">Export Report</h3>
          {exportError && (
            <div className="bg-red-900/20 border border-red-600/50 rounded-lg p-4 mb-4">
              <div className="flex items-center">
                <AlertTriangle className="h-5 w-5 text-red-400 mr-2" />
                <span className="text-red-400">{exportError}</span>
              </div>
            </div>
          )}
          {exportSuccess && (
            <div className="bg-green-900/20 border border-green-600/50 rounded-lg p-4 mb-4">
              <div className="flex items-center">
                <Mail className="h-5 w-5 text-green-400 mr-2" />
                <span className="text-green-400">{exportSuccess}</span>
              </div>
            </div>
          )}
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1">
              <label className="block text-gray-400 text-sm font-medium mb-2">Export Format</label>
              <select
                value={exportFormat}
                onChange={handleExportFormatChange}
                className="w-full bg-gray-800 border border-gray-600 rounded-lg px-4 py-2 text-white focus:border-red-600 focus:outline-none"
              >
                <option value="print">Print (HTML)</option>
                <option value="excel">Excel</option>
                <option value="pdf">PDF</option>
                <option value="email">Email</option>
              </select>
            </div>
            {exportFormat === 'email' && (
              <div className="flex-1">
                <label className="block text-gray-400 text-sm font-medium mb-2">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="email"
                    value={exportEmail}
                    onChange={handleExportEmailChange}
                    placeholder="Enter email address..."
                    className="w-full bg-gray-800 border border-gray-600 rounded-lg pl-10 pr-4 py-2 text-white focus:border-red-600 focus:outline-none"
                  />
                </div>
              </div>
            )}
            <div className="flex items-end">
              <button
                onClick={handleExportReport}
                disabled={exportLoading}
                className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors font-medium flex items-center disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {exportLoading ? (
                  <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                ) : (
                  <Download className="h-5 w-5 mr-2" />
                )}
                Export Report
              </button>
            </div>
          </div>
        </div>

        {loading && (
          <div className="flex justify-center items-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-red-600" />
            <span className="text-white ml-2">Loading data...</span>
          </div>
        )}

        {error && (
          <div className="bg-red-900/20 border border-red-600/50 rounded-lg p-4 mb-8">
            <div className="flex items-center">
              <AlertTriangle className="h-5 w-5 text-red-400 mr-2" />
              <span className="text-red-400">{error}</span>
            </div>
          </div>
        )}

        {selectedReport === 'sales' && !loading && salesReportData && (
          <>
            <div className="bg-black border border-red-600/20 rounded-lg p-4 mb-6">
              <div className="flex items-center text-gray-300">
                <Calendar className="h-5 w-5 mr-2 text-red-600" />
                <span>Report Period: </span>
                <span className="text-white font-medium ml-1">
                  {formatDate(fromDate)} - {formatDate(toDate)}
                </span>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <div className="bg-black border border-red-600/20 rounded-lg p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-400 text-sm font-medium">Total Revenue</p>
                    <p className="text-white text-2xl font-bold mt-1">
                      {formatCurrency(salesReportData.totalRevenue)}
                    </p>
                  </div>
                  <div className="bg-red-600/10 p-3 rounded-lg">
                    <DollarSign className="h-6 w-6 text-red-600" />
                  </div>
                </div>
              </div>
              <div className="bg-black border border-red-600/20 rounded-lg p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-400 text-sm font-medium">Total Sales</p>
                    <p className="text-white text-2xl font-bold mt-1">{salesReportData.totalSales}</p>
                  </div>
                  <div className="bg-red-600/10 p-3 rounded-lg">
                    <ShoppingCart className="h-6 w-6 text-red-600" />
                  </div>
                </div>
              </div>
              <div className="bg-black border border-red-600/20 rounded-lg p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-400 text-sm font-medium">Total Quantity</p>
                    <p className="text-white text-2xl font-bold mt-1">{salesReportData.totalQuantity}</p>
                  </div>
                  <div className="bg-red-600/10 p-3 rounded-lg">
                    <Package className="h-6 w-6 text-red-600" />
                  </div>
                </div>
              </div>
              <div className="bg-black border border-red-600/20 rounded-lg p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-400 text-sm font-medium">Unique Customers</p>
                    <p className="text-white text-2xl font-bold mt-1">{salesReportData.uniqueCustomers}</p>
                  </div>
                  <div className="bg-red-600/10 p-3 rounded-lg">
                    <Users className="h-6 w-6 text-red-600" />
                  </div>
                </div>
              </div>
            </div>
            {salesReportData.topSellingProduct && (
              <div className="bg-black border border-red-600/20 rounded-lg p-6 mb-8">
                <h3 className="text-xl font-semibold text-white mb-2">Top Selling Product</h3>
                <p className="text-green-400 text-lg font-medium">{salesReportData.topSellingProduct}</p>
              </div>
            )}
            {salesReportData.sales && salesReportData.sales.length > 0 && (
              <div className="bg-black border border-red-600/20 rounded-lg p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-semibold text-white">Sales Transactions</h3>
                  <div className="text-gray-400 text-sm">
                    Total: {salesReportData.sales.length} transactions
                  </div>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-gray-800">
                        <th className="text-left text-gray-400 py-3 px-4">Product Name</th>
                        <th className="text-left text-gray-400 py-3 px-4">Customer</th>
                        <th className="text-left text-gray-400 py-3 px-4">Quantity</th>
                        <th className="text-left text-gray-400 py-3 px-4">Total Price</th>
                        <th className="text-left text-gray-400 py-3 px-4">Sale Date</th>
                      </tr>
                    </thead>
                    <tbody>
                      {paginatedSales.map((sale) => (
                        <tr key={sale.id} className="border-b border-gray-800/50">
                          <td className="text-white py-3 px-4 font-medium">{sale.productName}</td>
                          <td className="text-gray-300 py-3 px-4">{sale.customerName}</td>
                          <td className="text-gray-300 py-3 px-4">{sale.quantity}</td>
                          <td className="text-green-400 py-3 px-4 font-semibold">
                            {formatCurrency(sale.totalPrice)}
                          </td>
                          <td className="text-gray-300 py-3 px-4">{formatDate(sale.saleDate)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                {totalSalesPages > 1 && (
                  <Pagination
                    currentPage={salesCurrentPage}
                    totalPages={totalSalesPages}
                    onPageChange={handleSalesPageChange}
                  />
                )}
              </div>
            )}
            {salesReportData.sales && salesReportData.sales.length === 0 && (
              <div className="bg-black border border-red-600/20 rounded-lg p-12">
                <div className="text-center">
                  <ShoppingCart className="h-16 w-16 text-red-600 mx-auto mb-4" />
                  <h3 className="text-2xl font-semibold text-white mb-2">No Sales Transactions</h3>
                  <p className="text-gray-400">
                    No sales transactions found for the selected date range.
                  </p>
                </div>
              </div>
            )}
          </>
        )}

        {selectedReport === 'items' && !loading && itemsReportData && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <div className="bg-black border border-red-600/20 rounded-lg p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-400 text-sm font-medium">Total Products</p>
                    <p className="text-white text-2xl font-bold mt-1">{itemsReportData.totalProducts}</p>
                  </div>
                  <div className="bg-red-600/10 p-3 rounded-lg">
                    <Package2 className="h-6 w-6 text-red-600" />
                  </div>
                </div>
              </div>
              <div className="bg-black border border-red-600/20 rounded-lg p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-400 text-sm font-medium">Total Stock</p>
                    <p className="text-white text-2xl font-bold mt-1">{itemsReportData.totalStock}</p>
                  </div>
                  <div className="bg-red-600/10 p-3 rounded-lg">
                    <Package className="h-6 w-6 text-red-600" />
                  </div>
                </div>
              </div>
              <div className="bg-black border border-red-600/20 rounded-lg p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-400 text-sm font-medium">Inventory Value</p>
                    <p className="text-white text-2xl font-bold mt-1">
                      {formatCurrency(itemsReportData.totalInventoryValue)}
                    </p>
                  </div>
                  <div className="bg-red-600/10 p-3 rounded-lg">
                    <DollarSign className="h-6 w-6 text-red-600" />
                  </div>
                </div>
              </div>
              <div className="bg-black border border-red-600/20 rounded-lg p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-400 text-sm font-medium">Low Stock Items</p>
                    <p className="text-white text-2xl font-bold mt-1">{itemsReportData.lowStockCount}</p>
                  </div>
                  <div className="bg-red-600/10 p-3 rounded-lg">
                    <TrendingDown className="h-6 w-6 text-red-600" />
                  </div>
                </div>
              </div>
            </div>
            {productsData && (
              <div className="bg-black border border-red-600/20 rounded-lg p-6">
                <h3 className="text-xl font-semibold text-white mb-4">Product Inventory</h3>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-gray-800">
                        <th className="text-left text-gray-400 py-3 px-4">Product Name</th>
                        <th className="text-left text-gray-400 py-3 px-4">Price</th>
                        <th className="text-left text-gray-400 py-3 px-4">Stock</th>
                        <th className="text-left text-gray-400 py-3 px-4">Stock Value</th>
                        <th className="text-left text-gray-400 py-3 px-4">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {productsData.data.map((product) => (
                        <tr key={product.id} className="border-b border-gray-800/50">
                          <td className="text-white py-3 px-4 font-medium">{product.name}</td>
                          <td className="text-green-400 py-3 px-4 font-semibold">
                            {formatCurrency(product.price)}
                          </td>
                          <td className="text-gray-300 py-3 px-4">{product.stock}</td>
                          <td className="text-green-400 py-3 px-4 font-semibold">
                            {formatCurrency(product.price * product.stock)}
                          </td>
                          <td className="py-3 px-4">
                            <span
                              className={`px-2 py-1 rounded-full text-xs font-medium ${product.stock < 5
                                ? 'bg-red-900/20 text-red-400 border border-red-600/50'
                                : product.stock < 20
                                  ? 'bg-yellow-900/20 text-yellow-400 border border-yellow-600/50'
                                  : 'bg-green-900/20 text-green-400 border border-green-600/50'
                                }`}
                            >
                              {product.stock < 5 ? 'Low Stock' : product.stock < 20 ? 'Medium Stock' : 'In Stock'}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                {productsData.totalPages > 1 && (
                  <Pagination
                    currentPage={productsData.currentPage}
                    totalPages={productsData.totalPages}
                    onPageChange={handlePageChange}
                  />
                )}
              </div>
            )}
            {productsData && productsData.data.length === 0 && (
              <div className="bg-black border border-red-600/20 rounded-lg p-12">
                <div className="text-center">
                  <Package className="h-16 w-16 text-red-600 mx-auto mb-4" />
                  <h3 className="text-2xl font-semibold text-white mb-2">No Products Found</h3>
                  <p className="text-gray-400">
                    {searchTerm ? `No products found matching "${searchTerm}"` : 'No products available in inventory'}
                  </p>
                </div>
              </div>
            )}
          </>
        )}

        {selectedReport === 'customer-ledger' && !loading && customerLedgerData && (
          <>
            <div className="bg-black border border-red-600/20 rounded-lg p-4 mb-6">
              <div className="flex items-center text-gray-300">
                <Calendar className="h-5 w-5 mr-2 text-red-600" />
                <span>Report Period: </span>
                <span className="text-white font-medium ml-1">
                  {formatDate(fromDate)} - {formatDate(toDate)}
                </span>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <div className="bg-black border border-red-600/20 rounded-lg p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-400 text-sm font-medium">Total Customers</p>
                    <p className="text-white text-2xl font-bold mt-1">{customerLedgerData.summary.totalCustomers}</p>
                  </div>
                  <div className="bg-red-600/10 p-3 rounded-lg">
                    <Users className="h-6 w-6 text-red-600" />
                  </div>
                </div>
              </div>
              <div className="bg-black border border-red-600/20 rounded-lg p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-400 text-sm font-medium">Total Revenue</p>
                    <p className="text-white text-2xl font-bold mt-1">
                      {formatCurrency(customerLedgerData.summary.totalRevenue)}
                    </p>
                  </div>
                  <div className="bg-red-600/10 p-3 rounded-lg">
                    <DollarSign className="h-6 w-6 text-red-600" />
                  </div>
                </div>
              </div>
              <div className="bg-black border border-red-600/20 rounded-lg p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-400 text-sm font-medium">Total Transactions</p>
                    <p className="text-white text-2xl font-bold mt-1">{customerLedgerData.summary.totalTransactions}</p>
                  </div>
                  <div className="bg-red-600/10 p-3 rounded-lg">
                    <ShoppingCart className="h-6 w-6 text-red-600" />
                  </div>
                </div>
              </div>
              <div className="bg-black border border-red-600/20 rounded-lg p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-400 text-sm font-medium">Avg. Customer Value</p>
                    <p className="text-white text-2xl font-bold mt-1">
                      {formatCurrency(customerLedgerData.summary.averageCustomerValue)}
                    </p>
                  </div>
                  <div className="bg-red-600/10 p-3 rounded-lg">
                    <BarChart3 className="h-6 w-6 text-red-600" />
                  </div>
                </div>
              </div>
            </div>
            {customerLedgerData.summary.topCustomer && (
              <div className="bg-black border border-red-600/20 rounded-lg p-6 mb-8">
                <h3 className="text-xl font-semibold text-white mb-2">Top Customer</h3>
                <p className="text-green-400 text-lg font-medium">{customerLedgerData.summary.topCustomer}</p>
              </div>
            )}
            {customerLedgerData.customers && customerLedgerData.customers.length > 0 && (
              <div className="bg-black border border-red-600/20 rounded-lg p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-semibold text-white">Customer Ledger</h3>
                  <div className="text-gray-400 text-sm">
                    Total: {customerLedgerData.customers.length} customers
                  </div>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-gray-800">
                        <th className="text-left text-gray-400 py-3 px-4">Customer Name</th>
                        <th className="text-left text-gray-400 py-3 px-4">Email</th>
                        <th className="text-left text-gray-400 py-3 px-4">Total Purchases</th>
                        <th className="text-left text-gray-400 py-3 px-4">Total Amount</th>
                        <th className="text-left text-gray-400 py-3 px-4">Avg. Order Value</th>
                        <th className="text-left text-gray-400 py-3 px-4">Last Purchase</th>
                      </tr>
                    </thead>
                    <tbody>
                      {paginatedLedger.map((customer) => (
                        <React.Fragment key={customer.customerId}>
                          <tr
                            className="border-b border-gray-800/50 cursor-pointer"
                            onClick={() => toggleExpanded(customer.customerId)}
                          >
                            <td className="text-white py-3 px-4 font-medium">{customer.customerName}</td>
                            <td className="text-gray-300 py-3 px-4">{customer.email}</td>
                            <td className="text-gray-300 py-3 px-4">{customer.totalPurchases}</td>
                            <td className="text-green-400 py-3 px-4 font-semibold">
                              {formatCurrency(customer.totalAmount)}
                            </td>
                            <td className="text-green-400 py-3 px-4 font-semibold">
                              {formatCurrency(customer.averageOrderValue)}
                            </td>
                            <td className="text-gray-300 py-3 px-4">{formatDate(customer.lastPurchase)}</td>
                          </tr>
                          {expandedCustomer === customer.customerId && (
                            <tr>
                              <td colSpan={6} className="py-3 px-4">
                                <div className="bg-gray-800 rounded-lg p-4">
                                  <h4 className="text-white font-semibold mb-2">Transactions</h4>
                                  {customer.transactions && customer.transactions.length > 0 ? (
                                    <table className="w-full">
                                      <thead>
                                        <tr className="border-b border-gray-700">
                                          <th className="text-left text-gray-400 py-2 px-3">Product Name</th>
                                          <th className="text-left text-gray-400 py-2 px-3">Quantity</th>
                                          <th className="text-left text-gray-400 py-2 px-3">Total Price</th>
                                          <th className="text-left text-gray-400 py-2 px-3">Sale Date</th>
                                        </tr>
                                      </thead>
                                      <tbody>
                                        {customer.transactions.map((tx, index) => (
                                          <tr key={index} className="border-b border-gray-700/50">
                                            <td className="text-white py-2 px-3">{tx.productName}</td>
                                            <td className="text-gray-300 py-2 px-3">{tx.quantity}</td>
                                            <td className="text-green-400 py-2 px-3">{formatCurrency(tx.totalPrice)}</td>
                                            <td className="text-gray-300 py-2 px-3">{formatDate(tx.saleDate)}</td>
                                          </tr>
                                        ))}
                                      </tbody>
                                    </table>
                                  ) : (
                                    <p className="text-gray-400">No transactions available for this customer.</p>
                                  )}
                                </div>
                              </td>
                            </tr>
                          )}
                        </React.Fragment>
                      ))}
                    </tbody>
                  </table>
                </div>
                {totalLedgerPages > 1 && (
                  <Pagination
                    currentPage={ledgerCurrentPage}
                    totalPages={totalLedgerPages}
                    onPageChange={handleLedgerPageChange}
                  />
                )}
              </div>
            )}
            {customerLedgerData.customers && customerLedgerData.customers.length === 0 && (
              <div className="bg-black border border-red-600/20 rounded-lg p-12">
                <div className="text-center">
                  <Users className="h-16 w-16 text-red-600 mx-auto mb-4" />
                  <h3 className="text-2xl font-semibold text-white mb-2">No Customer Data</h3>
                  <p className="text-gray-400">
                    No customer transactions found for the selected date range.
                  </p>
                </div>
              </div>
            )}
          </>
        )}

        {selectedReport === 'sales' && !loading && salesReportData && salesReportData.totalSales === 0 && (
          <div className="bg-black border border-red-600/20 rounded-lg p-12">
            <div className="text-center">
              <BarChart3 className="h-16 w-16 text-red-600 mx-auto mb-4" />
              <h3 className="text-2xl font-semibold text-white mb-2">No Sales Data</h3>
              <p className="text-gray-400">
                No sales found for the selected date range. Try selecting a different period.
              </p>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default ReportsPage;