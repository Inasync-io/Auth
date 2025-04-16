import express from 'express';
import { login, signup, logout, verifyEmail, forgotPassword, resetPassword, checkAuth, verifyPhone, getAllUsers } from '../Controllers/authController.js';
import { verifyToken } from '../middleware/verifyToken.js';

const router = express.Router();

router.get("/check-auth", verifyToken, checkAuth);

router.post("/signup", signup);

router.post("/login", login);

router.post("/logout", logout);

router.post("/verify-email", verifyEmail);

router.post("/verify-phone", verifyPhone);

router.post("/forgot-password", forgotPassword);

router.post("/reset-password/:token", resetPassword);

router.get("/users",getAllUsers);

export default router
