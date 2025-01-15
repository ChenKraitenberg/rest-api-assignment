import request from "supertest";
import initApp from "../server";
import mongoose from "mongoose";
import { Express } from "express";
import postModel from "../models/posts_models";
import userModel from "../models/user_model";
import dotenv from "dotenv";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

dotenv.config();

// ---------- Global Variables ----------
const baseUrl = "/auth";

type User = {
  email: string;
  password: string;
  accessToken?: string;
  refreshToken?: string;
  _id?: string;
};

const testUser: User = {
  email: "user1@test.com",
  password: "123456",
};

//  ------- Global Test Initialization (beforeAll / afterAll) ------
let app: Express;

beforeAll(async () => {
  app = await initApp();
  await userModel.deleteMany();
  await postModel.deleteMany();
});

afterAll(async () => {
  await mongoose.connection.close();
});

// ---- Main Auth Test Suite ----
describe("Auth Test Suite", () => {
  // Registration Tests
  describe("Registration", () => {
    test("should register a new user successfully", async () => {
      const response = await request(app)
        .post(`${baseUrl}/register`)
        .send(testUser);
      expect(response.statusCode).toBe(200);
    });

    test("should fail registration without a password", async () => {
      const response = await request(app)
        .post(`${baseUrl}/register`)
        .send({ email: "sdfsadaf" });
      expect(response.statusCode).not.toBe(200);
    });

    test("should not allow registration with an existing email", async () => {
      const response = await request(app)
        .post(`${baseUrl}/register`)
        .send(testUser);
      expect(response.statusCode).not.toBe(200);
    });
  });

  // Login Tests
  describe("Login", () => {
    test("should login successfully and return tokens", async () => {
      const response = await request(app)
        .post(`${baseUrl}/login`)
        .send(testUser);
      expect(response.statusCode).toBe(200);
      expect(response.body).toHaveProperty("accessToken");
      expect(response.body).toHaveProperty("refreshToken");

      const { accessToken, refreshToken, _id } = response.body;
      testUser.accessToken = accessToken;
      testUser.refreshToken = refreshToken;
      testUser._id = _id;
    });

    test("should generate different tokens on subsequent logins", async () => {
      const response = await request(app)
        .post(`${baseUrl}/login`)
        .send(testUser);
      expect(response.statusCode).toBe(200);
      expect(response.body).toHaveProperty("accessToken");
      expect(response.body).toHaveProperty("refreshToken");

      const { accessToken, refreshToken, _id } = response.body;
      expect(accessToken).not.toBe(testUser.accessToken);
      expect(refreshToken).not.toBe(testUser.refreshToken);

      testUser.accessToken = accessToken;
      testUser.refreshToken = refreshToken;
      testUser._id = _id;
    });
  });

  // Token Access Tests
  describe("Token Access", () => {
    test("should deny access without a token", async () => {
      const response = await request(app).post("/posts").send({
        title: "Test title",
        content: "Test content",
        owner: "Eliav",
      });
      expect(response.statusCode).not.toBe(201);
    });

    test("should allow access with a valid token", async () => {
      const response = await request(app)
        .post("/posts")
        .set({ authorization: `JWT ${testUser.accessToken}` })
        .send({
          title: "Test title",
          content: "Test content",
          owner: "Eliav",
        });
      expect(response.statusCode).toBe(201);
    });

    test("should deny access with an invalid token", async () => {
      const response = await request(app)
        .post("/posts")
        .set({ authorization: `JWT ${testUser.accessToken}f` })
        .send({
          title: "Test title",
          content: "Test content",
          owner: "Eliav",
        });
      expect(response.statusCode).not.toBe(201);
    });
  });

  // Refresh Token Tests
  describe("Refresh Token", () => {
    test("should refresh tokens with a valid refresh token", async () => {
      const response = await request(app)
        .post(`${baseUrl}/refresh`)
        .send({ refreshToken: testUser.refreshToken });
      expect(response.statusCode).toBe(200);
      expect(response.body).toHaveProperty("accessToken");
      expect(response.body).toHaveProperty("refreshToken");

      testUser.accessToken = response.body.accessToken;
      testUser.refreshToken = response.body.refreshToken;
    });

    test("should invalidate old refresh tokens after refreshing", async () => {
      // First refresh
      const response1 = await request(app)
        .post(`${baseUrl}/refresh`)
        .send({ refreshToken: testUser.refreshToken });
      expect(response1.statusCode).toBe(200);

      const newRefreshToken = response1.body.refreshToken;

      // Attempt to refresh with the old token
      const response2 = await request(app)
        .post(`${baseUrl}/refresh`)
        .send({ refreshToken: testUser.refreshToken });
      expect(response2.statusCode).not.toBe(200);

      // Attempt to refresh with the new token
      const response3 = await request(app)
        .post(`${baseUrl}/refresh`)
        .send({ refreshToken: newRefreshToken });
      expect(response3.statusCode).not.toBe(200);
    });

    test("should handle refresh with a broken signature", async () => {
      const brokenRefreshToken =
        "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.badSignature";
      const res = await request(app)
        .post("/auth/refresh")
        .send({ refreshToken: brokenRefreshToken });
      expect(res.statusCode).toBe(400);
    });
  });

  // Logout Tests
  describe("Logout", () => {
    test("should logout successfully and invalidate the refresh token", async () => {
      // Login to get fresh tokens
      const loginResponse = await request(app)
        .post(`${baseUrl}/login`)
        .send(testUser);
      expect(loginResponse.statusCode).toBe(200);

      const { accessToken, refreshToken } = loginResponse.body;
      testUser.accessToken = accessToken;
      testUser.refreshToken = refreshToken;

      // Logout
      const logoutResponse = await request(app)
        .post(`${baseUrl}/logout`)
        .send({ refreshToken: testUser.refreshToken });
      expect(logoutResponse.statusCode).toBe(200);

      // Attempt to refresh with the invalidated token
      const refreshResponse = await request(app)
        .post(`${baseUrl}/refresh`)
        .send({ refreshToken: testUser.refreshToken });
      expect(refreshResponse.statusCode).not.toBe(200);
    });
  });

  // Token Expiration Test
  describe("Token Expiration", () => {
    jest.setTimeout(20000);

    test("should handle token expiration correctly", async () => {
      // Login
      const loginResponse = await request(app)
        .post(`${baseUrl}/login`)
        .send(testUser);
      expect(loginResponse.statusCode).toBe(200);

      testUser.accessToken = loginResponse.body.accessToken;
      testUser.refreshToken = loginResponse.body.refreshToken;

      // Wait for token to expire (assuming TOKEN_EXPIRATION=10s for test)
      await new Promise((resolve) => setTimeout(resolve, 12000));

      // Attempt to use the expired token
      const postResponse = await request(app)
        .post("/posts")
        .set({ authorization: `JWT ${testUser.accessToken}` })
        .send({ title: "Test title", content: "Test content", owner: "Eliav" });
      expect(postResponse.statusCode).not.toBe(201);

      // Refresh tokens
      const refreshResponse = await request(app)
        .post(`${baseUrl}/refresh`)
        .send({ refreshToken: testUser.refreshToken });
      expect(refreshResponse.statusCode).toBe(200);

      testUser.accessToken = refreshResponse.body.accessToken;
      testUser.refreshToken = refreshResponse.body.refreshToken;

      // Use the new token
      const newPostResponse = await request(app)
        .post("/posts")
        .set({ authorization: `JWT ${testUser.accessToken}` })
        .send({ title: "Test title", content: "Test content", owner: "Eliav" });
      expect(newPostResponse.statusCode).toBe(201);
    });
  });

  // Negative Scenarios
  describe("Negative Scenarios", () => {
    test("should fail login with a non-existing user", async () => {
      const response = await request(app)
        .post(`/auth/login`)
        .send({ email: "no_such_user@test.com", password: "123456" });
      expect(response.statusCode).toBe(400);
      expect(response.text).toContain("incorrect email or password");
    });

    test("should fail login with an incorrect password", async () => {
      const response = await request(app)
        .post(`/auth/login`)
        .send({ email: testUser.email, password: "wrong_password" });
      expect(response.statusCode).toBe(400);
      expect(response.text).toContain("incorrect email or password");
    });

    test("should fail logout without a refresh token", async () => {
      const response = await request(app).post("/auth/logout").send({});
      expect(response.statusCode).toBe(400);
    });

    test("should fail logout with an unregistered refresh token", async () => {
      const response = await request(app)
        .post("/auth/logout")
        .send({ refreshToken: "someValidJWTButNotInDB" });
      expect(response.statusCode).toBe(400);
    });

    test("should fail refresh without a refresh token", async () => {
      const response = await request(app).post("/auth/refresh").send({});
      expect(response.statusCode).toBe(400);
    });

    test("should fail refresh with an invalid token format", async () => {
      const response = await request(app)
        .post("/auth/refresh")
        .send({ refreshToken: "DefinitelyNotAValidJWT..." });
      expect(response.statusCode).toBe(400);
    });

    test("should fail refresh with an unregistered token", async () => {
      const response = await request(app)
        .post("/auth/refresh")
        .send({ refreshToken: "someValidJWTFormatButNotInDB" });
      expect(response.statusCode).toBe(400);
    });

    test("should fail refresh with a broken JWT", async () => {
      const brokenToken = "eyJhbGciOiJIUzI1NiIsIn...";
      const response = await request(app)
        .post("/auth/refresh")
        .send({ refreshToken: brokenToken });
      expect(response.statusCode).toBe(400);
    });

    test("should fail login if token generation returns null", async () => {
      // Simulate missing TOKEN_SECRET
      const originalSecret = process.env.TOKEN_SECRET;
      delete process.env.TOKEN_SECRET;

      const response = await request(app).post("/auth/login").send(testUser);
      expect(response.statusCode).toBe(400);

      // Restore TOKEN_SECRET
      process.env.TOKEN_SECRET = originalSecret;
    });

    test("should fail refresh if the user does not exist", async () => {
      // Register a temporary user
      const regRes = await request(app).post(`${baseUrl}/register`).send({
        email: "tempuser@test.com",
        password: "123456",
      });
      expect(regRes.statusCode).toBe(200);

      // Login to get refresh token
      const loginRes = await request(app).post(`${baseUrl}/login`).send({
        email: "tempuser@test.com",
        password: "123456",
      });
      expect(loginRes.statusCode).toBe(200);
      const tmpRefresh = loginRes.body.refreshToken;
      const tmpUserId = loginRes.body._id;

      // Delete the user from the database
      await userModel.deleteOne({ _id: tmpUserId });

      // Attempt to refresh with the deleted user's token
      const refreshRes = await request(app)
        .post(`${baseUrl}/refresh`)
        .send({ refreshToken: tmpRefresh });
      expect(refreshRes.statusCode).toBe(400);
    });
  });
});

// ---- Auth Middleware Without TOKEN_SECRET ----
describe("Auth Middleware Without TOKEN_SECRET", () => {
  let originalSecret: string | undefined;

  beforeAll(() => {
    originalSecret = process.env.TOKEN_SECRET;
    delete process.env.TOKEN_SECRET;
  });

  afterAll(() => {
    process.env.TOKEN_SECRET = originalSecret;
  });

  test("should return 400 server error if TOKEN_SECRET is missing on access route", async () => {
    const response = await request(app)
      .post("/posts")
      .set({ authorization: "JWT someToken" })
      .send({ title: "Hi" });
    expect(response.statusCode).toBe(400);
    expect(response.text).toContain("server error");
  });

  test("should fail login when TOKEN_SECRET is missing", async () => {
    const response = await request(app)
      .post("/auth/login")
      .send({ email: "user@test.com", password: "123456" });
    expect(response.statusCode).toBe(400);
    expect(response.text).toContain("incorrect email or password");
  });
});

// ---- Auth Controller Error Handling ----
describe("Auth Controller Error Handling", () => {
  // Handle MongoDB duplicate key error
  test("should handle MongoDB duplicate key error on registration", async () => {
    const user = {
      email: "duplicate@test.com",
      password: "123456",
    };

    // First registration
    const response1 = await request(app).post(`${baseUrl}/register`).send(user);
    expect(response1.statusCode).toBe(200);

    // Attempt duplicate registration
    const response2 = await request(app).post(`${baseUrl}/register`).send(user);
    expect(response2.statusCode).toBe(400);
  });

  // Handle DB error during user lookup
  test("should handle DB error when finding user on login", async () => {
    const spy = jest.spyOn(userModel, "findOne").mockImplementationOnce(() => {
      throw new Error("DB Error");
    });

    const response = await request(app).post(`${baseUrl}/login`).send({
      email: "error@test.com",
      password: "123456",
    });
    expect(response.statusCode).toBe(400);
    spy.mockRestore();
  });

  // Handle missing token during refresh
  test("should handle missing refresh token during validation", async () => {
    const response = await request(app).post(`${baseUrl}/refresh`).send({});
    expect(response.statusCode).toBe(400);
  });
});

// ---- Auth Controller Edge Cases ----
describe("Auth Controller Edge Cases", () => {
  // Handle password hashing error
  test("should handle password hashing error during registration", async () => {
    const bcryptMock = jest
      .spyOn(bcrypt, "genSalt")
      .mockImplementationOnce(() => Promise.reject("Hashing failed"));

    const response = await request(app).post("/auth/register").send({
      email: "test@error.com",
      password: "123456",
    });
    expect(response.statusCode).toBe(400);
    bcryptMock.mockRestore();
  });

  // Handle token generation error during login
  test("should handle token generation error during login", async () => {
    const originalSecret = process.env.TOKEN_SECRET;
    delete process.env.TOKEN_SECRET;

    const response = await request(app).post("/auth/login").send({
      email: "test@test.com",
      password: "123456",
    });
    expect(response.statusCode).toBe(400);
    expect(response.text).toBe("incorrect email or password");

    process.env.TOKEN_SECRET = originalSecret;
  });

  // Handle database error during token refresh
  test("should handle database error during token refresh", async () => {
    // Register and login to get tokens
    const userRes = await request(app)
      .post("/auth/register")
      .send({
        email: `test_${Date.now()}@test.com`,
        password: "123456",
      });
    const loginRes = await request(app).post("/auth/login").send({
      email: userRes.body.email,
      password: "123456",
    });

    // Mock DB error on save
    jest.spyOn(userModel.prototype, "save").mockImplementationOnce(() => {
      throw new Error("DB Error");
    });

    const response = await request(app)
      .post("/auth/refresh")
      .send({ refreshToken: loginRes.body.refreshToken });
    expect(response.statusCode).toBe(400);
  });

  // Handle null refresh token
  test("should handle null refresh token during validation", async () => {
    const response = await request(app)
      .post("/auth/refresh")
      .send({ refreshToken: null });
    expect(response.statusCode).toBe(400);
  });

  // Handle missing TOKEN_SECRET during token validation
  test("should handle missing TOKEN_SECRET during token validation", async () => {
    const originalSecret = process.env.TOKEN_SECRET;

    // Register and login to get tokens
    const user = await request(app)
      .post("/auth/register")
      .send({
        email: `test_${Date.now()}@test.com`,
        password: "123456",
      });
    const loginRes = await request(app).post("/auth/login").send({
      email: user.body.email,
      password: "123456",
    });

    // Remove TOKEN_SECRET
    delete process.env.TOKEN_SECRET;

    const response = await request(app)
      .post("/auth/refresh")
      .send({ refreshToken: loginRes.body.refreshToken });
    expect(response.statusCode).toBe(400);

    // Restore TOKEN_SECRET
    process.env.TOKEN_SECRET = originalSecret;
  });

  // Handle invalid user ID in token during refresh
  test("should handle invalid user ID in refresh token", async () => {
    // Register a user
    await request(app)
      .post("/auth/register")
      .send({
        email: `test_${Date.now()}@test.com`,
        password: "123456",
      });

    // Create a fake token with a non-existing user ID
    const fakeToken = jwt.sign(
      {
        _id: new mongoose.Types.ObjectId().toString(),
        rand: Math.random(),
      },
      process.env.TOKEN_SECRET || "default_secret",
      { expiresIn: "1h" }
    );

    const response = await request(app)
      .post("/auth/refresh")
      .send({ refreshToken: fakeToken });
    expect(response.statusCode).toBe(400);
  });

  // Handle token verification error
  test("should handle token verification error during refresh", async () => {
    // Create a token with an incorrect secret
    const invalidToken = jwt.sign(
      {
        _id: new mongoose.Types.ObjectId().toString(),
      },
      "wrong_secret",
      { expiresIn: "1h" }
    );

    const response = await request(app)
      .post("/auth/refresh")
      .send({ refreshToken: invalidToken });
    expect(response.statusCode).toBe(400);
  });
});
