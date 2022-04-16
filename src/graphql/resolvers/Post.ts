import { Resolver, Mutation, Arg, Query, FieldResolver, Root, Info, Ctx } from "type-graphql";
import validator from 'validator';

import { RequestWithAuthData } from "../../models/auth_request";
import HttpException from "../../models/http-exception";
import { PostModel, Post } from "../../models/post";
import { PostData } from "../types/post-data";
import { PostInput } from "../types/post-input";
import { UserModel } from "../../models/user";
import { clearImage } from "../../util/file";

@Resolver((_of) => Post)
export class PostResolver {
    @Query((_returns) => Post, {nullable: false})
    async post(@Arg('id') id : string, @Ctx() reqCtx:RequestWithAuthData) : Promise<Post> {
        if (!reqCtx.isAuth) {
            const error = new HttpException(401, "Not Authenticated");
            throw error;
          }
          const post = await PostModel.findById(id).populate("creator");
          if (!post) {
            const error = new HttpException(404, "No Post found");
            throw error;
          }
          return {
            ...post._doc,
            _id: post._id.toString(),
            createdAt: post.createdAt.toISOString(),
            updatedAt: post.updatedAt.toISOString(),
          };

}

    @Query((_returns) => PostData)
    async posts(@Arg('page') page: number, @Ctx() reqCtx:RequestWithAuthData) : Promise<PostData>{
        if (!reqCtx.isAuth) {
            const error = new HttpException(401, "Not Authenticated");
            throw error;
          }
      
          if (!page) {
            page = 1;
          }
          const perPage = 2;
      
          const totalPosts = await PostModel.find().countDocuments();
          const posts = await PostModel.find()
            .sort({ createdAt: -1 })
            .skip((page - 1) * perPage)
            .limit(perPage)
            .populate("creator");
          return {
            posts: posts.map((p) => {
              return {
                ...p._doc,
                _id: p._id.toString(),
                createdAt: p.createdAt.toISOString(),
                updatedAt: p.updatedAt.toISOString(),
              };
            }),
            totalPosts: totalPosts,
          };
    }

    @Mutation(() => Post)
    async createPost(@Arg('postInput') postInput: PostInput, @Ctx() req:RequestWithAuthData) : Promise<Post> {
        if (!req.isAuth) {
            const error = new HttpException(401, "Not Authenticated");
            throw error;
          }
      
          const errors = [];
          if (
            validator.isEmpty(postInput.title) ||
            !validator.isLength(postInput.title, { min: 5 })
          ) {
            errors.push({ message: "Title is invalid" });
          }
          if (
            validator.isEmpty(postInput.content) ||
            !validator.isLength(postInput.content, { min: 5 })
          ) {
            errors.push({ message: "Content is invalid" });
          }
          if (errors.length > 0) {
            const error = new HttpException(422, "Invalid Input.", errors);
            throw error;
          }
      
          const user = await UserModel.findById(req.userId);
          if (!user) {
            const error = new HttpException(401, "Invalid User.");
            throw error;
          }
      
          const post = new PostModel({
            title: postInput.title,
            content: postInput.content,
            imageUrl: postInput.imageUrl,
            creator: user,
          });
          const createdPost = await post.save();
          user.posts.push(createdPost);
          await user.save();
          return {
            ...createdPost._doc,
            id: createdPost._id.toString(),
            createdAt: createdPost.createdAt.toISOString(),
            updatedAt: createdPost.updatedAt.toISOString(),
          };
    }

    @Mutation(()=> Post)
    async updatePost(@Arg('id') id: string, @Arg('postInput') postInput: PostInput, @Ctx() req:RequestWithAuthData) : Promise<Post> {
        if (!req.isAuth) {
            const error = new HttpException(401, "Not Authenticated");
            throw error;
          }
          const post = await PostModel.findById(id).populate("creator");
          if (!post) {
            const error = new HttpException(404, "No post found");
            throw error;
          }
          if (post.creator.id.toString() !== req.userId!.toString()) {
            const error = new HttpException(403, "Not Authorized");
            throw error;
          }
          const errors = [];
          if (
            validator.isEmpty(postInput.title) ||
            !validator.isLength(postInput.title, { min: 5 })
          ) {
            errors.push({ message: "Title is invalid" });
          }
          if (
            validator.isEmpty(postInput.content) ||
            !validator.isLength(postInput.content, { min: 5 })
          ) {
            errors.push({ message: "Content is invalid" });
          }
          if (errors.length > 0) {
            const error = new HttpException(422, "Invalid Input.", errors);
            throw error;
          }
      
          post.title = postInput.title;
          post.content = postInput.content;
          if (postInput.imageUrl !== "undefined") {
            post.imageUrl = postInput.imageUrl;
          }
          const updatedPost = await post.save();
          return {
            ...updatedPost._doc,
            _id: updatedPost._id.toString(),
            createdAt: updatedPost.createdAt.toISOString(),
            updatedAt: updatedPost.updatedAt.toISOString(),
          };


    }

    @Mutation(()=> Boolean)
    async deletePost(@Arg('id') id: string, @Ctx() req:RequestWithAuthData) : Promise<boolean> {
        if (!req.isAuth) {
            const error = new HttpException(401, "Not Authenticated");
            throw error;
          }
      
          const post = await PostModel.findById(id);
          if (!post) {
            const error = new HttpException(404, "No post found");
            throw error;
          }
          if (post.creator.toString() !== req.userId!.toString()) {
            const error = new HttpException(403, "Not Authorised");
            throw error;
          }
      
          clearImage(post.imageUrl);
          await PostModel.findByIdAndRemove(id);
          const user = await UserModel.findById(req.userId);
          user!.posts.pull(id);
          await user!.save();
          return true;
    }

    // @FieldResolver((_type) => Product)
    // async product (@Root() cart: Cart): Promise<Product> {
    //     console.log(cart, 'cart!');
    //     return (await ProductModel.findById(cart._doc.products))!;
    // }
}