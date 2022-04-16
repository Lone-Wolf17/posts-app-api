import { Response } from "express";

import HttpException from "../models/http-exception";
import { RequestWithAuthData } from "../models/auth_request";
import { decodeToken } from "./jwt-service.middleware";

export const isAuthRestAPI = (req: RequestWithAuthData, res: Response, next: Function) => {
  const authHeader = req.get("Authorization");
  if (!authHeader) {
    const error = new HttpException(401, "Not Authenticated.");
    throw error;
  }
  const token = authHeader.split(" ")[1];
  let decodedToken;
  try {
    decodedToken = decodeToken(token);
  } catch (err: any) {
    let error = err as HttpException;
    error.statusCode = 500;
    throw error;
  }
  if (!decodedToken) {
    const error = new HttpException(401, "Not Authenticated.");
    throw error;
  }
  req.userId = decodedToken.userId;
  next();
};

export const isAuthGraphQL = (req: RequestWithAuthData, res: Response, next: Function) => {
  const authHeader = req.get("Authorization");
  if (!authHeader) {
    req.isAuth = false;
    return next();
  }
  const token = authHeader.split(" ")[1];
  let decodedToken;
  try {
    decodedToken = decodeToken(token);
  } catch (err) {
    req.isAuth = false;
    return next();
  }
  if (!decodedToken) {
    req.isAuth = false;
    return next();
  }
  req.userId = decodedToken.userId;
  req.isAuth = true;
  next();
};
