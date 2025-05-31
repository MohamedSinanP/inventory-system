import { format } from 'date-fns';
import ISaleRepository from "../interfaces/repositories/sale.repository";
import IProductService from "../interfaces/services/product.service";
import { IReportExportService } from "../interfaces/services/report.export.service";
import ISaleService from "../interfaces/services/sale.service";
import saleRepsitory from "../repositories/sale.repsitory";
import { ExportRequest, ItemsReportExportData, CustomerLedgerEntity, CustomerLedgerReportDTO } from "../types/user";
import { sendReportEmail } from "../utils/emailUtils";
import { generateExcel, generateHTML, generatePDF } from "../utils/exportUtils";
import productService from "./product.service";
import saleService from "./sale.service";

class ReportExportService implements IReportExportService {
  constructor(
    private salesRepository: ISaleRepository,
    private productService: IProductService,
    private salesService: ISaleService
  ) { };

  async exportReport(
    userId: string,
    request: ExportRequest
  ): Promise<{ content: Buffer | string; filename: string; mimeType: string }> {
    const { reportType, format: exportFormat, fromDate, toDate } = request;
    const formattedDate = format(new Date(), 'yyyyMMdd');
    let filename = '';
    let mimeType = '';
    let content: Buffer | string;

    switch (reportType) {
      case 'sales': {
        if (!fromDate || !toDate) throw new Error('Date range required for sales report');
        const reportData = await this.salesService.getSalesReport(
          userId,
          new Date(fromDate),
          new Date(toDate)
        );
        filename = `SalesReport_${formattedDate}`;
        switch (exportFormat) {
          case 'print':
            content = generateHTML(reportType, reportData, fromDate, toDate);
            mimeType = 'text/html';
            filename += '.html';
            break;
          case 'excel':
            content = await generateExcel(reportType, reportData, fromDate, toDate);
            mimeType = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
            filename += '.xlsx';
            break;
          case 'pdf':
            content = await generatePDF(reportType, reportData, fromDate, toDate);
            mimeType = 'application/pdf';
            filename += '.pdf';
            break;
          case 'email':
            const excelContent = await generateExcel(reportType, reportData, fromDate, toDate);
            await sendReportEmail(userId, request, excelContent, `${filename}.xlsx`);
            return {
              content: '',
              filename: '',
              mimeType: 'text/plain',
            };
          default:
            throw new Error('Invalid export format');
        }
        break;
      }
      case 'items': {
        const reportData = await this.productService.getItemsReport(userId);
        const products = await this.productService.getAllProducts(userId) || [];
        const exportData: ItemsReportExportData = { report: reportData, products };
        filename = `ItemsReport_${formattedDate}`;
        switch (exportFormat) {
          case 'print':
            content = generateHTML(reportType, exportData);
            mimeType = 'text/html';
            filename += '.html';
            break;
          case 'excel':
            content = await generateExcel(reportType, exportData);
            mimeType = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
            filename += '.xlsx';
            break;
          case 'pdf':
            content = await generatePDF(reportType, exportData);
            mimeType = 'application/pdf';
            filename += '.pdf';
            break;
          case 'email':
            const excelContent = await generateExcel(reportType, exportData);
            await sendReportEmail(userId, request, excelContent, `${filename}.xlsx`);
            return {
              content: '',
              filename: '',
              mimeType: 'text/plain',
            };
          default:
            throw new Error('Invalid export format');
        }
        break;
      }
      case 'customer-ledger': {
        if (!fromDate || !toDate) throw new Error('Date range required for customer ledger');
        const ledgerEntries: CustomerLedgerEntity[] = await this.salesRepository.getCustomerLedger(
          userId,
          new Date(fromDate),
          new Date(toDate)
        );

        // Create proper CustomerLedgerReportDTO structure
        const customerLedgerDTO: CustomerLedgerReportDTO = {
          summary: {
            totalCustomers: ledgerEntries.length,
            totalRevenue: ledgerEntries.reduce((sum, entry) => sum + entry.totalAmount, 0),
            totalTransactions: ledgerEntries.reduce((sum, entry) => sum + entry.totalPurchases, 0),
            averageCustomerValue: ledgerEntries.length > 0
              ? ledgerEntries.reduce((sum, entry) => sum + entry.totalAmount, 0) / ledgerEntries.length
              : 0,
            topCustomer: ledgerEntries.length > 0
              ? ledgerEntries.reduce((prev, current) =>
                prev.totalAmount > current.totalAmount ? prev : current
              ).customerName
              : null
          },
          customers: ledgerEntries.map(entry => ({
            customerId: entry.customerId,
            customerName: entry.customerName,
            email: entry.email,
            phoneNumber: entry.phoneNumber,
            address: entry.address,
            totalPurchases: entry.totalPurchases,
            totalAmount: entry.totalAmount,
            totalQuantity: entry.totalQuantity,
            firstPurchase: entry.firstPurchase,
            lastPurchase: entry.lastPurchase,
            averageOrderValue: entry.averageOrderValue,
            transactions: entry.transactions
          }))
        };

        filename = `CustomerLedger_${formattedDate}`;
        switch (exportFormat) {
          case 'print':
            content = generateHTML(reportType, customerLedgerDTO, fromDate, toDate);
            mimeType = 'text/html';
            filename += '.html';
            break;
          case 'excel':
            content = await generateExcel(reportType, customerLedgerDTO, fromDate, toDate);
            mimeType = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
            filename += '.xlsx';
            break;
          case 'pdf':
            content = await generatePDF(reportType, customerLedgerDTO, fromDate, toDate);
            mimeType = 'application/pdf';
            filename += '.pdf';
            break;
          case 'email':
            const excelContent = await generateExcel(reportType, customerLedgerDTO, fromDate, toDate);
            await sendReportEmail(userId, request, excelContent, `${filename}.xlsx`);
            return {
              content: '',
              filename: '',
              mimeType: 'text/plain',
            };
          default:
            throw new Error('Invalid export format');
        }
        break;
      }
      default:
        throw new Error('Invalid report type');
    }

    return { content, filename, mimeType };
  }
}

export default new ReportExportService(saleRepsitory, productService, saleService);