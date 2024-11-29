const express = require("express");
const router = express.Router();
const commentController = require("../controllers/commentController");

//create a new comment
router.post("/", commentController.addComment);
//get all comments
router.get("/", commentController.getAllComments);
//get comments by post id
router.get("/:postId", commentController.getCommentsByPostId);
//update comment
router.put("/:commentId", commentController.updateComment);
//delete comment
router.delete("/:commentId", commentController.deleteComment);

module.exports = router;
