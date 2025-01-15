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
const swagger_jsdoc_1 = __importDefault(require("swagger-jsdoc"));
const swagger_ui_express_1 = __importDefault(require("swagger-ui-express"));
app.use(body_parser_1.default.json());
app.use(body_parser_1.default.urlencoded({ extended: true }));
//app.get("/", (req, res) => {
//res.send("Welcome");
//});
app.use("/posts", postsRoutes_1.default);
app.use("/comments", commentsRoutes_1.default);
app.use("/auth", authRoutes_1.default);
app.use("/users", userRoutes_1.default);
const options = {
    definition: {
        openapi: "3.0.0",
        info: {
            title: "Web Dev 2025 REST API",
            version: "1.0.0",
            description: "REST server including authentication using JWT",
        },
        servers: [{ url: "http://localhost:3000" }],
    },
    apis: ["./src/routes/*.ts"],
};
const specs = (0, swagger_jsdoc_1.default)(options);
app.use("/api-docs", swagger_ui_express_1.default.serve, swagger_ui_express_1.default.setup(specs));
// initApp
const initApp = () => {
    return new Promise((resolve, reject) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const dbUri = process.env.DB_CONNECT;
            if (!dbUri) {
                const error = new Error("DB_CONNECT is not defined");
                //console.error(error.message);
                reject(error);
                return;
            }
            // אם כבר מחובר, אין צורך להתחבר שוב
            if (mongoose_1.default.connection.readyState === 1) {
                resolve(app);
                return;
            }
            // אם יש חיבור בתהליך, נסגור אותו
            if (mongoose_1.default.connection.readyState === 2) {
                yield mongoose_1.default.connection.close();
            }
            yield mongoose_1.default.connect(dbUri);
            console.log("Connected to the database");
            resolve(app);
        }
        catch (err) {
            console.error("Error connecting to the database:", err);
            reject(err);
        }
    }));
};
exports.default = initApp;
//# sourceMappingURL=server.js.map