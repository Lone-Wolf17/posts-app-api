import { Field, ObjectType, Int } from "type-graphql";
import { Post } from "../../models/post";

@ObjectType()
export class PostData {
    @Field(type => Int)
    totalPosts!: number;

    @Field(type => [Post])
    posts!: Post[];
}