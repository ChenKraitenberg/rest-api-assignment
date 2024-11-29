const Posts = require("../models/posts_models");

const addPost = async (req, res) => {
  console.log(req.body);
  try {
    const post = await Posts.create(req.body);
    res.status(201).send(post);
  } catch (err) {
    res.status(400).send(err.message);
  }
};

//Returns all posts in the database as a JSON array
const getAllPosts = async (req, res) => {
  try {
    const posts = await Posts.find({});
    res.status(200).send(posts);
  } catch (err) {
    res.status(400).send(err.message);
  }
};

module.exports = { addPost, getAllPosts};
