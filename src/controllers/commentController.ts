import commentsModel, {iComment} from "../models/comment_models";
import createController from "./baseController";
//import { Request, Response } from "express";

const commentsController = createController<iComment>(commentsModel);

export default commentsController;