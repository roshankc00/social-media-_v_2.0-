import { User } from "@prisma/client";
import jwt from "jsonwebtoken"
import "dotenv/config"
import { JWTUser } from "../types";

class JwtService {
    public static  generateTokenForUser(user: User){
        const payload:JWTUser={
            id:user?.id,
            email:user?.email
        }
        const token= jwt.sign(payload,process.env.JWT_SECRET as string)
        return token 
    }

    public static decodeToken(token:string){
        return jwt.verify(token, process.env.JWT_SECRET as string) as JWTUser

    }
}

export default JwtService