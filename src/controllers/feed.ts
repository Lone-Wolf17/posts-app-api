import { NextFunction, Response } from "express";
import { validationResult } from "express-validator/check";
import { RequestWithAuthData } from "../models/auth_request";
import HttpException from "../models/http-exception";

import Post from "../models/post";
import User from "../models/user";

export const createPost = async (
  req: RequestWithAuthData,
  res: Response,
  next: NextFunction
) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const error = new HttpException(
      422,
      "Validation failed, entered data is incorrect."
    );
    throw error;
  }
  if (!req.file) {
    const error = new HttpException(422, "No image provided.");
    throw error;
  }
  const imageUrl = req.file.path;
  const title = req.body.title;
  const content = req.body.content;
  const post = new Post({
    title: title,
    content: content,
    imageUrl: imageUrl,
    creator: req.userId,
  });
  try {
    await post.save();
    const user = await User.findById(req.userId);
    user.posts.push(post);
    await user.save();
    res.status(201).json({
      message: "Post created successfully!",
      post: post,
      creator: { _id: user._id, name: user.name },
    });
  } catch (e) {
    let err = e as HttpException;
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
};
