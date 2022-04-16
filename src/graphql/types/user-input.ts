import { InputType, Field, ID } from 'type-graphql';
import { User } from '../../models/user';

import { ObjectId } from 'mongoose';

@InputType()
export class UserInput implements Partial<User> {
  @Field()
  email!: string;

  @Field()
  name!: string;

  @Field()
  password!: string;
}