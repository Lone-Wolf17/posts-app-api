import { validationResult } from "express-validator/check";
import bcrypt from "bcryptjs";
import { Response, NextFunction } from "express";

import HttpException from "../models/http-exception";
import { RequestWithAuthData } from "../models/auth_request";
import { encodeToken } from "../middleware/jwt-service.middleware";
import { UserModel } from "../models/user";

export const signup = async (
  req: RequestWithAuthData,
  res: Response,
  next: NextFunction
) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const error = new HttpException(422, "Validation failed.", errors.array());
    throw error;
  }
  const email = req.body.email;
  const name= req.body.name;
  const password = req.body.password;
  try {

    const existingUser = await UserModel.findOne({ email: email });
    if (existingUser) {
      const error = new HttpException(403, "User already Exists");
      throw error;
    }

    const hashedPw = await bcrypt.hash(password, 12);

    const user = new UserModel({
      email: email,
      password: hashedPw,
      name: name,
    });
    const result = await user.save();
    res.status(201).json({ message: "User created!", userId: result._id });
  } catch (err) {
    let error = err as HttpException;
    if (!error.statusCode) {
      error.statusCode = 500;
    }
    next(err);
  }
};

export const login = async (
  req: RequestWithAuthData,
  res: Response,
  next: NextFunction
) => {
  const email = req.body.email;
  const password = req.body.password;
  let loadedUser;
  try {
    const user = await UserModel.findOne({ email: email });
    if (!user) {
      const error = new HttpException(
        401,
        "A user with this email could not be found."
      );
      throw error;
    }
    loadedUser = user;
    const isEqual = await bcrypt.compare(password, user.password);
    if (!isEqual) {
      const error = new HttpException(401, "Wrong password!");
      throw error;
    }
    const token = encodeToken(loadedUser.email, loadedUser._id.toString());
    res.status(200).json({ token: token, userId: loadedUser._id.toString() });
    return;
  } catch (err) {
    let error = err as HttpException;
    if (!error.statusCode) {
      error.statusCode = 500;
    }
    next(error);
    return error;
  }
};

export const getUserStatus = async (
  req: RequestWithAuthData,
  res: Response,
  next: NextFunction
) => {
  try {
    const user = await UserModel.findById(req.userId);
    if (!user) {
      const error = new HttpException(404, "User not found.");
      throw error;
    }
    res.status(200).json({ status: user.status });
  } catch (err) {
    let error = err as HttpException;
    if (!error.statusCode) {
      error.statusCode = 500;
    }
    next(error);
  }
};

export const updateUserStatus = async (
  req: RequestWithAuthData,
  res: Response,
  next: NextFunction
) => {
  const newStatus = req.body.status;
  try {
    const user = await UserModel.findById(req.userId);
    if (!user) {
      const error = new HttpException(404, "User not found.");
      throw error;
    }
    user.status = newStatus;
    await user.save();
    res.status(200).json({ message: "User updated." });
  } catch (err) {
    let error = err as HttpException;
    if (!error.statusCode) {
      error.statusCode = 500;
    }
    next(error);
  }
};
