const express = require("express");
const bodyParser = require("body-parser");
const postsRoutes = require("./routes/postsRoutes");
//const commentRoutes = require("./routes/commentRoutes");

const app = express();

// Middleware
app.use(bodyParser.json());

// Routes
app.use("/posts", postsRoutes);


module.exports = app;
