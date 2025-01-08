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
const authRoutes_1 = __importDefault(require("./routes/authRoutes"));
const userRoutes_1 = __importDefault(require("./routes/userRoutes"));
// must be implement later authRoutes , postsRoutes, commentsRoutes
// import authRoutes from "./routes/auth_routes";
// import swaggerJsDoc from "swagger-jsdoc";
// import swaggerUI from "swagger-ui-express";
app.use(body_parser_1.default.json());
app.use(body_parser_1.default.urlencoded({ extended: true }));
app.get("/", (req, res) => {
    res.send("Welcome");
});
app.use("/posts", postsRoutes_1.default);
app.use("/comments", commentsRoutes_1.default);
app.use("/auth", authRoutes_1.default);
app.use("/users", userRoutes_1.default);
const initApp = () => {
    return new Promise((resolve, reject) => {
        const dbUri = process.env.DB_CONNECT;
        // ודאי שהמשתנה DB_CONNECT קיים
        if (!dbUri) {
            console.error("Error: DB_CONNECT is not defined in the .env file");
            reject(new Error("DB_CONNECT is not defined"));
            return;
        }
        // חיבור למסד הנתונים
        mongoose_1.default
            .connect(dbUri)
            .then(() => {
            console.log("Connected to the database");
            resolve(app);
        })
            .catch((err) => {
            console.error("Error connecting to the database:", err);
            reject(err);
        });
    });
};
exports.default = initApp;
//# sourceMappingURL=server.js.map