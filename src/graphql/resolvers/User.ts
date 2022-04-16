import { Resolver, Mutation, Arg, Query, Ctx } from "type-graphql";
import bcrypt from "bcryptjs";
import validator from "validator";

import { RequestWithAuthData } from "../../models/auth_request";
import HttpException from "../../models/http-exception";
import { UserModel, User } from "../../models/user";
import { AuthData } from "../types/auth-data";
import { encodeToken } from "../../middleware/jwt-service.middleware";
import { UserInput } from "../types/user-input";
import { CustomResolverContext } from "../types/types";

@Resolver((_of) => User)
export class UserResolver {
  @Query((_returns) => User, { nullable: false })
  async user(@Ctx() context: CustomResolverContext): Promise<User> {
    // return await UserModel.findById(id);

    if (!context.isAuth) {
      const error = new HttpException(401, "Not Authenticated");
      throw error;
    }
    const user = await UserModel.findById(context.userId);
    if (!user) {
      const error = new HttpException(404, "No User was found");
      throw error;
    }
    return user;
  }

  @Query((_returns) => AuthData)
  async login(
    @Arg("email") email: string,
    @Arg("password") password: string
  ): Promise<AuthData> {
    // return await CartModel.find();
    const user = await UserModel.findOne({ email: email });

    if (!user) {
      const error = new HttpException(401, "User not found");
      throw error;
    }

    const isEqual = await bcrypt.compare(password, user.password);
    if (!isEqual) {
      const error = new HttpException(401, "Password is incorrect");
      throw error;
    }

    const token = encodeToken(user.email, user._id.toString());

    return { token: token, userId: user._id.toString() };
  }

  @Mutation(() => User)
  async createUser(@Arg("userInput") userInput: UserInput): Promise<User> {
    const errors = [];
    if (!validator.isEmail(userInput.email)) {
      errors.push({ message: "E-mail is invalid" });
    }

    if (
      validator.isEmpty(userInput.password) ||
      !validator.isLength(userInput.password, { min: 5 })
    ) {
      errors.push({ message: "Password too short" });
    }

    if (errors.length > 0) {
      const error = new HttpException(422, "Invalid Input.", errors);
      throw error;
    }

    const existingUser = await UserModel.findOne({ email: userInput.email });
    if (existingUser) {
      const error = new HttpException(403, "E-Mail address already exists!");
      throw error;
    }
    const hashedPassword = await bcrypt.hash(userInput.password, 12);
    const user = new UserModel({
      email: userInput.email,
      name: userInput.name,
      password: hashedPassword,
    });

    const createdUser = await user.save();
    return { ...createdUser._doc, id: createdUser._id.toString() };
  }

  @Mutation(() => User)
  async updateStatus(
    @Arg("status") status: string,
    @Ctx() context: CustomResolverContext
  ): Promise<User> {
    if (!context.isAuth) {
      const error = new HttpException(401, "Not Authenticated");
      throw error;
    }
    const user = await UserModel.findById(context.userId);
    if (!user) {
      const error = new HttpException(404, "No user found");
      throw error;
    }
    user.status = status;
    await user.save();
    return { ...user._doc, _id: user._id.toString() };
  }

  // @FieldResolver((_type) => Product)
  // async product (@Root() cart: Cart): Promise<Product> {
  //     console.log(cart, 'cart!');
  //     return (await ProductModel.findById(cart._doc.products))!;
  // }
}
