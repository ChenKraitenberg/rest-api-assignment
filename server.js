require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const app = express();

// Middleware
app.use(express.json());

// משתני סביבה
const PORT = process.env.PORT;

// חיבור ל-MongoDB
mongoose
  .connect(process.env.DB_CONNECT)
  .then(() => {
    console.log("Connected to MongoDB");

    // הפעלת השרת
    app.listen(PORT, () => {
      console.log(`Server running on http://localhost:${PORT}`);
    });
  })
  .catch((err) => {
    console.error("Failed to connect to MongoDB", err);
  });

// תגובת ברירת מחדל לנתיב הראשי
app.get("/", (req, res) => {
  res.send("welcome!");
});

// נתיבים לפוסטים
const postsRoutes = require("./routes/postsRoutes");
app.use("/posts", postsRoutes); // בקשות שמתחילות ב-/posts ינותבו ל-postsRoutes

// נתיבים לתגובות
const commentRoutes = require("./routes/commentsRoutes");
app.use("/comments", commentRoutes); // בקשות שמתחילות ב-/comments ינותבו ל-commentRoutes