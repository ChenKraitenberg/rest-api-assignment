import { Request, Response } from "express";
import { Model } from "mongoose";
// implements - getAll, getById, create, update, delete
export class BaseController<T> {
  model: Model<T>;
  constructor(model: Model<T>) {
    this.model = model;
  }

  // פונקציה שמחזירה את כל המופעים מהדאטה בייס
  async getAll(req: Request, res: Response) {
    const ownerFilter = req.query.owner;
    try {
      if (ownerFilter) {
        const posts = await this.model.find({ owner: ownerFilter });
        res.status(200).send(posts);
      } else {
        const posts = await this.model.find();
        res.status(200).send(posts);
      }
    } catch (err) {
      console.log(err);
      res.status(400).send(err);
    }
  }

  async getById(req: Request, res: Response) {
    const id = req.params.id;
    try {
      const post = await this.model.findById(id);
      if (post === null) {
        return res.status(404).send("Post not found");
      } else {
        return res.status(200).send(post);
      }
    } catch (err) {
      console.log(err);
      res.status(400).send(err);
    }
  }

  async create(req: Request, res: Response) {
    console.log(req.body);
    try {
      const post = await this.model.create(req.body);
      res.status(201).send(post);
    } catch (err) {
      res.status(400);
      res.send(err);
    }
  }

  async update(req: Request, res: Response) {
    const id = req.params.id;
    try {
      const post = await this.model.findByIdAndUpdate(id, req.body);
      if (post === null) {
        return res.status(404).send("Post not found");
      } else {
        return res.status(200).send(post);
      }
    } catch (err) {
      console.log(err);
      res.status(400);
      res.send(err);
    }
  }

  async delete(req: Request, res: Response) {
    const id = req.params.id;
    try {
      const post = await this.model.findByIdAndDelete(id);
      if (post === null) {
        return res.status(404).send("Post not found");
      } else {
        return res.status(200).send(post);
      }
    } catch (err) {
      console.log(err);
      res.status(400);
      res.send(err);
    }
  }
}

const createController = <T>(model: Model<T>) => {
  return new BaseController(model);
};

export default createController;
