require("dotenv").config();
const mongoose = require("mongoose");
const app = require("./app");

const PORT = process.env.PORT;

mongoose
  .connect(process.env.MONGO_URI, {})
  .then(() => {
    console.log("Connected to MongoDB");
    app.listen(PORT, () => {
      console.log(`Server running on http://localhost:${PORT}`);
    });
  })
  .catch((err) => console.error("Failed to connect to MongoDB", err));
