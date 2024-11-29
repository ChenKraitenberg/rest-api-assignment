const Comments = require("../models/comment_models");

const addComment = async (req, res) => {
  const { content, author, postId } = req.body;

  // אימות נתונים
  if (!content || !author || !postId) {
    return res
      .status(400)
      .send("All fields (content, author, postId) are required.");
  }

  console.log(req.body);

  try {
    // יצירת התגובה, אין צורך לספק commentId כי הוא יווצר אוטומטית
    const comment = await Comments.create({ content, author, postId });
    res.status(201).send(comment);
  } catch (err) {
    res.status(400).send(err.message);
  }
};

const getAllComments = async (req, res) => {
  try {
    const comments = await Comments.find();
    res.status(200).send(comments);
  } catch (err) {
    res.status(400).send(err.message);
  }
};

const getCommentsByPostId = async (req, res) => {
  try {
    const comments = await Comments.find({ postId: req.params.postId });
    if (!comments) {
      return res.status(404).send("Comments not found");
    }
    res.status(200).send(comments);
  } catch (err) {
    res.status(400).send(err.message);
  }
};

const updateComment = async (req, res) => {
  try {
    const comment = await Comments.findByIdAndUpdate(
      req.params.commentId,
      req.body,
      {
        new: true,
        runValidators: true,
      }
    );
    if (!comment) {
      return res.status(404).send("Comment not found");
    }
    res.status(200).send(comment);
  } catch (err) {
    res.status(400).send(err.message);
  }
};

const deleteComment = async (req, res) => {
    try {
        const comment = await Comments.findByIdAndDelete(req.params.commentId);
        if (!comment) {
        return res.status(404).send("Comment not found");
        }
        res.status(200).send("Comment deleted");
    } catch (err) {
        res.status(400).send(err.message);
    }
    };

module.exports = {
  addComment,
  getAllComments,
  getCommentsByPostId,
  updateComment,
  deleteComment,
};
