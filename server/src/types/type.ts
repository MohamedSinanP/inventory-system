import { Request } from "express";

export enum StatusCode {
  OK = 200,
  CREATED = 201,
  NO_CONTENT = 204,
  BAD_REQUEST = 400,
  UNAUTHORIZED = 401,
  FORBIDDEN = 403,
  NOT_FOUND = 404,
  CONFLICT = 409,
  INTERNAL_SERVER_ERROR = 500
};

export interface PaginatedData<T> {
  data: T[];
  totalPages: number;
  currentPage: number;
}

export interface AuthenticatedRequest extends Request {
  user: {
    userId: string;
  };
}


export interface EmailConfig {
  user: string;
  pass: string;
  host?: string;
  port?: number;
  secure?: boolean;
}

