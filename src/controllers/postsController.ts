import { Request, Response } from "express";
import Posts from "../models/posts_models";

export const addPost = async (req: Request, res: Response): Promise<void> => {
  console.log(req.body);
  try {
    const post = await Posts.create(req.body);
    res.status(201).send(post);
  } catch (err: unknown) {
    if (err instanceof Error) {
      res.status(400).send(err.message);
    } else {
      res.status(400).send("An unexpected error occurred.");
    }
  }
};

// Returns all posts in the database as a JSON array
export const getAllPosts = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const posts = await Posts.find({});
    res.status(200).send(posts);
  } catch (err: unknown) {
    if (err instanceof Error) {
      res.status(400).send(err.message);
    } else {
      res.status(400).send("An unexpected error occurred.");
    }
  }
};

export const getPostById = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const post = await Posts.findById(req.params.id);
    if (!post) {
      res.status(404).send("Post not found");
      return;
    }
    res.status(200).send(post);
  } catch (err: unknown) {
    if (err instanceof Error) {
      res.status(400).send(err.message);
    } else {
      res.status(400).send("An unexpected error occurred.");
    }
  }
};

export const getPostBySender = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const post = await Posts.find({ owner: req.params.owner });
    if (!post.length) {
      res.status(404).send("Post not found");
      return;
    }
    res.status(200).send(post);
  } catch (err: unknown) {
    if (err instanceof Error) {
      res.status(400).send(err.message);
    } else {
      res.status(400).send("An unexpected error occurred.");
    }
  }
};

export const updatePost = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const post = await Posts.findByIdAndUpdate(
      req.params.id, // Post ID
      req.body, // New data
      {
        new: true, // Return updated document
        runValidators: true, // Validate schema
      }
    );

    if (!post) {
      res.status(404).json({ message: "Post not found" });
      return;
    }

    res.status(200).json(post);
  } catch (err: unknown) {
    if (err instanceof Error) {
      res.status(500).json({ message: err.message });
    } else {
      res.status(500).json({ message: "An unexpected error occurred." });
    }
  }
};
