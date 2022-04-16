import { InputType, Field } from "type-graphql";
import { Post } from "../../models/post";

@InputType()
export class PostInput implements Partial<Post> {
  @Field()
  title!: string;

  @Field()
  content!: string;

  @Field()
  imageUrl!: string;
}
