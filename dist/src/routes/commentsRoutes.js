"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const router = express_1.default.Router();
const commentController_1 = __importDefault(require("../controllers/commentController"));
const authController_1 = require("../controllers/authController");
// get all comments
router.get("/", commentController_1.default.getAll.bind(commentController_1.default));
// get comment by id
router.get("/:id", (req, res) => {
    commentController_1.default.getById(req, res);
});
// create comment
router.post("/", authController_1.authMiddleware, commentController_1.default.create.bind(commentController_1.default));
// update comment
router.put("/:id", commentController_1.default.update.bind(commentController_1.default));
// delete comment
router.delete("/:id", authController_1.authMiddleware, commentController_1.default.delete.bind(commentController_1.default));
exports.default = router;
//# sourceMappingURL=commentsRoutes.js.map