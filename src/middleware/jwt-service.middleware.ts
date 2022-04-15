import jwt from 'jsonwebtoken';

const jwtSecretkey:string = "somesupersecretsecret";

export function encodeToken(userEmail: string, userId: string) : string {
    return jwt.sign(
        {
          userEmail: userEmail,
          userId: userId,
        },
        jwtSecretkey,
        { expiresIn: "1h" }
      );
}

export function decodeToken (token: string) : JwtPayload {
    return jwt.verify(token, jwtSecretkey) as JwtPayload;
}

export interface JwtPayload {
    userId: string,
    userEmail: string; 
}