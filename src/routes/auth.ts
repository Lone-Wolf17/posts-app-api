import { Router } from "express";
import { Request } from "express";
import { body } from "express-validator/check";

import { UserModel } from "../models/user";
import * as AuthController from "../controllers/auth";
import isAuth from "../middleware/is-auth";

const router = Router();

router.put(
  "/signup",
  [
    body("email")
      .isEmail()
      .withMessage("Please enter a valid email.")
      .custom((value: string, { req }: { req: Request }) => {
        return UserModel.findOne({ email: value }).then((userDoc: any) => {
          if (userDoc) {
            return Promise.reject("E-Mail address already exists!");
          }
        });
      })
      .normalizeEmail(),
    body("password").trim().isLength({ min: 5 }),
    body("name").trim().not().isEmpty(),
  ],
  AuthController.signup
);

router.post("/login", AuthController.login);

router.get("/status", isAuth, AuthController.getUserStatus);

router.patch(
  "/status",
  isAuth,
  [body("status").trim().not().isEmpty()],
  AuthController.updateUserStatus
);

export default router;
