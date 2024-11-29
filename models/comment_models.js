const mongoose = require("mongoose");

const commentSchema = new mongoose.Schema({
    commentId: {type: mongoose.Schema.Types.ObjectId, default: () => new mongoose.Types.ObjectId()}, // מזהה ייחודי לתגובה
    // ייווצר אוטומטית
    postId: { type: mongoose.Schema.Types.ObjectId, ref: "Post",required: true},
    // מזהה הפוסט שאליו שייכת התגובה
    // שם המודל של הפוסט
      
    content: { type: String, required: true},// תוכן התגובה
    author: {type: String},// מחבר התגובה
    createdAt: { type: Date, default: Date.now }
});

    const Comments = mongoose.model("Comments", commentSchema);

    module.exports = Comments;