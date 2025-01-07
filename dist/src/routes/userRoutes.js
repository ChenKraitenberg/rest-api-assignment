"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const router = express_1.default.Router();
const userController_1 = __importDefault(require("../controllers/userController"));
//import authController from "../controllers/auth_controller";
//router.post("/register", authController.register);
//router.post("/login", authController.login);
//router.post("/logout", authController.logout);
//router.post("/refresh", authController.refresh);
router.get("/", userController_1.default.getAll.bind(userController_1.default)); // שליפת כל המשתמשים
router.get("/:id", userController_1.default.getById.bind(userController_1.default)); // שליפת משתמש לפי מזהה
router.post("/", userController_1.default.create.bind(userController_1.default)); // יצירת משתמש חדש
exports.default = router;
//# sourceMappingURL=userRoutes.js.map