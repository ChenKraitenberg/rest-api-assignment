import express, { Express } from "express";
import bodyParser from "body-parser";
const app = express();
import dotenv from "dotenv";
dotenv.config();
import mongoose from "mongoose";
import postsRoutes from "./routes/postsRoutes";
import commentsRoutes from "./routes/commentsRoutes";
import userRoutes from "./routes/userRoutes";

// must be implement later authRoutes , postsRoutes, commentsRoutes
// import authRoutes from "./routes/auth_routes";
// import swaggerJsDoc from "swagger-jsdoc";
// import swaggerUI from "swagger-ui-express";

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.get("/", (req, res) => {
  res.send("Welcome");
});

app.use("/posts", postsRoutes);
app.use("/comments", commentsRoutes);
app.use("/users", userRoutes);

// app.use("/auth", authRoutes); - must be implement later

const initApp = (): Promise<Express> => {
  return new Promise<Express>((resolve, reject) => {
    const dbUri = process.env.DB_CONNECT;

    // ודאי שהמשתנה DB_CONNECT קיים
    if (!dbUri) {
      console.error("Error: DB_CONNECT is not defined in the .env file");
      reject(new Error("DB_CONNECT is not defined"));
      return;
    }

    // חיבור למסד הנתונים
    mongoose
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

export default initApp;
