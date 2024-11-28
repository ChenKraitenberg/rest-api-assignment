const express = require("express");
const bodyParser = require("body-parser");
const postRoutes = require("./routes/postRoutes");
//const commentRoutes = require("./routes/commentRoutes");

const app = express();

// Middleware
app.use(bodyParser.json());

// Routes
app.use("/posts", postRoutes);
//app.use("/comments", commentRoutes);

module.exports = app;
