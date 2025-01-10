"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const router = express_1.default.Router();
const postsController_1 = __importDefault(require("../controllers/postsController"));
const authController_1 = require("../controllers/authController");
// get all posts
router.get("/", postsController_1.default.getAll.bind(postsController_1.default));
// get post by id
router.get("/:id", (req, res) => {
    postsController_1.default.getById(req, res);
});
// create post for user by id
router.post("/:userId", authController_1.authMiddleware, postsController_1.default.create.bind(postsController_1.default));
// create post
router.post("/", authController_1.authMiddleware, postsController_1.default.create.bind(postsController_1.default));
// update post
router.put("/:id", postsController_1.default.update.bind(postsController_1.default));
// delete post
router.delete("/:id", authController_1.authMiddleware, postsController_1.default.delete.bind(postsController_1.default));
exports.default = router;
//# sourceMappingURL=postsRoutes.js.map