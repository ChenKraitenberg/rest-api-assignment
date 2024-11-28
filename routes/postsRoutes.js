const express = require("express");
const router = express.Router();
const postsController = require("../controllers/postsController");

// נתיב להוספת פוסט חדש
router.post("/", postsController.addPost);

// נתיב לבדיקה שהנתיב הראשי לפוסטים פעיל
router.get("/", (req, res) => {
  res.send("Posts route works!");
});

module.exports = router;
