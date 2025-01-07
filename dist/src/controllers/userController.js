"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const user_model_1 = __importDefault(require("../models/user_model"));
const baseController_1 = __importDefault(require("./baseController"));
// יצירת בקר בסיסי עם BaseController
const userController = (0, baseController_1.default)(user_model_1.default);
// ייצוא ישיר של הבקר
exports.default = userController;
//# sourceMappingURL=userController.js.map