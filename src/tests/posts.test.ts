import request from "supertest";
import initApp from "../server";
import mongoose from "mongoose";
import postModel from "../models/posts_models";
import { Express } from "express";

// ---------- Global Variables ----------
let app: Express;
const testUser = {
  email: "test@user.com",
  password: "123456",
};

let accessToken: string;
var postId = "";

const testPost = {
  title: "Test title",
  content: "Test content",
  owner: "Eliav",
};

const invalidPost = {
  content: "Test content",
};

// ---------- Before/After ----------
beforeAll(async () => {
  app = await initApp();
  await postModel.deleteMany();
  const response = await request(app).post("/auth/register").send(testUser);
  const response2 = await request(app).post("/auth/login").send(testUser);
  expect(response2.statusCode).toBe(200);
  accessToken = response2.body.accessToken;
  testPost.owner = response2.body._id;
});

afterAll(async () => {
  await mongoose.connection.close();
});

// ---------- Tests ----------
describe("Posts test suite", () => {
  test("Post test get all posts", async () => {
    const response = await request(app).get("/posts");
    expect(response.statusCode).toBe(200);
    expect(response.body).toHaveLength(0);
  });

  test("Test Addding new post", async () => {
    const response = await request(app)
      .post("/posts")
      .set({
        authorization: "JWT " + accessToken,
      })
      .send(testPost);
    expect(response.statusCode).toBe(201);
    expect(response.body.title).toBe(testPost.title);
    expect(response.body.content).toBe(testPost.content);
    postId = response.body._id;
  });

  test("Test Addding invalid post", async () => {
    const response = await request(app)
      .post("/posts")
      .set({
        authorization: "JWT " + accessToken,
      })
      .send(invalidPost);
    expect(response.statusCode).not.toBe(201);
  });

  test("Test get all posts after adding", async () => {
    const response = await request(app).get("/posts");
    expect(response.statusCode).toBe(200);
    expect(response.body).toHaveLength(1);
  });

  test("Test get post by owner", async () => {
    const response = await request(app).get("/posts?owner=" + testPost.owner);
    expect(response.statusCode).toBe(200);
    expect(response.body).toHaveLength(1);
    expect(response.body[0].owner).toBe(testPost.owner);
  });

  test("Test get post by id", async () => {
    const response = await request(app).get("/posts/" + postId);
    expect(response.statusCode).toBe(200);
    expect(response.body._id).toBe(postId);
  });

  test("Test get post by id fail", async () => {
    const response = await request(app).get("/posts/67447b032ce3164be7c4412d");
    expect(response.statusCode).toBe(404);
  });

  test("Force error on create", async () => {
    const response = await request(app)
      .post("/posts")
      .set({ authorization: "JWT  + ${accessToken}" })
      .send({ title: "test" })
      .send({ title: { invalidKey: 123 } });

    expect(response.statusCode).toBe(400);
  });

  // You need at least one test for each method that does CRUD (getAll, getById, create, update, delete) where the model throws an error.

  test("Force error on create (invalid data)", async () => {
    const response = await request(app)
      .post("/posts")
      .set({ authorization: "JWT " + accessToken })
      .send({ title: { invalidKey: 123 } });
    // מניחים שבסכמה title הוא String בלבד

    // מצפים שזה יפיל את ה-controller ל-catch(...)
    expect(response.statusCode).toBe(400);
  });

  test("Force error on getById - cast error", async () => {
    const response = await request(app).get("/posts/abc123!?");
    expect(response.statusCode).toBe(400); // אם כתבת בקוד שכך הוא מגיב ל-cast error
  });

  test("Force error on getById - not found", async () => {
    const response = await request(app).get("/posts/67447b032ce3164be7c4412d");
    expect(response.statusCode).toBe(404); // אם כתבת בקוד שכך הוא מגיב ל-not found
  });

  test("Force error on update - cast error", async () => {
    const response = await request(app)
      .put("/posts/abc123!?")
      .set({ authorization: "JWT " + accessToken })
      .send({ title: "test" });
    expect(response.statusCode).toBe(400); // אם כתבת בקוד שכך הוא מגיב ל-cast error
  });

  test("Force error on update - not found", async () => {
    const response = await request(app)
      .put("/posts/67447b032ce3164be7c4412d")
      .send({ title: "test" });
    expect(response.statusCode).toBe(404); // אם כתבת בקוד שכך הוא מגיב ל-not found
  });

  test("Force error on delete - cast error", async () => {
    const response = await request(app).delete("/posts/abc123!?");
    expect(response.statusCode).toBe(400); // אם כתבת בקוד שכך הוא מגיב ל-cast error
  });

  test("Force error on delete - not found", async () => {
    // מזהה תקין מבחינת פורמט hex 24 ספרות, אבל כנראה לא קיים ב-DB
    const notExistingId = "64a79b44dc9f9f73013f2612";

    const response = await request(app)
      .delete(`/posts/${notExistingId}`)
      .set({ authorization: `JWT ${accessToken}` });

    // כעת מצפים שתקבלי 404 כי post === null
    expect(response.statusCode).toBe(404);
  });
});
