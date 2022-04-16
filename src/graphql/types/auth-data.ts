import { Field, ObjectType } from "type-graphql";

@ObjectType()
export class AuthData {
  @Field()
  token!: string;

  @Field()
  userId!: string;
}
