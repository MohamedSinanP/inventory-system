import { Request, Response, NextFunction } from "express";
import { AuthenticatedRequest, StatusCode } from "../types/type";
import { ExportRequest, ReportType, ExportFormat } from "../types/user";
import { IReportExportController } from "../interfaces/controllers/report.export.controller";
import { IReportExportService } from "../interfaces/services/report.export.service";
import reportExportService from "../services/report.export.service";
import { HttpError } from "../utils/http.error";

const validReportTypes = ['sales', 'items', 'customer-ledger'] as const;
const validExportFormats = ['print', 'excel', 'pdf', 'email'] as const;

function isValidReportType(value: any): value is ReportType {
  return validReportTypes.includes(value);
}

function isValidExportFormat(value: any): value is ExportFormat {
  return validExportFormats.includes(value);
}

class ReportExportController implements IReportExportController {
  constructor(private reportExportService: IReportExportService) { }

  async exportReport(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { userId } = (req as AuthenticatedRequest).user;

      if (!userId) {
        throw new HttpError(StatusCode.UNAUTHORIZED, 'Unauthorized: User not authenticated');
      }

      const { reportType, format, fromDate, toDate, email } = req.query;

      if (!reportType || typeof reportType !== 'string' || !isValidReportType(reportType)) {
        throw new HttpError(StatusCode.BAD_REQUEST, 'Invalid reportType. Must be sales, items, or customer-ledger');
      }

      if (!format || typeof format !== 'string' || !isValidExportFormat(format)) {
        throw new HttpError(StatusCode.BAD_REQUEST, 'Invalid format. Must be print, excel, pdf, or email');
      }

      if (format === 'email' && (!email || typeof email !== 'string')) {
        throw new HttpError(StatusCode.BAD_REQUEST, 'Email address is required for email export');
      }

      if ((reportType === 'sales' || reportType === 'customer-ledger')) {
        if (!fromDate || !toDate || typeof fromDate !== 'string' || typeof toDate !== 'string') {
          throw new HttpError(StatusCode.BAD_REQUEST, 'fromDate and toDate are required for this report type');
        }

        if (isNaN(Date.parse(fromDate)) || isNaN(Date.parse(toDate))) {
          throw new HttpError(StatusCode.BAD_REQUEST, 'Invalid date format for fromDate or toDate');
        }
      }

      const exportRequest: ExportRequest = {
        reportType,
        format,
        fromDate: typeof fromDate === 'string' ? fromDate : undefined,
        toDate: typeof toDate === 'string' ? toDate : undefined,
        email: typeof email === 'string' ? email : undefined,
      };

      const { content, filename, mimeType } = await this.reportExportService.exportReport(userId, exportRequest);

      if (format === 'email') {
        res.status(StatusCode.OK).json({ message: `Report sent to ${email}` });
        return;
      }

      // Set response headers
      res.writeHead(StatusCode.OK, {
        'Content-Type': mimeType,
        'Content-Disposition': `attachment; filename="${filename}"`,
      });

      // Send string or buffer content correctly
      if (typeof content === 'string') {
        res.end(content, 'utf-8');
      } else {
        res.end(content); // buffer
      }

    } catch (error) {
      next(error);
    }
  }
}

export default new ReportExportController(reportExportService);
