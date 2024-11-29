const express = require("express");
const router = express.Router();
const postsController = require("../controllers/postsController");

// נתיב להוספת פוסט חדש
router.post("/", postsController.addPost);

// נתיב לקבלת כל הפוסטים
router.get("/", postsController.getAllPosts);

// נתיב לקבלת פוסט לפי המזהה
router.get("/:id", postsController.getPostById);

// נתיב לקבלת פוסט לפי השולח
router.get("/owner/:owner", postsController.getPostBySender);

// נתיב לעדכון פוסט לפי המזהה
router.put("/:id", postsController.updatePost);

module.exports = router;
