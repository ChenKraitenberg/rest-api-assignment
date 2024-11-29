const express = require("express");
const router = express.Router();
const commentController = require("../controllers/commentController");

//create a new comment
router.post("/", commentController.addComment);

module.exports = router;