import express from "express";
const router = express.Router();
import commentsController from "../controllers/commentController";

// get all comments
router.get("/", commentsController.getAll.bind(commentsController));

// get comment by id
router.get("/:id", (req, res) => {
  commentsController.getById(req, res);
});

// create comment
router.post("/", commentsController.create.bind(commentsController));

// update comment
router.put("/:id", commentsController.update.bind(commentsController));

// delete comment
router.delete("/:id", commentsController.delete.bind(commentsController));

export default router;
