require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const app = express();

// Middleware
app.use(express.json());

// משתני סביבה
const PORT = process.env.PORT;
const DB_CONNECT = process.env.DB_CONNECT;

// חיבור ל-MongoDB
mongoose
  .connect("mongodb://localhost:27017/mydb")
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
