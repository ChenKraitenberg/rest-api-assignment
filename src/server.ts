import express, { Express } from "express";
import bodyParser from "body-parser";
const app = express();
import dotenv from "dotenv";
dotenv.config();
import mongoose from "mongoose";
import postsRoutes from "./routes/postsRoutes";
import commentsRoutes from "./routes/commentsRoutes";
import authRoutes from "./routes/authRoutes";
import userRoutes from "./routes/userRoutes";
import swaggerJsDoc from "swagger-jsdoc";
import swaggerUI from "swagger-ui-express";
import e from "express";

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.get("/", (req, res) => {
  res.send("Welcome");
});

app.use("/posts", postsRoutes);
app.use("/comments", commentsRoutes);
app.use("/auth", authRoutes);
app.use("/users", userRoutes);

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
const specs = swaggerJsDoc(options);
app.use("/api-docs", swaggerUI.serve, swaggerUI.setup(specs));

const initApp = (): Promise<Express> => {
  return new Promise<Express>(async (resolve, reject) => {
    try {
      const dbUri = process.env.DB_CONNECT;

      if (!dbUri) {
        const error = new Error("DB_CONNECT is not defined");
        //console.error(error.message);
        reject(error);
        return;
      }

      // אם כבר מחובר, אין צורך להתחבר שוב
      if (mongoose.connection.readyState === 1) {
        resolve(app);
        return;
      }

      // אם יש חיבור בתהליך, נסגור אותו
      if (mongoose.connection.readyState === 2) {
        await mongoose.connection.close();
      }

      await mongoose.connect(dbUri);
      console.log("Connected to the database");
      resolve(app);
    } catch (err) {
      console.error("Error connecting to the database:", err);
      reject(err);
    }
  });
};

export default initApp;
