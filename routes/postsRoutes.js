const express = require("express");
const router = express.Router();
const postsController = require("../controllers/postsController");

// נתיב להוספת פוסט חדש
router.post("/", postsController.addPost);

// נתיב לקבלת כל הפוסטים
router.get("/", postsController.getAllPosts);

// נתיב לקבלת פוסט לפי המזהה
router.get("/:id", postsController.getPostById);

module.exports = router;
