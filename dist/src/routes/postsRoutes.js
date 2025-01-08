"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const router = express_1.default.Router();
const postsController_1 = __importDefault(require("../controllers/postsController"));
router.get("/", postsController_1.default.getAll.bind(postsController_1.default));
router.get("/:id", (req, res) => {
    postsController_1.default.getById(req, res);
});
//router.post("/", postController.create.bind(postController));
router.post("/:userId", postsController_1.default.create.bind(postsController_1.default));
exports.default = router;
//# sourceMappingURL=postsRoutes.js.map