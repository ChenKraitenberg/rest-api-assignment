import { Router } from "express";
import * as commentController from "../controllers/commentController";

const router: Router = Router();

// Create a new comment
router.post("/", commentController.addComment);

// Get all comments
router.get("/", commentController.getAllComments);

// Get comments by post ID
router.get("/:postId", commentController.getCommentsByPostId);

// Update comment
router.put("/:commentId", commentController.updateComment);

// Delete comment
router.delete("/:commentId", commentController.deleteComment);

export default router;
