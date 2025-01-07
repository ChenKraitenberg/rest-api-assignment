import commentsModel, { iComment } from "../models/comment_models";
import createController from "./baseController";

const commentsController = createController<iComment>(commentsModel);

export default commentsController;
