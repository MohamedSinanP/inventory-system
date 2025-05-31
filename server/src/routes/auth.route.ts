import express from "express";
import authController from "../controllers/auth.controller";

const router = express.Router();


router.post('/signup', authController.signupUser.bind(authController));
router.post('/login', authController.login.bind(authController));
router.post('/logout', authController.logout.bind(authController));
router.post('/refresh', authController.rotateRefreshToken.bind(authController));

export default router;