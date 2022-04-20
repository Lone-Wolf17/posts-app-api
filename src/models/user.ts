import { ObjectType, Field, ID, Int } from "type-graphql";
import {
  prop as Property,
  getModelForClass,
  mongoose,
} from "@typegoose/typegoose";

import { Post } from "./post";

@ObjectType({ description: "The User model" })
export class User {
  @Field(() => ID)
  id!: String;

  @Field()
  @Property({ required: true, type: String, unique: true })
  email!: string;

  @Field()
  @Property({ required: true })
  password!: string;

  @Field()
  @Property({ required: true })
  name!: String;

  @Field()
  @Property({ default: "I am new!" })
  status!: String;

  @Field((type) => [Post])
  @Property({ type: Post, default: [] })
  posts!: mongoose.Types.Array<Post>;
  _doc: any;
}

export const UserModel = getModelForClass(User);

// const userSchema = new Schema({
//   email: {
//     type: String,
//     required: true
//   },
//   password: {
//     type: String,
//     required: true
//   },
//   name: {
//     type: String,
//     required: true
//   },
//   status: {
//     type: String,
//     default: 'I am new!'
//   },
//   posts: [
//     {
//       type: Schema.Types.ObjectId,
//       ref: 'Post'
//     }
//   ]
// });

// export default mongoose.model('User', userSchema);
