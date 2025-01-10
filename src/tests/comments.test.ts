import request from "supertest";
import initApp from "../server";
import mongoose from "mongoose";
import commentsModel from "../models/comment_models";
import userModel from "../models/user_model";
import { Express } from "express";

// ---------- Global Variables ----------
let app: Express;
const testUser = {
  email: `test_${Date.now()}@user.com`, // אימייל שונה בכל הרצה
  password: "123456",
};
let accessToken: string;
let commentId = "";

// מחרוזות רגילות, בהתאמה לסכימה (string) של comment_models.ts
const testComment = {
  comment: "Test title",
  postId: "erwtgwerbt245t4256b345",
  owner: "Yossi",
};

const invalidComment = {
  // חסר postId ו-owner => אמור להיות לא תקין
  comment: "Test title",
};

// ---------- Before/After ----------
beforeAll(async () => {
  app = await initApp();

  // מוחקים את כל ה-Comments
  await commentsModel.deleteMany();

  // מוחקים את המשתמש שכבר קיים עם אותו מייל (או מוחקים את כולם)
  await userModel.deleteMany({ email: testUser.email });

  //  נרשמים
  const registerRes = await request(app).post("/auth/register").send(testUser);
  expect(registerRes.statusCode).toBe(200);

  // מתחברים
  const loginRes = await request(app).post("/auth/login").send(testUser);
  expect(loginRes.statusCode).toBe(200);

  accessToken = loginRes.body.accessToken;
});

afterAll(async () => {
  await mongoose.connection.close();
});

// ---------- Tests ----------
describe("Comments test suite", () => {
  test("Comment test get all", async () => {
    const response = await request(app).get("/comments");
    expect(response.statusCode).toBe(200);
    expect(response.body).toHaveLength(0);
  });

  test("Test Adding new comment", async () => {
    const response = await request(app)
      .post("/comments")
      // שליחת הטוקן כדי שה־authMiddleware יעבור
      .set({ authorization: `JWT ${accessToken}` })
      .send(testComment);

    // מצפים ל־201 אם הכל תקין
    expect(response.statusCode).toBe(201);

    // בודקים שהתוכן שחזר הוא כמו שציפינו
    expect(response.body.comment).toBe(testComment.comment);
    expect(response.body.postId).toBe(testComment.postId);
    expect(response.body.owner).toBe(testComment.owner);

    // שומרים את ה־_id שהוחזר לצורך הבדיקות הבאות
    commentId = response.body._id;
  });

  // גם כאן צריך לשלוח טוקן כי גם POST זה דורש authMiddleware
  test("Test Adding invalid comment", async () => {
    const response = await request(app)
      .post("/comments")
      .set({ authorization: `JWT ${accessToken}` })
      .send(invalidComment);

    // מצפים שלא יהיה 201 כי חסרים שדות חובה
    expect(response.statusCode).not.toBe(201);
  });

  test("Test get all comments after adding", async () => {
    const response = await request(app).get("/comments");
    expect(response.statusCode).toBe(200);
    // כעת אמור להיות 1 כי הוספנו פוסט אחד מוצלח
    expect(response.body).toHaveLength(1);
  });

  test("Test get comment by owner", async () => {
    const response = await request(app).get(
      "/comments?owner=" + testComment.owner
    );
    expect(response.statusCode).toBe(200);
    expect(response.body).toHaveLength(1);
    expect(response.body[0].owner).toBe(testComment.owner);
  });

  test("Test get comment by id", async () => {
    const response = await request(app).get("/comments/" + commentId);

    expect(response.statusCode).toBe(200);
    expect(response.body._id).toBe(commentId);
  });

  test("Test get comment by id fail", async () => {
    const response = await request(app).get(
      "/comments/67447b032ce3164be7c4412d"
    );

    expect(response.statusCode).toBe(404);
  });
});
