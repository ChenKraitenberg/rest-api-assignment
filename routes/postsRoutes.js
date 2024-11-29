const express = require("express");
const router = express.Router();
const postsController = require("../controllers/postsController");

// נתיב להוספת פוסט חדש
router.post("/", postsController.addPost);

// נתיב לבדיקה שהנתיב הראשי לפוסטים פעיל
// router.get("/", (req, res) => {
//   res.send("Posts route works!");
// });

router.get("/", postsController.getPosts);

// נתיב לקבלת כל הפוסטים
router.get("/", postsController.getAllPosts);

module.exports = router;
