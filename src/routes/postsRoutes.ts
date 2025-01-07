import express from "express";
const router = express.Router();
import postController from "../controllers/postsController";

// get all posts
router.get("/", postController.getAll.bind(postController));

// get post by id
router.get("/:id", (req, res) => {
  postController.getById(req, res);
});

// create post for user by id
router.post("/:userId", postController.create.bind(postController));

// update post
router.put("/:id", postController.update.bind(postController));

// delete post
router.delete("/:id", postController.delete.bind(postController));

export default router;
