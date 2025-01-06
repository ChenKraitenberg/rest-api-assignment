"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const router = express_1.default.Router();
const commentController_1 = __importDefault(require("../controllers/commentController"));
router.get("/", commentController_1.default.getAll.bind(commentController_1.default));
router.get("/:id", (req, res) => {
    commentController_1.default.getById(req, res);
});
router.post("/", commentController_1.default.create.bind(commentController_1.default));
exports.default = router;
//# sourceMappingURL=commentsRoutes.js.map