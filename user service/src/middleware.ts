import { NextFunction,Request,Response } from "express";
import jwt, { JwtPayload } from "jsonwebtoken";
import { IUser ,User} from "./model.js";

export interface AuthenticatedRequest extends Request {
    user?:IUser | null; // Define the type of user if you have a specific interface for it
}

export const isAuth = async (req:AuthenticatedRequest, res:Response, next:NextFunction): Promise<void> => {
    try{
        const token=req.headers.token as string;

        if(!token){
            res.status(403).json({
                msg:"Please login first",
            });
            return;
        }

        const decodedValue = jwt.verify(token,process.env.JWT_SEC as string) as JwtPayload;

        if(!decodedValue || !decodedValue._id){
            res.status(403).json({
                msg:"Invalid token",
            });
            return;
        }

        const userId = decodedValue._id;

        const user = await User.findById(userId).select("-password");
        if(!user){
            res.status(403).json({
                msg:"User not found",
            });
            return;
        }
        req.user = user;
        next();
    }
    catch(error){
        res.status(403).json({
            msg:"Please login first",
        });
    }
}