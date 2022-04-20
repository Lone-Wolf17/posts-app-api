import { Router } from "express";
import { body } from "express-validator/check";

import * as AuthController from "../controllers/auth";
import {isAuthRestAPI} from "../middleware/is-auth";

const router = Router();

router.post(
  "/signup",
  [
    body("email")
      .isEmail()
      .withMessage("Please enter a valid email.")
      // .custom((value: string, { req }: { req: Request }) => {
      //   return UserModel.findOne({ email: value }).then((userDoc: any) => {
      //     if (userDoc) {
      //       return Promise.reject("E-Mail address already exists!");
      //     }
      //   });
      // })
      .normalizeEmail(),
    body("password").trim().isLength({ min: 5 }),
    body("name").trim().not().isEmpty(),
  ],
  AuthController.signup
);

router.post("/login", AuthController.login);

router.get("/status", isAuthRestAPI, AuthController.getUserStatus);

router.patch(
  "/status",
  isAuthRestAPI,
  [body("status").trim().not().isEmpty()],
  AuthController.updateUserStatus
);

export default router;
