import userModel, { iUser } from "../models/user_model";
import createController from "./baseController";

// יצירת בקר בסיסי עם BaseController
const userController = createController<iUser>(userModel);

// ייצוא ישיר של הבקר
export default userController;
