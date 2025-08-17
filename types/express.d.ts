import { JwtPayload } from "../Middleware/Middleware"; // adjust path

declare module "express-serve-static-core" {
  interface Request {
    user?: JwtPayload; // optional, because it might not exist before auth
  }
}
