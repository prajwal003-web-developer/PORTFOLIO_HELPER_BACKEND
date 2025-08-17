import { Router } from "express";
import { Login, me, register, verify, verifyEmailRequest } from "../Controller/USER/Index";
import { AuthorizeUser } from "../Middleware/Middleware";


const router = Router();

// Register route
router.post("/register", register);

// Login route
router.post("/login", Login);

// Verify email route
router.get("/verify-email-request",AuthorizeUser, verifyEmailRequest);

router.post("/verify-email",verify)

router.get('/me',AuthorizeUser,me)

export default router;
