import request from "supertest";
import initApp from "../server";
import mongoose from "mongoose";
import postModel from "../models/posts_models";
import { Express } from "express";

// ---------- משתנים גלובליים ----------
let app: Express;
const testUser = {
  email: "test@user.com",
  password: "123456",
};

let accessToken: string;
let postId = "";

const validPost = {
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

  // הרשמה והתחברות משתמש
  const registerResponse = await request(app)
    .post("/auth/register")
    .send(testUser);
  const loginResponse = await request(app).post("/auth/login").send(testUser);

  expect(loginResponse.statusCode).toBe(200);
  accessToken = loginResponse.body.accessToken;
  validPost.owner = loginResponse.body._id;
});

afterAll(async () => {
  await mongoose.connection.close();
});

// ---------- בדיקות ----------
describe("Posts Test Suite", () => {
  describe("CRUD Operations", () => {
    test("Get all posts initially", async () => {
      const response = await request(app).get("/posts");
      expect(response.statusCode).toBe(200);
      expect(response.body).toHaveLength(0);
    });

    test("Add a new valid post", async () => {
      const response = await request(app)
        .post("/posts")
        .set("authorization", `JWT ${accessToken}`)
        .send(validPost);

      expect(response.statusCode).toBe(201);
      expect(response.body.title).toBe(validPost.title);
      expect(response.body.content).toBe(validPost.content);
      postId = response.body._id;
    });

    test("Add an invalid post", async () => {
      const response = await request(app)
        .post("/posts")
        .set("authorization", `JWT ${accessToken}`)
        .send(invalidPost);

      expect(response.statusCode).not.toBe(201);
    });

    test("Get all posts after adding", async () => {
      const response = await request(app).get("/posts");
      expect(response.statusCode).toBe(200);
      expect(response.body).toHaveLength(1);
    });

    test("Get posts by owner", async () => {
      const response = await request(app).get(
        `/posts?owner=${validPost.owner}`
      );
      expect(response.statusCode).toBe(200);
      expect(response.body).toHaveLength(1);
      expect(response.body[0].owner).toBe(validPost.owner);
    });

    test("Get post by valid ID", async () => {
      const response = await request(app).get(`/posts/${postId}`);
      expect(response.statusCode).toBe(200);
      expect(response.body._id).toBe(postId);
    });

    test("Get post by invalid ID format", async () => {
      const response = await request(app).get("/posts/invalid-id");
      expect(response.statusCode).toBe(400);
    });

    test("Get post by non-existing ID", async () => {
      const nonExistingId = "67447b032ce3164be7c4412d";
      const response = await request(app).get(`/posts/${nonExistingId}`);
      expect(response.statusCode).toBe(404);
    });

    test("Update post with valid data", async () => {
      const updatedData = { title: "Updated Title" };
      const response = await request(app)
        .put(`/posts/${postId}`)
        .set("authorization", `JWT ${accessToken}`)
        .send(updatedData);

      expect(response.statusCode).toBe(200);
      expect(response.body.title).toBe(updatedData.title);
    });

    test("Update post with invalid ID format", async () => {
      const response = await request(app)
        .put("/posts/invalid-id")
        .set("authorization", `JWT ${accessToken}`)
        .send({ title: "Test" });

      expect(response.statusCode).toBe(400);
    });

    test("Update non-existing post", async () => {
      const nonExistingId = "67447b032ce3164be7c4412d";
      const response = await request(app)
        .put(`/posts/${nonExistingId}`)
        .set("authorization", `JWT ${accessToken}`)
        .send({ title: "Test" });

      expect(response.statusCode).toBe(404);
    });

    test("Delete post with valid ID", async () => {
      const response = await request(app)
        .delete(`/posts/${postId}`)
        .set("authorization", `JWT ${accessToken}`);

      expect(response.statusCode).toBe(200);
    });

    test("Delete post with invalid ID format", async () => {
      const response = await request(app).delete("/posts/invalid-id");
      expect(response.statusCode).toBe(400);
    });

    test("Delete non-existing post", async () => {
      const nonExistingId = "64a79b44dc9f9f73013f2612";
      const response = await request(app)
        .delete(`/posts/${nonExistingId}`)
        .set("authorization", `JWT ${accessToken}`);

      expect(response.statusCode).toBe(404);
    });
  });

  describe("Error Handling", () => {
    test("Handle DB error on GetAll", async () => {
      const spy = jest.spyOn(postModel, "find").mockImplementationOnce(() => {
        throw new Error("DB Error");
      });

      const response = await request(app).get("/posts");
      expect(response.statusCode).toBe(400);
      spy.mockRestore();
    });

    test("Handle invalid owner filter", async () => {
      const invalidOwnerId = "zzzzzzzzzzzzzzzzzzzzzzzz"; // 24 תווים אך לא תקין
      const response = await request(app).get(`/posts?owner=${invalidOwnerId}`);

      expect(response.statusCode).toBe(400);
      expect(response.text).toBe("Invalid owner ID format");
    });

    test("Handle validation errors on update", async () => {
      const invalidData = { title: { invalid: "format" } };
      const invalidPostId = new mongoose.Types.ObjectId();

      const response = await request(app)
        .put(`/posts/${invalidPostId}`)
        .set("authorization", `JWT ${accessToken}`)
        .send(invalidData);

      expect(response.statusCode).toBe(400);
    });

    test("Handle validation errors on create", async () => {
      const invalidData = { title: { invalidKey: 123 } };

      const response = await request(app)
        .post("/posts")
        .set("authorization", `JWT ${accessToken}`)
        .send(invalidData);

      expect(response.statusCode).toBe(400);
    });
  });
});
