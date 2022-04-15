import { Request } from "express";

export interface RequestWithAuthData extends Request {
    userId? : string;
    isAuth? : boolean;
}