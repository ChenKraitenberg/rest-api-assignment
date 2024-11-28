require("dotenv").config();
const mongoose = require("mongoose");
const app = require("./app");

const PORT = process.env.PORT;
const DB_CONNECT = process.env.DB_CONNECT;

// חיבור ל-MongoDB
mongoose
  .connect(DB_CONNECT, {})
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
