import express from "express";
const router = express.Router();
import authController from "../controllers/authController";
import { authMiddleware } from "../controllers/authController";

router.post("/register", authController.register);
router.post("/login", authController.login);
router.post("/logout", authController.logout);
router.post("/refresh", authController.refresh);

export default router;
