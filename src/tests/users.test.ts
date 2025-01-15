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

// המשתמש החדש שיירשם דרך /auth/register
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

  // 2. רושמים משתמש חדש דרך /auth/register
  const newUserRes = await request(app).post("/auth/register").send(newUser);
  expect(newUserRes.statusCode).toBe(200);
  newUser._id = newUserRes.body._id;

  // 3. מתחברים כדי להשיג accessToken
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
  test("GET /users (should return an array - currently has 2 users from auth/register)", async () => {
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

    const getRes = await request(app).get(`/users/${newUser._id}`);
    expect(getRes.statusCode).toBe(200);
    expect(getRes.body.email).toBe(updatedEmail);

    newUser.email = updatedEmail; // עדכון הערך של newUser
  });

  test("DELETE /users/:id without token => should fail", async () => {
    const res = await request(app).delete(`/users/${newUser._id}`);
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
