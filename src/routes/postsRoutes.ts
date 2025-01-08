import express from "express";
const router = express.Router();
import postController from "../controllers/postsController";
import { authMiddleware } from "../controllers/authController";

// get all posts
router.get("/", postController.getAll.bind(postController));

// get post by id
router.get("/:id", (req, res) => {
  postController.getById(req, res);
});

// create post for user by id
router.post("/:userId", authMiddleware, postController.create.bind(postController));

// update post
router.put("/:id", postController.update.bind(postController));

// delete post
router.delete("/:id", authMiddleware, postController.delete.bind(postController));

export default router;
