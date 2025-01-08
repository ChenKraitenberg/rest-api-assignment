import express from "express";
const router = express.Router();
import authController from "../controllers/authController";
import { authMiddleware } from "../controllers/authController";



router.post("/register", authController.register);
router.post("/login", authController.login);
router.post("/logout", authController.logout);
router.post("/refresh", authController.refresh);

/*
router.get("/", authController.getAll.bind(authController)); // שליפת כל המשתמשים
router.get("/:id", authController.getById.bind(authController)); // שליפת משתמש לפי מזהה
router.post("/",authMiddleware, authController.create.bind(authController)); // יצירת משתמש חדש
router.put("/:id", authController.update.bind(authController)); // עדכון משתמש קיים
router.delete("/:id", authMiddleware, authController.delete.bind(authController)); // מחיקת משתמש קיים
*/
export default router;
