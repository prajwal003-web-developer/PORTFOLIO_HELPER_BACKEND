import { Router } from "express";
import { ChangePassword, ForgotPasswordRequest, Login, me, register, verify, verifyEmailRequest } from "../Controller/USER/Index";
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

router.get('/send-email-forget-password/:email',ForgotPasswordRequest)
router.post('/verify-email-request/:Token',ChangePassword)

export default router;
