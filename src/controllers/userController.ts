import userModel, {iUser} from "../models/user_model";
import createController from "./baseController";

const userController = createController<iUser>(userModel);

export default userController;
