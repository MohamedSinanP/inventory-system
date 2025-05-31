import { Request, Response, NextFunction } from "express";
import { HttpError } from "../utils/http.error";
import { HttpResponse } from "../utils/http.response";

const errorHandler = (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  console.error(err);

  if (err instanceof HttpError) {
    return res.status(err.statusCode).json(HttpResponse.error(err.message, err.statusCode, err.errors));
  }

  res.status(500).json(HttpResponse.error("Something went wrong"));
};

export default errorHandler;