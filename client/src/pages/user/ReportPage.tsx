import React, { useEffect, useState } from 'react';
import {
  BarChart3,
  Package,
  DollarSign,
  TrendingUp,
  Download,
  User,
  Calendar,
  CreditCard,
  ShoppingCart,
  AlertTriangle,
  Users,
  Loader2
} from 'lucide-react';
import Navbar from '../../components/Navbar';
import { useNavigate } from 'react-router-dom';
import type { RootStateType } from '../../redux/store';
import { useSelector } from 'react-redux';
import { getSalesReport, getSales } from '../../apis/userApis';

interface ReportType {
  id: string;
  name: string;
  icon: React.ComponentType<any>;
}

interface SalesReportData {
  totalSales: number;
  totalRevenue: number;
  totalQuantity: number;
  topSellingProduct: string | null;
  uniqueCustomers: number;
}

interface SaleData {
  id: string;
  productName: string;
  quantity: number;
  totalPrice: number;
  customerName: string;
  saleDate: string;
}

interface PaginatedSalesData {
  data: SaleData[];
  totalPages: number;
  currentPage: number;
}

const ReportsPage: React.FC = () => {
  const navigate = useNavigate();
  const [selectedReport, setSelectedReport] = useState<string>('sales');
  const [dateRange, setDateRange] = useState<string>('30');
  const [salesReportData, setSalesReportData] = useState<SalesReportData | null>(null);
  const [salesData, setSalesData] = useState<PaginatedSalesData | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  const { user, accessToken } = useSelector((state: RootStateType) => state.auth);

  useEffect(() => {
    if (!user || !accessToken) {
      navigate('/login');
    }
  }, [user, accessToken, navigate]);

  const reportTypes: ReportType[] = [
    { id: 'sales', name: 'Sales Report', icon: DollarSign },
    { id: 'items', name: 'Items Reports', icon: Package },
    { id: 'customer-ledger', name: 'Customer Ledger', icon: Users }
  ];

  // Calculate date range
  const getDateRange = (days: string) => {
    const to = new Date();
    const from = new Date();
    from.setDate(to.getDate() - parseInt(days));
    return { from: from.toISOString().split('T')[0], to: to.toISOString().split('T')[0] };
  };

  // Fetch sales report data
  const fetchSalesReportData = async () => {
    try {
      setLoading(true);
      setError('');

      const { from, to } = getDateRange(dateRange);

      // Fetch sales report
      const reportResponse = await getSalesReport(from, to);
      setSalesReportData(reportResponse.data);

      // Fetch recent sales (first page, 10 items, no search)
      const salesResponse = await getSales(1, 10, '');
      setSalesData(salesResponse.data);

    } catch (err: any) {
      setError(err.message || 'Failed to fetch sales data');
      console.error('Error fetching sales data:', err);
    } finally {
      setLoading(false);
    }
  };

  // Fetch data when component mounts or date range changes
  useEffect(() => {
    if (selectedReport === 'sales') {
      fetchSalesReportData();
    }
  }, [selectedReport, dateRange]);

  const generateReport = (): void => {
    const reportName = reportTypes.find(r => r.id === selectedReport)?.name;
    alert(`Generating ${reportName} for the last ${dateRange} days...`);
  };

  const handleReportChange = (e: React.ChangeEvent<HTMLSelectElement>): void => {
    setSelectedReport(e.target.value);
  };

  const handleDateRangeChange = (e: React.ChangeEvent<HTMLSelectElement>): void => {
    setDateRange(e.target.value);
  };

  // Format currency
  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  // Format date
  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString();
  };

  return (
    <div className="min-h-screen bg-gray-900">
      <Navbar />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">Reports & Analytics</h1>
            <p className="text-gray-400">Analyze your business performance and trends</p>
          </div>
          <button
            onClick={generateReport}
            className="mt-4 sm:mt-0 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors font-medium flex items-center"
          >
            <Download className="h-5 w-5 mr-2" />
            Export Report
          </button>
        </div>

        {/* Report Controls */}
        <div className="bg-black border border-red-600/20 rounded-lg p-6 mb-8">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1">
              <label className="block text-gray-400 text-sm font-medium mb-2">Report Type</label>
              <select
                value={selectedReport}
                onChange={handleReportChange}
                className="w-full bg-gray-800 border border-gray-600 rounded-lg px-4 py-2 text-white focus:border-red-600 focus:outline-none"
              >
                {reportTypes.map(type => (
                  <option key={type.id} value={type.id}>{type.name}</option>
                ))}
              </select>
            </div>

            <div className="flex-1">
              <label className="block text-gray-400 text-sm font-medium mb-2">Date Range</label>
              <select
                value={dateRange}
                onChange={handleDateRangeChange}
                className="w-full bg-gray-800 border border-gray-600 rounded-lg px-4 py-2 text-white focus:border-red-600 focus:outline-none"
              >
                <option value="7">Last 7 days</option>
                <option value="30">Last 30 days</option>
                <option value="90">Last 90 days</option>
                <option value="365">Last year</option>
              </select>
            </div>
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="flex justify-center items-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-red-600" />
            <span className="text-white ml-2">Loading sales data...</span>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="bg-red-900/20 border border-red-600/50 rounded-lg p-4 mb-8">
            <div className="flex items-center">
              <AlertTriangle className="h-5 w-5 text-red-400 mr-2" />
              <span className="text-red-400">{error}</span>
            </div>
          </div>
        )}

        {/* Sales Report */}
        {selectedReport === 'sales' && !loading && salesReportData && (
          <>
            {/* Sales Stats Cards */}
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

            {/* Top Selling Product */}
            {salesReportData.topSellingProduct && (
              <div className="bg-black border border-red-600/20 rounded-lg p-6 mb-8">
                <h3 className="text-xl font-semibold text-white mb-2">Top Selling Product</h3>
                <p className="text-green-400 text-lg font-medium">{salesReportData.topSellingProduct}</p>
              </div>
            )}

            {/* Recent Sales */}
            {salesData && (
              <div className="bg-black border border-red-600/20 rounded-lg p-6">
                <h3 className="text-xl font-semibold text-white mb-4">Recent Sales Transactions</h3>
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
                      {salesData.data.map((sale) => (
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

                {/* Pagination info */}
                <div className="mt-4 text-gray-400 text-sm">
                  Showing page {salesData.currentPage} of {salesData.totalPages}
                </div>
              </div>
            )}
          </>
        )}

        {/* No data state */}
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

        {/* Other report types remain the same */}
        {/* Add your items and customer-ledger sections here */}
      </main>
    </div>
  );
};

export default ReportsPage;