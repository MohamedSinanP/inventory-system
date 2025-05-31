import { NextFunction, Request, Response } from 'express';

export interface IReportExportController {
  exportReport(req: Request, res: Response, next: NextFunction): Promise<void>;
}