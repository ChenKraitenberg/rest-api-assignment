import { Request, Response } from "express";
import { Model } from "mongoose";
import mongoose from "mongoose";

export class BaseController<T> {
  model: Model<T>;
  constructor(model: Model<T>) {
    this.model = model;
  }

  async getAll(req: Request, res: Response) {
    try {
      const ownerFilter = req.query.owner;
      if (ownerFilter) {
        if (typeof ownerFilter !== "string") {
          return res.status(400).send("Invalid owner parameter type");
        }

        try {
          // אם זה נראה כמו ObjectId (24 תווים הקסדצימליים)
          if (
            ownerFilter.length === 24 &&
            /^[0-9a-fA-F]{24}$/.test(ownerFilter)
          ) {
            new mongoose.Types.ObjectId(ownerFilter);
          }

          // בכל מקרה (בין אם ObjectId או מחרוזת רגילה), נחפש באופן ישיר
          const items = await this.model.find({ owner: ownerFilter });

          // אם לא נמצאו תוצאות, נחזיר 400
          if (items.length === 0) {
            return res.status(400).send("Invalid owner ID format");
          }

          return res.status(200).send(items);
        } catch (err) {
          return res.status(400).send("Invalid owner ID format");
        }
      }

      const items = await this.model.find();
      return res.status(200).send(items);
    } catch (err) {
      console.log(err);
      return res.status(400).send(err);
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
      const post = await this.model.findByIdAndUpdate(id, req.body, {
        new: true,
        runValidators: true,
      });
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
