// import bcrypt from 'bcryptjs';
// import validator from 'validator';

// import User from '../models/user';
// import Post from '../models/post';
// import {clearImage} from '../util/file';
// import HttpException from '../models/http-exception';
// import { encodeToken } from '../middleware/jwt-service.middleware';
// import { RequestWithAuthData } from '../models/auth_request';


// export default {
//   createUser: async function ({ userInput }, req : RequestWithAuthData) {
//     const errors = [];
//     if (!validator.isEmail(userInput.email)) {
//       errors.push({ message: "E-mail is invalid" });
//     }

//     if (
//       validator.isEmpty(userInput.password) ||
//       !validator.isLength(userInput.password, { min: 5 })
//     ) {
//       errors.push({ message: "Password too short" });
//     }

//     if (errors.length > 0) {
//       const error = new HttpException(422, "Invalid Input.", errors);
//       throw error;
//     }

//     const existingUser = await User.findOne({ email: userInput.email });
//     if (existingUser) {
//       const error = new Error("User already Exists");
//       throw error;
//     }
//     const hashedPassword = await bcrypt.hash(userInput.password, 12);
//     const user = new User({
//       email: userInput.email,
//       name: userInput.name,
//       password: hashedPassword,
//     });

//     const createdUser = await user.save();
//     return { ...createdUser.toObject(), _id: createdUser._id.toString() };
//   },

//   login: async function ({ email, password }) {
//     const user = await User.findOne({ email: email });

//     if (!user) {
//       const error = new HttpException(401, "User not found");
//       throw error;
//     }

//     const isEqual = await bcrypt.compare(password, user.password);
//     if (!isEqual) {
//       const error = new HttpException(401, "Password is incorrect");
//       throw error;
//     }

//     const token = encodeToken(user.email, user._id.toString());
    
//     // jwt.sign(
//     //   {
//     //     userId: user._id.toString(),
//     //     email: user.email,
//     //   },
//     //   "somesupersecretsecret",
//     //   { expiresIn: "1h" }
//     // );

//     return { token: token, userId: user._id.toString() };
//   },

//   createPost: async function ({ postInput }, req : RequestWithAuthData) {
//     if (!req.isAuth) {
//       const error = new HttpException(401, "Not Authenticated");
//       throw error;
//     }

//     const errors = [];
//     if (
//       validator.isEmpty(postInput.title) ||
//       !validator.isLength(postInput.title, { min: 5 })
//     ) {
//       errors.push({ message: "Title is invalid" });
//     }
//     if (
//       validator.isEmpty(postInput.content) ||
//       !validator.isLength(postInput.content, { min: 5 })
//     ) {
//       errors.push({ message: "Content is invalid" });
//     }
//     if (errors.length > 0) {
//       const error = new HttpException(422, "Invalid Input.", errors);
//       throw error;
//     }

//     const user = await User.findById(req.userId);
//     if (!user) {
//       const error = new HttpException(401, "Invalid User.");
//       throw error;
//     }

//     const post = new Post({
//       title: postInput.title,
//       content: postInput.content,
//       imageUrl: postInput.imageUrl,
//       creator: user,
//     });
//     const createdPost = await post.save() as Post;
//     user.posts.push(createdPost);
//     await user.save();
//     return {
//       ...createdPost.toObject(),
//       _id: createdPost._id.toString(),
//       createdAt: createdPost.createdAt.toISOString(),
//       updatedAt: createdPost.updatedAt.toISOString(),
//     };
//   },
//   posts: async function ({ page }, req : RequestWithAuthData) {
//     if (!req.isAuth) {
//       const error = new HttpException(401, "Not Authenticated");
//       throw error;
//     }

//     if (!page) {
//       page = 1;
//     }
//     const perPage = 2;

//     const totalPosts = await Post.find().countDocuments();
//     const posts = await Post.find()
//       .sort({ createdAt: -1 })
//       .skip((page - 1) * perPage)
//       .limit(perPage)
//       .populate("creator");
//     return {
//       posts: posts.map((p) => {
//         return {
//           ...p._doc,
//           _id: p._id.toString(),
//           createdAt: p.createdAt.toISOString(),
//           updatedAt: p.updatedAt.toISOString(),
//         };
//       }),
//       totalPosts: totalPosts,
//     };
//   },
//   post: async function ({ id }, req: RequestWithAuthData) {
//     if (!req.isAuth) {
//       const error = new HttpException(401, "Not Authenticated");
//       throw error;
//     }
//     const post = await Post.findById(id).populate("creator");
//     if (!post) {
//       const error = new HttpException(404, "No Post found");
//       throw error;
//     }
//     return {
//       ...post._doc,
//       _id: post._id.toString(),
//       createdAt: post.createdAt.toISOString(),
//       updatedAt: post.updatedAt.toISOString(),
//     };
//   },
//   updatePost: async function ({ id, postInput }, req: RequestWithAuthData) {
//     if (!req.isAuth) {
//       const error = new HttpException(401, "Not Authenticated");
//       throw error;
//     }
//     const post = await Post.findById(id).populate("creator");
//     if (!post) {
//       const error = new HttpException(404, "No post found");
//       throw error;
//     }
//     if (post.creator._id.toString() !== req.userId!.toString()) {
//       const error = new HttpException(403, "Not Authorized");
//       throw error;
//     }
//     const errors = [];
//     if (
//       validator.isEmpty(postInput.title) ||
//       !validator.isLength(postInput.title, { min: 5 })
//     ) {
//       errors.push({ message: "Title is invalid" });
//     }
//     if (
//       validator.isEmpty(postInput.content) ||
//       !validator.isLength(postInput.content, { min: 5 })
//     ) {
//       errors.push({ message: "Content is invalid" });
//     }
//     if (errors.length > 0) {
//       const error = new HttpException(422, "Invalid Input.", errors);
//       throw error;
//     }

//     post.title = postInput.title;
//     post.content = postInput.content;
//     if (postInput.imageUrl !== "undefined") {
//       post.imageUrl = postInput.imageUrl;
//     }
//     const updatedPost = await post.save();
//     return {
//       ...updatedPost._doc,
//       _id: updatedPost._id.toString(),
//       createdAt: updatedPost.createdAt.toISOString(),
//       updatedAt: updatedPost.updatedAt.toISOString(),
//     };
//   },
//   deletePost: async function ({ id }, req: RequestWithAuthData) {
//     if (!req.isAuth) {
//       const error = new HttpException(401, "Not Authenticated");
//       throw error;
//     }

//     const post = await Post.findById(id);
//     if (!post) {
//       const error = new HttpException(404, "No post found");
//       throw error;
//     }
//     if (post.creator.toString() !== req.userId!.toString()) {
//       const error = new HttpException(403, "Not Authorised");
//       throw error;
//     }

//     clearImage(post.imageUrl);
//     await Post.findByIdAndRemove(id);
//     const user = await User.findById(req.userId);
//     user.posts.pull(id);
//     await user.save();
//     return true;
//   },
//   user: async function (args, req : RequestWithAuthData) {
//     if (!req.isAuth) {
//       const error = new HttpException(401, "Not Authenticated");
//       throw error;
//     }
//     const user = await User.findById(req.userId);
//     if (!user) {
//       const error = new HttpException(404, "No User was found");
//       throw error;
//     }
//     return {
//       ...user._doc,
//       _id: user._id.toString(),
//     };
//   },
//   updateStatus: async function ({ status }, req: RequestWithAuthData) {
//     if (!req.isAuth) {
//       const error = new HttpException(401, "Not Authenticated");
//       throw error;
//     }
//     const user = await User.findById(req.userId);
//     if (!user) {
//       const error = new HttpException(404, "No user found");
//       throw error;
//     }
//     user.status = status;
//     await user.save();
//     return { ...user._doc, _id: user._id.toString() };
//   },
// };
