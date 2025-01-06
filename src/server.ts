import express, { Express } from "express";
import bodyParser from "body-parser";
const app = express();
import dotenv from "dotenv";
dotenv.config();
import mongoose from "mongoose";
import postsRoutes from "./routes/postsRoutes";
import commentsRoutes from "./routes/commentsRoutes";

// must be implement later authRoutes , postsRoutes, commentsRoutes
// import authRoutes from "./routes/auth_routes";
// import swaggerJsDoc from "swagger-jsdoc";
// import swaggerUI from "swagger-ui-express";

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use("/posts", postsRoutes);
app.use("/comments", commentsRoutes);

// app.use("/auth", authRoutes); - must be implement later

const initApp = (): Promise<Express> => {
  return new Promise<Express>((resolve, reject) => {
    const db = mongoose.connection;
    db.on("error", console.error.bind(console, "connection error:"));
    db.once("open", function () {
      console.log("Connected to the database");
    });
    mongoose
      .connect(process.env.DB_CONNECT)
      .then(() => {
        resolve(app);
      })
      .catch((err) => {
        reject(err);
      });
  });
};

export default initApp;
