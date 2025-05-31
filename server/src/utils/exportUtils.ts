import ExcelJS from 'exceljs';
import PDFKit from 'pdfkit';
import {
  SalesReportDTO,
  ItemsReportExportData,
  CustomerLedgerReportDTO,
} from '../types/user';
import { format } from 'date-fns';

// Helper function to draw table with proper alignment
function drawTable(
  doc: PDFKit.PDFDocument,
  headers: string[],
  rows: string[][],
  startY: number,
  columnWidths: number[],
  startX: number = 50
) {
  const rowHeight = 25;
  const headerHeight = 30;
  let currentY = startY;

  // Calculate total table width
  const totalWidth = columnWidths.reduce((sum, width) => sum + width, 0);

  // Draw header background
  doc.fillColor('#f0f0f0')
    .rect(startX, currentY, totalWidth, headerHeight)
    .fill();

  // Draw header borders
  doc.strokeColor('#000000')
    .lineWidth(1)
    .rect(startX, currentY, totalWidth, headerHeight)
    .stroke();

  // Draw header text
  doc.fillColor('#000000')
    .fontSize(10)
    .font('Helvetica-Bold');

  let currentX = startX;
  headers.forEach((header, index) => {
    // Draw vertical lines between columns
    if (index > 0) {
      doc.moveTo(currentX, currentY)
        .lineTo(currentX, currentY + headerHeight)
        .stroke();
    }

    // Center align header text
    const textWidth = doc.widthOfString(header);
    const centerX = currentX + (columnWidths[index] - textWidth) / 2;
    doc.text(header, centerX, currentY + 8, {
      width: columnWidths[index],
      align: 'center'
    });

    currentX += columnWidths[index];
  });

  currentY += headerHeight;

  // Draw data rows
  doc.font('Helvetica')
    .fontSize(9);

  rows.forEach((row, rowIndex) => {
    // Check if we need a new page
    if (currentY + rowHeight > 750) {
      doc.addPage();
      currentY = 50;

      // Redraw header on new page
      doc.fillColor('#f0f0f0')
        .rect(startX, currentY, totalWidth, headerHeight)
        .fill();

      doc.strokeColor('#000000')
        .rect(startX, currentY, totalWidth, headerHeight)
        .stroke();

      doc.fillColor('#000000')
        .fontSize(10)
        .font('Helvetica-Bold');

      currentX = startX;
      headers.forEach((header, index) => {
        if (index > 0) {
          doc.moveTo(currentX, currentY)
            .lineTo(currentX, currentY + headerHeight)
            .stroke();
        }

        const textWidth = doc.widthOfString(header);
        const centerX = currentX + (columnWidths[index] - textWidth) / 2;
        doc.text(header, centerX, currentY + 8, {
          width: columnWidths[index],
          align: 'center'
        });

        currentX += columnWidths[index];
      });

      currentY += headerHeight;
      doc.font('Helvetica').fontSize(9);
    }

    // Draw row background (alternating colors)
    if (rowIndex % 2 === 1) {
      doc.fillColor('#f9f9f9')
        .rect(startX, currentY, totalWidth, rowHeight)
        .fill();
    }

    // Draw row border
    doc.fillColor('#000000')
      .strokeColor('#cccccc')
      .rect(startX, currentY, totalWidth, rowHeight)
      .stroke();

    // Draw cell data
    currentX = startX;
    row.forEach((cellData, colIndex) => {
      // Draw vertical lines between columns
      if (colIndex > 0) {
        doc.strokeColor('#cccccc')
          .moveTo(currentX, currentY)
          .lineTo(currentX, currentY + rowHeight)
          .stroke();
      }

      // Truncate text if too long
      let displayText = cellData;
      const maxWidth = columnWidths[colIndex] - 10; // 5px padding on each side

      while (doc.widthOfString(displayText) > maxWidth && displayText.length > 0) {
        displayText = displayText.slice(0, -1);
      }
      if (displayText !== cellData && displayText.length > 3) {
        displayText = displayText.slice(0, -3) + '...';
      }

      // Align text based on content type
      let align: 'left' | 'center' | 'right' = 'left';
      if (cellData.startsWith('$') || !isNaN(Number(cellData))) {
        align = 'right';
      }

      doc.text(displayText, currentX + 5, currentY + 8, {
        width: columnWidths[colIndex] - 10,
        align: align
      });

      currentX += columnWidths[colIndex];
    });

    currentY += rowHeight;
  });

  return currentY + 10; // Return next available Y position
}

export function generateHTML(
  reportType: string,
  data: SalesReportDTO | ItemsReportExportData | CustomerLedgerReportDTO,
  fromDate?: string,
  toDate?: string
): string {
  let content = `
    <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; margin: 20px; }
          h1 { color: #333; }
          table { width: 100%; border-collapse: collapse; margin-top: 20px; }
          th, td { border: 1px solid #ccc; padding: 8px; text-align: left; }
          th { background-color: #f4f4f4; }
          .summary { margin-bottom: 20px; }
        </style>
      </head>
      <body>
        <h1>${reportType.replace('-', ' ').toUpperCase()} Report</h1>
        ${fromDate && toDate ? `<p>Period: ${format(new Date(fromDate), 'MM/dd/yyyy')} - ${format(new Date(toDate), 'MM/dd/yyyy')}</p>` : ''}
  `;

  if (reportType === 'sales') {
    const salesData = data as SalesReportDTO;
    content += `
      <div class="summary">
        <p>Total Revenue: $${salesData.totalRevenue.toFixed(2)}</p>
        <p>Total Sales: ${salesData.totalSales}</p>
        <p>Total Quantity: ${salesData.totalQuantity}</p>
        <p>Unique Customers: ${salesData.uniqueCustomers}</p>
        ${salesData.topSellingProduct ? `<p>Top Selling Product: ${salesData.topSellingProduct}</p>` : ''}
      </div>
      <table>
        <tr>
          <th>Product Name</th>
          <th>Customer</th>
          <th>Quantity</th>
          <th>Total Price</th>
          <th>Sale Date</th>
        </tr>
        ${salesData.sales
        .map(
          (sale) => `
              <tr>
                <td>${sale.productName}</td>
                <td>${sale.customerName}</td>
                <td>${sale.quantity}</td>
                <td>$${sale.totalPrice.toFixed(2)}</td>
                <td>${format(new Date(sale.saleDate), 'MM/dd/yyyy')}</td>
              </tr>
            `
        )
        .join('')}
      </table>
    `;
  } else if (reportType === 'items') {
    const itemsData = data as ItemsReportExportData;
    content += `
      <div class="summary">
        <p>Total Products: ${itemsData.report.totalProducts}</p>
        <p>Total Stock: ${itemsData.report.totalStock}</p>
        <p>Inventory Value: $${itemsData.report.totalInventoryValue.toFixed(2)}</p>
        <p>Low Stock Count: ${itemsData.report.lowStockCount}</p>
      </div>
    `;
    if (itemsData.products && itemsData.products.length > 0) {
      content += `
        <table>
          <tr>
            <th>Product Name</th>
            <th>Price</th>
            <th>Stock</th>
            <th>Stock Value</th>
          </tr>
          ${itemsData.products
          .map(
            (product) => `
                <tr>
                  <td>${product.name}</td>
                  <td>$${product.price.toFixed(2)}</td>
                  <td>${product.stock}</td>
                  <td>$${(product.price * product.stock).toFixed(2)}</td>
                </tr>
              `
          )
          .join('')}
        </table>
      `;
    } else {
      content += `<p>No products available.</p>`;
    }
  } else if (reportType === 'customer-ledger') {
    const ledgerData = data as CustomerLedgerReportDTO;
    content += `
      <div class="summary">
        <p>Total Customers: ${ledgerData.summary.totalCustomers}</p>
        <p>Total Revenue: $${ledgerData.summary.totalRevenue.toFixed(2)}</p>
        <p>Total Transactions: ${ledgerData.summary.totalTransactions}</p>
        <p>Average Customer Value: $${ledgerData.summary.averageCustomerValue.toFixed(2)}</p>
        ${ledgerData.summary.topCustomer ? `<p>Top Customer: ${ledgerData.summary.topCustomer}</p>` : ''}
      </div>
      <table>
        <tr>
          <th>Customer Name</th>
          <th>Email</th>
          <th>Total Purchases</th>
          <th>Total Amount</th>
          <th>Avg. Order Value</th>
          <th>Last Purchase</th>
        </tr>
        ${ledgerData.customers
        .map(
          (customer) => `
              <tr>
                <td>${customer.customerName}</td>
                <td>${customer.email}</td>
                <td>${customer.totalPurchases}</td>
                <td>$${customer.totalAmount.toFixed(2)}</td>
                <td>$${customer.averageOrderValue.toFixed(2)}</td>
                <td>${format(new Date(customer.lastPurchase), 'MM/dd/yyyy')}</td>
              </tr>
            `
        )
        .join('')}
      </table>
    `;
  }

  content += `
      </body>
    </html>
  `;
  return content;
}

export async function generateExcel(
  reportType: string,
  data: SalesReportDTO | ItemsReportExportData | CustomerLedgerReportDTO,
  fromDate?: string,
  toDate?: string
): Promise<Buffer> {
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet(reportType.replace('-', ' ').toUpperCase());

  // Add headers
  worksheet.addRow([`${reportType.replace('-', ' ').toUpperCase()} Report`]);
  if (fromDate && toDate) {
    worksheet.addRow([`Period: ${format(new Date(fromDate), 'MM/dd/yyyy')} - ${format(new Date(toDate), 'MM/dd/yyyy')}`]);
  }
  worksheet.addRow([]);

  if (reportType === 'sales') {
    const salesData = data as SalesReportDTO;
    worksheet.addRow(['Summary']);
    worksheet.addRow(['Total Revenue', `$${salesData.totalRevenue.toFixed(2)}`]);
    worksheet.addRow(['Total Sales', salesData.totalSales]);
    worksheet.addRow(['Total Quantity', salesData.totalQuantity]);
    worksheet.addRow(['Unique Customers', salesData.uniqueCustomers]);
    if (salesData.topSellingProduct) {
      worksheet.addRow(['Top Selling Product', salesData.topSellingProduct]);
    }
    worksheet.addRow([]);
    worksheet.addRow(['Transactions']);
    worksheet.addRow(['Product Name', 'Customer', 'Quantity', 'Total Price', 'Sale Date']);
    salesData.sales.forEach((sale) => {
      worksheet.addRow([
        sale.productName,
        sale.customerName,
        sale.quantity,
        `$${sale.totalPrice.toFixed(2)}`,
        format(new Date(sale.saleDate), 'MM/dd/yyyy'),
      ]);
    });
  } else if (reportType === 'items') {
    const itemsData = data as ItemsReportExportData;
    worksheet.addRow(['Summary']);
    worksheet.addRow(['Total Products', itemsData.report.totalProducts]);
    worksheet.addRow(['Total Stock', itemsData.report.totalStock]);
    worksheet.addRow(['Inventory Value', `$${itemsData.report.totalInventoryValue.toFixed(2)}`]);
    worksheet.addRow(['Low Stock Count', itemsData.report.lowStockCount]);
    worksheet.addRow([]);
    if (itemsData.products && itemsData.products.length > 0) {
      worksheet.addRow(['Products']);
      worksheet.addRow(['Product Name', 'Price', 'Stock', 'Stock Value']);
      itemsData.products.forEach((product) => {
        worksheet.addRow([
          product.name,
          `$${product.price.toFixed(2)}`,
          product.stock,
          `$${(product.price * product.stock).toFixed(2)}`,
        ]);
      });
    } else {
      worksheet.addRow(['No products available.']);
    }
  } else if (reportType === 'customer-ledger') {
    const ledgerData = data as CustomerLedgerReportDTO;
    worksheet.addRow(['Summary']);
    worksheet.addRow(['Total Customers', ledgerData.summary.totalCustomers]);
    worksheet.addRow(['Total Revenue', `$${ledgerData.summary.totalRevenue.toFixed(2)}`]);
    worksheet.addRow(['Total Transactions', ledgerData.summary.totalTransactions]);
    worksheet.addRow(['Average Customer Value', `$${ledgerData.summary.averageCustomerValue.toFixed(2)}`]);
    if (ledgerData.summary.topCustomer) {
      worksheet.addRow(['Top Customer', ledgerData.summary.topCustomer]);
    }
    worksheet.addRow([]);
    worksheet.addRow(['Customers']);
    worksheet.addRow([
      'Customer Name',
      'Email',
      'Total Purchases',
      'Total Amount',
      'Avg. Order Value',
      'Last Purchase',
    ]);
    ledgerData.customers.forEach((customer) => {
      worksheet.addRow([
        customer.customerName,
        customer.email,
        customer.totalPurchases,
        `$${customer.totalAmount.toFixed(2)}`,
        `$${customer.averageOrderValue.toFixed(2)}`,
        format(new Date(customer.lastPurchase), 'MM/dd/yyyy'),
      ]);
    });
  }

  // Auto-size columns
  worksheet.columns.forEach((column) => {
    if (!column) return; // Skip undefined columns
    let maxLength = 0;
    column.eachCell?.({ includeEmpty: true }, (cell) => {
      const columnLength = cell.value ? cell.value.toString().length : 10;
      if (columnLength > maxLength) maxLength = columnLength;
    });
    column.width = maxLength < 10 ? 10 : maxLength;
  });

  // Cast the result to Buffer to satisfy TypeScript
  const buffer = await workbook.xlsx.writeBuffer();
  return Buffer.from(buffer);
}

export async function generatePDF(
  reportType: string,
  data: SalesReportDTO | ItemsReportExportData | CustomerLedgerReportDTO,
  fromDate?: string,
  toDate?: string
): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const doc = new PDFKit({ margin: 50 });
    const buffers: Uint8Array[] = [];

    doc.on('data', (chunk: Uint8Array) => buffers.push(chunk));
    doc.on('end', () => resolve(Buffer.concat(buffers)));
    doc.on('error', reject);

    // Title
    doc.fontSize(18)
      .font('Helvetica-Bold')
      .text(`${reportType.replace('-', ' ').toUpperCase()} Report`, { align: 'center' });

    // Date range
    if (fromDate && toDate) {
      doc.fontSize(12)
        .font('Helvetica')
        .text(
          `Period: ${format(new Date(fromDate), 'MM/dd/yyyy')} - ${format(new Date(toDate), 'MM/dd/yyyy')}`,
          { align: 'center' }
        );
    }
    doc.moveDown(2);

    let currentY = doc.y;

    if (reportType === 'sales') {
      const salesData = data as SalesReportDTO;

      // Summary section
      doc.fontSize(14).font('Helvetica-Bold').text('Summary', 50, currentY);
      currentY += 25;

      doc.fontSize(11).font('Helvetica');
      doc.text(`Total Revenue: $${salesData.totalRevenue.toFixed(2)}`, 50, currentY);
      currentY += 18;
      doc.text(`Total Sales: ${salesData.totalSales}`, 50, currentY);
      currentY += 18;
      doc.text(`Total Quantity: ${salesData.totalQuantity}`, 50, currentY);
      currentY += 18;
      doc.text(`Unique Customers: ${salesData.uniqueCustomers}`, 50, currentY);
      currentY += 18;

      if (salesData.topSellingProduct) {
        doc.text(`Top Selling Product: ${salesData.topSellingProduct}`, 50, currentY);
        currentY += 18;
      }

      currentY += 20;

      // Transactions table
      doc.fontSize(14).font('Helvetica-Bold').text('Transactions', 50, currentY);
      currentY += 30;

      const salesHeaders = ['Product Name', 'Customer', 'Qty', 'Total Price', 'Sale Date'];
      const salesColumnWidths = [150, 120, 50, 80, 90]; // Total: 490px
      const salesRows = salesData.sales.map(sale => [
        sale.productName,
        sale.customerName,
        sale.quantity.toString(),
        `$${sale.totalPrice.toFixed(2)}`,
        format(new Date(sale.saleDate), 'MM/dd/yyyy')
      ]);

      drawTable(doc, salesHeaders, salesRows, currentY, salesColumnWidths);

    } else if (reportType === 'items') {
      const itemsData = data as ItemsReportExportData;

      // Summary section
      doc.fontSize(14).font('Helvetica-Bold').text('Summary', 50, currentY);
      currentY += 25;

      doc.fontSize(11).font('Helvetica');
      doc.text(`Total Products: ${itemsData.report.totalProducts}`, 50, currentY);
      currentY += 18;
      doc.text(`Total Stock: ${itemsData.report.totalStock}`, 50, currentY);
      currentY += 18;
      doc.text(`Inventory Value: $${itemsData.report.totalInventoryValue.toFixed(2)}`, 50, currentY);
      currentY += 18;
      doc.text(`Low Stock Count: ${itemsData.report.lowStockCount}`, 50, currentY);
      currentY += 38;

      if (itemsData.products && itemsData.products.length > 0) {
        doc.fontSize(14).font('Helvetica-Bold').text('Products', 50, currentY);
        currentY += 30;

        const itemsHeaders = ['Product Name', 'Price', 'Stock', 'Stock Value'];
        const itemsColumnWidths = [200, 80, 80, 120]; // Total: 480px
        const itemsRows = itemsData.products.map(product => [
          product.name,
          `$${product.price.toFixed(2)}`,
          product.stock.toString(),
          `$${(product.price * product.stock).toFixed(2)}`
        ]);

        drawTable(doc, itemsHeaders, itemsRows, currentY, itemsColumnWidths);
      } else {
        doc.fontSize(12).font('Helvetica').text('No products available.', 50, currentY);
      }

    } else if (reportType === 'customer-ledger') {
      const ledgerData = data as CustomerLedgerReportDTO;

      // Summary section
      doc.fontSize(14).font('Helvetica-Bold').text('Summary', 50, currentY);
      currentY += 25;

      doc.fontSize(11).font('Helvetica');
      doc.text(`Total Customers: ${ledgerData.summary.totalCustomers}`, 50, currentY);
      currentY += 18;
      doc.text(`Total Revenue: $${ledgerData.summary.totalRevenue.toFixed(2)}`, 50, currentY);
      currentY += 18;
      doc.text(`Total Transactions: ${ledgerData.summary.totalTransactions}`, 50, currentY);
      currentY += 18;
      doc.text(`Average Customer Value: $${ledgerData.summary.averageCustomerValue.toFixed(2)}`, 50, currentY);
      currentY += 18;

      if (ledgerData.summary.topCustomer) {
        doc.text(`Top Customer: ${ledgerData.summary.topCustomer}`, 50, currentY);
        currentY += 18;
      }

      currentY += 20;

      // Customers table
      doc.fontSize(14).font('Helvetica-Bold').text('Customers', 50, currentY);
      currentY += 30;

      const ledgerHeaders = ['Customer Name', 'Email', 'Purchases', 'Amount', 'Avg. Order', 'Last Purchase'];
      const ledgerColumnWidths = [100, 120, 70, 70, 70, 90]; // Total: 520px
      const ledgerRows = ledgerData.customers.map(customer => [
        customer.customerName,
        customer.email,
        customer.totalPurchases.toString(),
        `$${customer.totalAmount.toFixed(2)}`,
        `$${customer.averageOrderValue.toFixed(2)}`,
        format(new Date(customer.lastPurchase), 'MM/dd/yyyy')
      ]);

      drawTable(doc, ledgerHeaders, ledgerRows, currentY, ledgerColumnWidths);
    }

    doc.end();
  });
}