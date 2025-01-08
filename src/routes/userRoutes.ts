import exspress from 'express';
const router = exspress.Router();
import userController from '../controllers/userController';
import { authMiddleware } from '../controllers/authController';

router.get("/", userController.getAll.bind(userController)); // שליפת כל המשתמשים
router.get("/:id", userController.getById.bind(userController)); // שליפת משתמש לפי מזהה
router.post("/",authMiddleware, userController.create.bind(userController)); // יצירת משתמש חדש
router.put("/:id", userController.update.bind(userController)); // עדכון משתמש קיים
router.delete("/:id", authMiddleware, userController.delete.bind(userController)); // מחיקת משתמש קיים

export default router;