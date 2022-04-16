import {ObjectId} from 'mongoose';

export type Ref<T> = T | ObjectId;

export interface CustomResolverContext {
    isAuth: boolean;
    userId?: string
}