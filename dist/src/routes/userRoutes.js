"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const router = express_1.default.Router();
const userController_1 = __importDefault(require("../controllers/userController"));
const authController_1 = require("../controllers/authController");
router.get("/", userController_1.default.getAll.bind(userController_1.default)); // שליפת כל המשתמשים
router.get("/:id", userController_1.default.getById.bind(userController_1.default)); // שליפת משתמש לפי מזהה
router.post("/", authController_1.authMiddleware, userController_1.default.create.bind(userController_1.default)); // יצירת משתמש חדש
router.put("/:id", userController_1.default.update.bind(userController_1.default)); // עדכון משתמש קיים
router.delete("/:id", authController_1.authMiddleware, userController_1.default.delete.bind(userController_1.default)); // מחיקת משתמש קיים
exports.default = router;
//# sourceMappingURL=userRoutes.js.map