"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.BaseController = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
class BaseController {
    constructor(model) {
        this.model = model;
    }
    getAll(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const ownerFilter = req.query.owner;
                if (ownerFilter) {
                    if (typeof ownerFilter !== "string") {
                        return res.status(400).send("Invalid owner parameter type");
                    }
                    try {
                        // אם זה נראה כמו ObjectId (24 תווים הקסדצימליים)
                        if (ownerFilter.length === 24 &&
                            /^[0-9a-fA-F]{24}$/.test(ownerFilter)) {
                            new mongoose_1.default.Types.ObjectId(ownerFilter);
                        }
                        // בכל מקרה (בין אם ObjectId או מחרוזת רגילה), נחפש באופן ישיר
                        const items = yield this.model.find({ owner: ownerFilter });
                        // אם לא נמצאו תוצאות, נחזיר 400
                        if (items.length === 0) {
                            return res.status(400).send("Invalid owner ID format");
                        }
                        return res.status(200).send(items);
                    }
                    catch (err) {
                        return res.status(400).send("Invalid owner ID format");
                    }
                }
                const items = yield this.model.find();
                return res.status(200).send(items);
            }
            catch (err) {
                console.log(err);
                return res.status(400).send(err);
            }
        });
    }
    getById(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const id = req.params.id;
            try {
                const post = yield this.model.findById(id);
                if (post === null) {
                    return res.status(404).send("Post not found");
                }
                else {
                    return res.status(200).send(post);
                }
            }
            catch (err) {
                console.log(err);
                res.status(400).send(err);
            }
        });
    }
    create(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            console.log(req.body);
            try {
                const post = yield this.model.create(req.body);
                res.status(201).send(post);
            }
            catch (err) {
                res.status(400);
                res.send(err);
            }
        });
    }
    /*  async update(req: Request, res: Response) {
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
  */
    update(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const id = req.params.id;
            try {
                const post = yield this.model.findByIdAndUpdate(id, req.body, {
                    new: true,
                    runValidators: true,
                });
                if (post === null) {
                    return res.status(404).send("Post not found");
                }
                else {
                    return res.status(200).send(post);
                }
            }
            catch (err) {
                console.log(err);
                res.status(400).send(err);
            }
        });
    }
    delete(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const id = req.params.id;
            try {
                const post = yield this.model.findByIdAndDelete(id);
                if (post === null) {
                    return res.status(404).send("Post not found");
                }
                else {
                    return res.status(200).send(post);
                }
            }
            catch (err) {
                console.log(err);
                res.status(400);
                res.send(err);
            }
        });
    }
}
exports.BaseController = BaseController;
const createController = (model) => {
    return new BaseController(model);
};
exports.default = createController;
//# sourceMappingURL=baseController.js.map