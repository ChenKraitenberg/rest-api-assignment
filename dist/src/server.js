"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const body_parser_1 = __importDefault(require("body-parser"));
const app = (0, express_1.default)();
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const mongoose_1 = __importDefault(require("mongoose"));
const postsRoutes_1 = __importDefault(require("./routes/postsRoutes"));
const commentsRoutes_1 = __importDefault(require("./routes/commentsRoutes"));
// must be implement later authRoutes , postsRoutes, commentsRoutes
// import authRoutes from "./routes/auth_routes";
// import swaggerJsDoc from "swagger-jsdoc";
// import swaggerUI from "swagger-ui-express";
app.use(body_parser_1.default.json());
app.use(body_parser_1.default.urlencoded({ extended: true }));
app.use("/posts", postsRoutes_1.default);
app.use("/comments", commentsRoutes_1.default);
// app.use("/auth", authRoutes); - must be implement later
const initApp = () => {
    return new Promise((resolve, reject) => {
        const db = mongoose_1.default.connection;
        db.on("error", console.error.bind(console, "connection error:"));
        db.once("open", function () {
            console.log("Connected to the database");
        });
        mongoose_1.default
            .connect(process.env.DB_CONNECT)
            .then(() => {
            resolve(app);
        })
            .catch((err) => {
            reject(err);
        });
    });
};
exports.default = initApp;
//# sourceMappingURL=server.js.map