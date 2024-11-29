const Comments = require('../models/comment_models');

const addComment = async (req, res) => {
    const { content, author, postId } = req.body;

    // אימות נתונים
    if (!content || !author || !postId) {
        return res.status(400).send("All fields (content, author, postId) are required.");
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


module.exports = {
    addComment
  };
  