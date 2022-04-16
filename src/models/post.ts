import { ObjectType, Field, ID, Int } from "type-graphql";
import { prop as Property, getModelForClass } from "@typegoose/typegoose";

import { Ref } from "../types";
import { User } from "./user";

@ObjectType({description: 'The Post model'})
export class Post {
  @Field(() => ID)  
  id!: String;

  @Field()
  @Property({required: true})
  title!: String;

  @Field()
  @Property({required: true})
  imageUrl!: string;

  @Field()
  @Property({required: true})
  content!: String;

  @Field((type) => String)
    @Property({ref: User, required: true})
    creator!: User;

    _doc:any
    createdAt: any
    updatedAt: any
}

export const PostModel = getModelForClass(Post, {schemaOptions: {timestamps: true}});

// const postSchema = new Schema(
//   {
//     title: {
//       type: String,
//       required: true
//     },
//     imageUrl: {
//       type: String,
//       required: true
//     },
//     content: {
//       type: String,
//       required: true
//     },
//     creator: {
//       type: Schema.Types.ObjectId,
//       ref: 'User',
//       required: true
//     }
//   },
//   { timestamps: true }
// );

// export default mongoose.model('Post', postSchema);