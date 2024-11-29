const mongoose = require("mongoose");

const postSchema = new mongoose.Schema({
  title: String,
  content: String,
  owner: String,
});

const Posts = mongoose.model("posts", postSchema);
module.exports = Posts;
