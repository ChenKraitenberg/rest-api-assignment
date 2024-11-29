const express = require("express");
const router = express.Router();
const commentController = require("../controllers/commentController");

//create a new comment
router.post("/", commentController.addComment);
//get all comments
router.get("/", commentController.getAllComments);

module.exports = router;