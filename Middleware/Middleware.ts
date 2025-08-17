import { NextFunction, Request, Response } from "express";
import { ThrowError } from "../utils/Error";
import jwt from "jsonwebtoken";

export interface JwtPayload {
    id: Number; // user id stored in token
}

export const AuthorizeUser = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { authorization } = req.headers

        if (!authorization || !authorization.startsWith("Bearer ")) {
            return res.status(401).json({ message: "Unauthorized: No token provided" });
        }

        const token = authorization.split(" ")[1]; // Get token after "Bearer "

        if (!process.env.LOGIN_SECRET) {
            throw new Error("JWT secret is not set");
        }

        const decoded = jwt.verify(token, process.env.LOGIN_SECRET!) as JwtPayload;

        // Attach user info to request
        (req as any).user = { id: decoded.id };

        next()
    } catch (error) {
        ThrowError(res, error)
    }
}