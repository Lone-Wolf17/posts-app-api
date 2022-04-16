import { Response, NextFunction } from "express";
import { validationResult } from "express-validator/check";
import { clearImage } from "../util/file";

import { PostModel } from "../models/post";
import { UserModel } from "../models/user";
import { getSocketIO } from "../socketIO";
import { RequestWithAuthData } from "../models/auth_request";
import HttpException from "../models/http-exception";

export const getPosts = async (
  req: RequestWithAuthData,
  res: Response,
  next: NextFunction
) => {
  const currentPage: number = +(req.query.page || 1);
  const perPage = 2;
  try {
    const totalItems = await PostModel.find().countDocuments();
    const posts = await PostModel.find()
      .populate("creator")
      .sort({ createdAt: -1 })
      .skip((currentPage - 1) * perPage)
      .limit(perPage);

    res.status(200).json({
      message: "Fetched posts successfully.",
      posts: posts,
      totalItems: totalItems,
    });
  } catch (e) {
    let err = e as HttpException;
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
};

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
    const error = new HttpException(422, "No image provided");
    throw error;
  }

  const title = req.body.title;
  const content = req.body.content;
  const imageUrl = req.file.path;

  const post = new PostModel({
    title: title,
    content: content,
    imageUrl: imageUrl,
    creator: req.userId,
  });

  try {
    await post.save();
    const user = (await UserModel.findById(req.userId))!;
    user.posts.push(post);
    const savedUser = await user.save();
    getSocketIO().emit("posts", {
      action: "create",
      post: {
        ...post.toObject(),
        creator: { _id: req.userId, name: user.name },
      },
    });
    res.status(201).json({
      message: "Post created successfully!!",
      post: post,
      creator: { _id: user._id, name: user.name },
    });
    return savedUser;
  } catch (e) {
    let err = e as HttpException;
    if (!err.statusCode) {
      err.statusCode = 500;
      next(err);
    }
  }
};

export const getPost = async (
  req: RequestWithAuthData,
  res: Response,
  next: NextFunction
) => {
  const postId = req.params.postId;
  const post = await PostModel.findById(postId);
  try {
    if (!post) {
      const error = new HttpException(404, "Could not find post.");
      throw error;
    }
    res.status(200).json({ message: "Post fetched.", post: post });
  } catch (e) {
    let err = e as HttpException;
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
};

export const updatePost = async (
  req: RequestWithAuthData,
  res: Response,
  next: NextFunction
) => {
  const postId = req.params.postId;
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const error = new HttpException(
      422,
      "Validation failed, entered data is incorrect."
    );
    throw error;
  }
  const title = req.body.title;
  const content = req.body.content;
  let imageUrl = req.body.image;
  if (req.file) {
    imageUrl = req.file.path;
  }
  if (!imageUrl) {
    const error = new HttpException(422, "No file picked.");
    throw error;
  }
  try {
    const post = (await PostModel.findById(postId).populate("creator"))!;
    if (!post) {
      const error = new HttpException(404, "Could not find post.");
      throw error;
    }
    if (post.creator!.id.toString() !== req.userId) {
      const error = new HttpException(403, "Not authorized!");
      throw error;
    }
    if (imageUrl !== post.imageUrl) {
      clearImage(post.imageUrl);
    }
    post.title = title;
    post.imageUrl = imageUrl;
    post.content = content;
    const result = await post.save();

    getSocketIO().emit("posts", { action: "update", post: result });
    res.status(200).json({ message: "Post updated!", post: result });
  } catch (e) {
    let err = e as HttpException;
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
};

export const deletePost = async (
  req: RequestWithAuthData,
  res: Response,
  next: NextFunction
) => {
  const postId = req.params.postId;
  try {
    const post = (await PostModel.findById(postId))!;

    if (!post) {
      const error = new HttpException(404, "Could not find post.");
      throw error;
    }
    if (post.creator!.toString() !== req.userId) {
      const error = new HttpException(403, "Not authorized!");
      throw error;
    }
    // Check logged in user
    clearImage(post.imageUrl);
    await PostModel.findByIdAndRemove(postId);

    const user = (await UserModel.findById(req.userId))!;
    user.posts.pull(postId);
    await user.save();

    getSocketIO().emit("posts", { action: "delete", post: postId });
    res.status(200).json({ message: "Deleted post." });
  } catch (e) {
    let err = e as HttpException;
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
};

// const clearImage = (filePath: string) => {
//   filePath = path.join(__dirname, "../..", filePath);
//   fs.unlink(filePath, (err) => console.log(err));
// };
