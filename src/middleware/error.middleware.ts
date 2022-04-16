import HttpException from "../models/http-exception";
import { Request, Response, NextFunction } from "express";

export const errorHandler = (
  error: HttpException,
  request: Request,
  response: Response,
  next: NextFunction
) => {
  const status = error.statusCode || error.status || 500;
  const message = error.message;
  const data = error.data;
  response.status(status).json({ message: message });
};
