import express from "express";
const router = express.Router();
import commentsController from "../controllers/commentController";

router.get("/", commentsController.getAll.bind(commentsController));

router.get("/:id", (req, res) => {
    commentsController.getById(req, res);
});

router.post("/", commentsController.create.bind(commentsController));

export default router;