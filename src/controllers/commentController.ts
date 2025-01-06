import { Request, Response } from "express";
import Comments from "../models/comment_models";

export const addComment = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { content, author, postId } = req.body;

  if (!content || !author || !postId) {
    res.status(400).send("All fields (content, author, postId) are required.");
    return;
  }

  console.log(req.body);

  try {
    const comment = await Comments.create({ content, author, postId });
    res.status(201).send(comment);
  } catch (err: unknown) {
    if (err instanceof Error) {
      res.status(400).send(err.message);
    } else {
      res.status(400).send("An unexpected error occurred.");
    }
  }
};

export const getAllComments = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const comments = await Comments.find();
    res.status(200).send(comments);
  } catch (err: unknown) {
    if (err instanceof Error) {
      res.status(400).send(err.message);
    } else {
      res.status(400).send("An unexpected error occurred.");
    }
  }
};

export const getCommentsByPostId = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const comments = await Comments.find({ postId: req.params.postId });
    if (!comments.length) {
      res.status(404).send("Comments not found");
      return;
    }
    res.status(200).send(comments);
  } catch (err: unknown) {
    if (err instanceof Error) {
      res.status(400).send(err.message);
    } else {
      res.status(400).send("An unexpected error occurred.");
    }
  }
};

export const updateComment = async (
  req: Request,
  res: Response
): Promise<void> => {
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
      res.status(404).send("Comment not found");
      return;
    }
    res.status(200).send(comment);
  } catch (err: unknown) {
    if (err instanceof Error) {
      res.status(400).send(err.message);
    } else {
      res.status(400).send("An unexpected error occurred.");
    }
  }
};

export const deleteComment = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const comment = await Comments.findByIdAndDelete(req.params.commentId);
    if (!comment) {
      res.status(404).send("Comment not found");
      return;
    }
    res.status(200).send("Comment deleted");
  } catch (err: unknown) {
    if (err instanceof Error) {
      res.status(400).send(err.message);
    } else {
      res.status(400).send("An unexpected error occurred.");
    }
  }
};
