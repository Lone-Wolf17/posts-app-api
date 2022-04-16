import { Router } from "express";
import { body } from "express-validator/check";

import * as feedController from "../controllers/feedsController";
import { isAuthRestAPI } from "../middleware/is-auth";

const router = Router();

// GET /feed/posts
router.get("/posts", isAuthRestAPI, feedController.getPosts);

// POST /feed/post
router.post(
  "/post",
  isAuthRestAPI,
  [
    body("title").trim().isLength({ min: 5 }),
    body("content").trim().isLength({ min: 5 }),
  ],
  feedController.createPost
);

router.get("/post/:postId", isAuthRestAPI, feedController.getPost);

router.put(
  "/post/:postId",
  isAuthRestAPI,
  [
    body("title").trim().isLength({ min: 5 }),
    body("content").trim().isLength({ min: 5 }),
  ],
  feedController.updatePost
);

router.delete("/post/:postId", isAuthRestAPI, feedController.deletePost);

export default router;
