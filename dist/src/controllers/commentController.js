"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const comment_models_1 = __importDefault(require("../models/comment_models"));
const baseController_1 = __importDefault(require("./baseController"));
const commentsController = (0, baseController_1.default)(comment_models_1.default);
exports.default = commentsController;
//# sourceMappingURL=commentController.js.map