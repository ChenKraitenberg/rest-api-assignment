import express from "express";
const router = express.Router();
import userController from "../controllers/userController";

//import authController from "../controllers/auth_controller";

//router.post("/register", authController.register);

//router.post("/login", authController.login);

//router.post("/logout", authController.logout);

//router.post("/refresh", authController.refresh);

router.get("/", userController.getAll.bind(userController)); // שליפת כל המשתמשים
router.get("/:id", userController.getById.bind(userController)); // שליפת משתמש לפי מזהה
router.post("/", userController.create.bind(userController)); // יצירת משתמש חדש

export default router;
