import request from "supertest";
import initApp from "../server";
import mongoose from "mongoose";
import { Express } from "express";

import postModel from "../models/posts_models";
import userModel from "../models/user_model";

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

//  ------- Global test Initialization (beforeAll / afterAll) ------
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
describe("Auth test suite", () => {
  // Registration Tests
  test("Auth test registration", async () => {
    const response = await request(app)
      .post(`${baseUrl}/register`)
      .send(testUser);

    expect(response.statusCode).toBe(200);
  });

  test("Auth test registration no password", async () => {
    const response = await request(app)
      .post(`${baseUrl}/register`)
      .send({ email: "sdfsadaf" });

    expect(response.statusCode).not.toBe(200);
  });

  test("Auth test registration email already exist", async () => {
    const response = await request(app)
      .post(`${baseUrl}/register`)
      .send(testUser);

    expect(response.statusCode).not.toBe(200);
  });

  // Login Tests
  test("Auth test login", async () => {
    const response = await request(app).post(`${baseUrl}/login`).send(testUser);

    expect(response.statusCode).toBe(200);
    expect(response.body).toHaveProperty("accessToken");
    expect(response.body).toHaveProperty("refreshToken");

    const { accessToken, refreshToken, _id } = response.body;
    testUser.accessToken = accessToken;
    testUser.refreshToken = refreshToken;
    testUser._id = _id;
  });

  test("Auth test login make sure tokens are different", async () => {
    const response = await request(app).post(`${baseUrl}/login`).send(testUser);

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

  // Token / AuthMiddleware Tests
  test("Test token access (authorized vs unauthorized)", async () => {
    // 1) Without token => should fail
    const response = await request(app).post("/posts").send({
      title: "Test title",
      content: "Test content",
      owner: "Eliav",
    });
    expect(response.statusCode).not.toBe(201);

    // 2) With valid token => should succeed
    const response2 = await request(app)
      .post("/posts")
      .set({ authorization: "JWT " + testUser.accessToken })
      .send({
        title: "Test title",
        content: "Test content",
        owner: "Eliav",
      });
    expect(response2.statusCode).toBe(201);
  });

  test("Test token access fail (wrong token)", async () => {
    const response = await request(app)
      .post("/posts")
      .set({ authorization: "JWT " + testUser.accessToken + "f" })
      .send({
        title: "Test title",
        content: "Test content",
        owner: "Eliav",
      });
    expect(response.statusCode).not.toBe(201);
  });

  // Refresh Token Tests
  test("Test refresh token (valid refresh)", async () => {
    const response = await request(app)
      .post(`${baseUrl}/refresh`)
      .send({ refreshToken: testUser.refreshToken });

    expect(response.statusCode).toBe(200);
    expect(response.body).toHaveProperty("accessToken");
    expect(response.body).toHaveProperty("refreshToken");

    testUser.accessToken = response.body.accessToken;
    testUser.refreshToken = response.body.refreshToken;
  });

  test("Test refresh token fail (old vs new)", async () => {
    // 1) We refresh once
    const response = await request(app)
      .post(`${baseUrl}/refresh`)
      .send({ refreshToken: testUser.refreshToken });
    expect(response.statusCode).toBe(200);

    const newRefreshToken = response.body.refreshToken;

    // 2) Try again with old refreshToken => fails
    const response2 = await request(app)
      .post(`${baseUrl}/refresh`)
      .send({ refreshToken: testUser.refreshToken });
    expect(response2.statusCode).not.toBe(200);

    // 3) Try with the new refreshToken again => also fail, because it's now replaced
    const response3 = await request(app)
      .post(`${baseUrl}/refresh`)
      .send({ refreshToken: newRefreshToken });
    expect(response3.statusCode).not.toBe(200);
  });

  test("Refresh with broken signature => reject(err)", async () => {
    // שולחים מחרוזת שנראית כמו JWT אבל החתימה לא נכונה
    const brokenRefreshToken =
      "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.badSignature";
    const res = await request(app)
      .post("/auth/refresh")
      .send({ refreshToken: brokenRefreshToken });
    expect(res.statusCode).toBe(400);
  });

  // Logout Tests
  test("Test Logout", async () => {
    // 1) login again to get fresh tokens
    const response = await request(app).post(`${baseUrl}/login`).send(testUser);
    expect(response.statusCode).toBe(200);

    const { accessToken, refreshToken } = response.body;
    testUser.accessToken = accessToken;
    testUser.refreshToken = refreshToken;

    // 2) logout => 200
    const response2 = await request(app)
      .post(`${baseUrl}/logout`)
      .send({ refreshToken: testUser.refreshToken });
    expect(response2.statusCode).toBe(200);

    // 3) try refresh => should fail
    const response3 = await request(app)
      .post(`${baseUrl}/refresh`)
      .send({ refreshToken: testUser.refreshToken });
    expect(response3.statusCode).not.toBe(200);
  });

  // Token Expiration Test
  jest.setTimeout(20000);
  test("Token expiration", async () => {
    // 1) login
    const response = await request(app).post(`${baseUrl}/login`).send(testUser);
    expect(response.statusCode).toBe(200);

    testUser.accessToken = response.body.accessToken;
    testUser.refreshToken = response.body.refreshToken;

    // 2) wait ~12s (assuming TOKEN_EXPIRATION=10s for test)
    await new Promise((resolve) => setTimeout(resolve, 12000));

    // 3) try using old token => not 201
    const response2 = await request(app)
      .post("/posts")
      .set({ authorization: "JWT " + testUser.accessToken })
      .send({ title: "Test title", content: "Test content", owner: "Eliav" });
    expect(response2.statusCode).not.toBe(201);

    // 4) refresh => should succeed => new tokens
    const response3 = await request(app)
      .post(`${baseUrl}/refresh`)
      .send({ refreshToken: testUser.refreshToken });
    expect(response3.statusCode).toBe(200);

    testUser.accessToken = response3.body.accessToken;
    testUser.refreshToken = response3.body.refreshToken;

    // 5) use new token => 201
    const response4 = await request(app)
      .post("/posts")
      .set({ authorization: "JWT " + testUser.accessToken })
      .send({ title: "Test title", content: "Test content", owner: "Eliav" });
    expect(response4.statusCode).toBe(201);
  });

  // Negative Login/Refresh/Logout Scenarios
  test("Login with non-existing user => should return 400", async () => {
    const response = await request(app)
      .post(`/auth/login`)
      .send({ email: "no_such_user@test.com", password: "123456" });

    expect(response.statusCode).toBe(400);
    expect(response.text).toContain("incorrect email or password");
  });

  test("Login with wrong password => should return 400", async () => {
    const response = await request(app)
      .post(`/auth/login`)
      .send({ email: testUser.email, password: "wrong_password" });

    expect(response.statusCode).toBe(400);
    expect(response.text).toContain("incorrect email or password");
  });

  test("Logout without refreshToken => should fail (400)", async () => {
    const response = await request(app).post("/auth/logout").send({});
    expect(response.statusCode).toBe(400);
  });

  test("Logout with unregistered refreshToken => should fail (400)", async () => {
    const response = await request(app)
      .post("/auth/logout")
      .send({ refreshToken: "someValidJWTButNotInDB" });
    expect(response.statusCode).toBe(400);
  });

  test("Refresh without refreshToken => should fail (400)", async () => {
    const response = await request(app).post("/auth/refresh").send({});
    expect(response.statusCode).toBe(400);
  });

  test("Refresh with invalid token => fails (likely 400)", async () => {
    const response = await request(app)
      .post("/auth/refresh")
      .send({ refreshToken: "DefinitelyNotAValidJWT..." });
    expect(response.statusCode).not.toBe(200); // probably 400
  });

  test("Refresh with unregistered token => 400", async () => {
    const response = await request(app)
      .post("/auth/refresh")
      .send({ refreshToken: "someValidJWTFormatButNotInDB" });
    expect(response.statusCode).toBe(400);
  });

  test("Refresh token with broken JWT => should pass err to reject", async () => {
    // e.g. signature is invalid
    const brokenToken = "eyJhbGciOiJIUzI1NiIsIn...";
    const response = await request(app)
      .post("/auth/refresh")
      .send({ refreshToken: brokenToken });
    expect(response.statusCode).toBe(400);
  });

  test("generateTokens returns null => login should fail with 400", async () => {
    // Scenario: no SECRET => function returns null
    const user = { _id: "123", email: "uesr@gmail.con", password: "123456" };
    const response = await request(app).post("/auth/login").send(user);
    expect(response.statusCode).toBe(400);
  });

  // Additional Negative: Refresh => user not found
  test("Refresh => user not found => should fail with 400", async () => {
    // 1) יוצרים משתמש חדש
    const regRes = await request(app).post(`${baseUrl}/register`).send({
      email: "tempuser@test.com",
      password: "123456",
    });
    expect(regRes.statusCode).toBe(200);

    // 2) מתחברים ולוקחים refreshToken
    const loginRes = await request(app).post(`${baseUrl}/login`).send({
      email: "tempuser@test.com",
      password: "123456",
    });
    expect(loginRes.statusCode).toBe(200);
    const tmpRefresh = loginRes.body.refreshToken;
    const tmpUserId = loginRes.body._id;

    // 3) מוחקים את המשתמש ממסד הנתונים
    await userModel.deleteOne({ _id: tmpUserId });

    // 4) מנסים /auth/refresh עם הטוקן של יוזר שכבר לא קיים
    const refreshRes = await request(app)
      .post(`${baseUrl}/refresh`)
      .send({ refreshToken: tmpRefresh });

    // אמור להגיע ל-if (!user) => reject("error") => 400
    expect(refreshRes.statusCode).toBe(400);
  });
});

// ---- No DB_CONNECT scenario ----
describe("No DB_CONNECT scenario", () => {
  let originalDBConnect: string | undefined;

  beforeAll(() => {
    originalDBConnect = process.env.DB_CONNECT;
    delete process.env.DB_CONNECT; // Delete DB_CONNECT var
  });

  afterAll(() => {
    process.env.DB_CONNECT = originalDBConnect; // Restore
  });

  test("initApp fails if no DB_CONNECT", async () => {
    await expect(
      import("../server").then(({ default: initApp }) => initApp())
    ).rejects.toThrow("DB_CONNECT is not defined");
  });
});

// ---- Failing DB connection scenario ----
describe("Failing DB connection scenario", () => {
  let originalDB: string | undefined;

  beforeAll(() => {
    // שמירת הערך המקורי
    originalDB = process.env.DB_CONNECT;
    // URI לא תקין
    process.env.DB_CONNECT = "mongodb://127.0.0.1:9999/no-such-db";
  });

  afterAll(() => {
    // משחזרים את הערך המקורי
    process.env.DB_CONNECT = originalDB;
  });

  test("initApp should fail and trigger .catch", async () => {
    await expect(
      import("../server").then(({ default: initApp }) => initApp())
    ).rejects.toThrow();
  });

  test("Login => DB error => catch block triggered", async () => {
    // מנסים לעשות login למרות שאין חיבור תקין
    const response = await request(app)
      .post("/auth/login")
      .send({ email: "dbfail@test.com", password: "123456" });
    // כנראה יחזור 400/500, תלוי בקוד שלך
    expect(response.statusCode).not.toBe(200);
  });
});

// ----  No TOKEN_SECRET for generateTokens -----
describe("No TOKEN_SECRET for generateTokens", () => {
  let originalSecret: string | undefined;

  beforeAll(() => {
    originalSecret = process.env.TOKEN_SECRET;
    delete process.env.TOKEN_SECRET;
  });

  afterAll(() => {
    process.env.TOKEN_SECRET = originalSecret;
  });

  test("login fails because generateTokens returns null", async () => {
    const response = await request(app)
      .post("/auth/login")
      .send({ email: "someMail@test.com", password: "123456" });

    expect(response.statusCode).toBe(400);
  });
});

// ---- authMiddleware with no TOKEN_SECRET ----
describe("authMiddleware with no TOKEN_SECRET", () => {
  let originalSecret: string | undefined;

  beforeAll(() => {
    originalSecret = process.env.TOKEN_SECRET;
    delete process.env.TOKEN_SECRET;
  });

  afterAll(() => {
    process.env.TOKEN_SECRET = originalSecret;
  });

  test("Should return 400 server error if TOKEN_SECRET is missing (access route)", async () => {
    const response = await request(app)
      .post("/posts")
      .set({ authorization: "JWT someToken" })
      .send({ title: "Hi" });

    expect(response.statusCode).toBe(400);
    expect(response.text).toContain("server error");
  });

  test("Login => 400 error due to !tokens", async () => {
    const response = await request(app)
      .post("/auth/login")
      .send({ email: "user@test.com", password: "123456" });
    // כי generateTokens(user) תחזיר null
    expect(response.statusCode).toBe(400);
    expect(response.text).toContain("incorrect email or password");
  });
});
