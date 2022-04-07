const { validationResult } = require("express-validator");
const Post = require("../models/post.js");

exports.getPosts = (req, res, next) => {
  res.status(200).json({
    posts: [
      {
        _id: "3737",
        title: "First Post",
        content: "This is my first post!",
        imageUrl: "images/2-ducks.jpg",
        creator: {
          name: "Korex",
        },
        createdAt: new Date(),
      },
    ],
  });
};

exports.createPost = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const error = new Error("Validation failed, entered data is incorrect.");
    error.statusCode = 422;
    throw error;
  }

  const title = req.body.title;
  const content = req.body.content;

  const post = new Post({
    title: title,
    content: content,
    imageUrl: "images/duck.jpg",
    creator: { name: "Lone Wolf" },
  });

  post
    .save()
    .then((result) => {
      console.log(result);
      res.status(201).json({
        message: "Post created successfully!!",
        post: result,
      });
    })
    .catch((err) => {
      if (!err.statusCode) {
        err.statusCode = 500;
      }
      next(err);
    });
};
