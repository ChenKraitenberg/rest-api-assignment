import request from "supertest";
import initApp from "../server";
import mongoose from "mongoose";
import userModel from "../models/user_model";
import { iUser } from "../models/user_model";
import { Express } from "express";

// ---------- Global Variables ----------
let app: Express;
let accessToken: string;

// משתמש שנרשם מראש רק כדי לייצר טוקן משימוש ב-/auth/login
const authUser: iUser = {
  email: "authuser@test.com",
  password: "123456",
};

// המשתמש החדש שניצור דרך /users
const newUser: iUser = {
  email: "newuser@test.com",
  password: "654321",
};

// ---------- Before/After ----------
beforeAll(async () => {
  app = await initApp();

  // מנקים את אוסף המשתמשים (כדי למנוע דופליקטים וכד')
  await userModel.deleteMany();

  // 1. רושמים משתמש דרך /auth/register
  const registerRes = await request(app).post("/auth/register").send(authUser);
  expect(registerRes.statusCode).toBe(200);

  // 2. מתחברים כדי להשיג accessToken
  const loginRes = await request(app).post("/auth/login").send(authUser);
  expect(loginRes.statusCode).toBe(200);
  expect(loginRes.body).toHaveProperty("accessToken");
  accessToken = loginRes.body.accessToken;
});

afterAll(async () => {
  await mongoose.connection.close();
});

// ---------- Tests ----------
describe("User test suite", () => {
  test("GET /users (should return an array - currently has 1 user from auth/register)", async () => {
    const res = await request(app).get("/users");
    expect(res.statusCode).toBe(200);
    // אנו מניחים שהמשתמש שנרשם קודם (authUser) נשמר גם ב־userModel
    // אם זה נכון, מצפים שיש לפחות 1
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBe(1);
  });

  test("POST /users without token => should fail (401 or 400)", async () => {
    const res = await request(app).post("/users").send(newUser); // ללא Authorization header
    expect(res.statusCode).not.toBe(201);
  });

  test("POST /users with valid token => should succeed", async () => {
    const res = await request(app)
      .post("/users")
      .set({ authorization: "JWT " + accessToken })
      .send(newUser);
    expect(res.statusCode).toBe(201);

    // בדיקה שהמשתמש שנוצר חזר עם email
    expect(res.body.email).toBe(newUser.email);
    // שומרים את ה־_id שחזר למשתנה
    newUser._id = res.body._id;
  });

  test("GET /users => should now have 2 users", async () => {
    const res = await request(app).get("/users");
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBe(2);
  });

  test("GET /users/:id => should return the newly created user", async () => {
    const res = await request(app).get(`/users/${newUser._id}`);
    expect(res.statusCode).toBe(200);
    expect(res.body.email).toBe(newUser.email);
  });

  test("PUT /users/:id => should update user (no token required in your routes)", async () => {
    const updatedEmail = "updated@test.com";
    const res = await request(app)
      .put(`/users/${newUser._id}`)
      .send({ email: updatedEmail });
    expect(res.statusCode).toBe(200);

    // לפי ה-BaseController שלך, הוא מחזיר את הרשומה לפני העדכון או אחרי העדכון?
    // שימי לב שב-findByIdAndUpdate אפשר להוסיף { new: true } אם רוצים את הערך המעודכן.
    // כברירת מחדל זה מחזיר את הקודם.
    // אם ברצונך לבדוק את הערך המעודכן, כנראה תצטרכי
    // או לעדכן את ה-controller או לבצע GET נוסף.

    // בודקים האם החזיר post === null?
    // לפי הקוד, זה יחזיר 404 אם לא נמצא, 200 אם נמצא
    // אם רוצים ממש לוודא שה-email התעדכן,
    // אפשר לבצע GET נוסף:
    const getRes = await request(app).get(`/users/${newUser._id}`);
    expect(getRes.statusCode).toBe(200);
    expect(getRes.body.email).toBe(updatedEmail);

    // נשמור את הערך המעודכן ב- newUser
    newUser.email = updatedEmail;
  });

  test("DELETE /users/:id without token => should fail", async () => {
    const res = await request(app).delete(`/users/${newUser._id}`);
    // מצפים ללא token => authMiddleware נכשל => לא 200
    expect(res.statusCode).not.toBe(200);
  });

  test("DELETE /users/:id with token => should succeed", async () => {
    const res = await request(app)
      .delete(`/users/${newUser._id}`)
      .set({ authorization: "JWT " + accessToken });
    expect(res.statusCode).toBe(200);
  });

  test("GET /users => should now have only 1 user again", async () => {
    const res = await request(app).get("/users");
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBe(1);
  });

  test("GET /users/:id => should be 404 if we try to get the deleted user", async () => {
    const res = await request(app).get(`/users/${newUser._id}`);
    expect(res.statusCode).toBe(404);
  });
});
