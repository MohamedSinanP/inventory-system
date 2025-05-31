import { ExportRequest } from '../../types/user';

export interface IReportExportService {
  exportReport(
    userId: string,
    request: ExportRequest
  ): Promise<{
    content: Buffer | string;
    filename: string;
    mimeType: string;
  }>;
}