"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const supertest_1 = __importDefault(require("supertest"));
const server_1 = __importDefault(require("../server"));
const mongoose_1 = __importDefault(require("mongoose"));
const user_model_1 = __importDefault(require("../models/user_model"));
// ---------- Global Variables ----------
let app;
let accessToken;
// משתמש שנרשם מראש רק כדי לייצר טוקן משימוש ב-/auth/login
const authUser = {
    email: "authuser@test.com",
    password: "123456",
};
// המשתמש החדש שיירשם דרך /auth/register
const newUser = {
    email: "newuser@test.com",
    password: "654321",
};
// ---------- Before/After ----------
beforeAll(() => __awaiter(void 0, void 0, void 0, function* () {
    app = yield (0, server_1.default)();
    // מנקים את אוסף המשתמשים (כדי למנוע דופליקטים וכד')
    yield user_model_1.default.deleteMany();
    // 1. רושמים משתמש דרך /auth/register
    const registerRes = yield (0, supertest_1.default)(app).post("/auth/register").send(authUser);
    expect(registerRes.statusCode).toBe(200);
    // 2. רושמים משתמש חדש דרך /auth/register
    const newUserRes = yield (0, supertest_1.default)(app).post("/auth/register").send(newUser);
    expect(newUserRes.statusCode).toBe(200);
    newUser._id = newUserRes.body._id;
    // 3. מתחברים כדי להשיג accessToken
    const loginRes = yield (0, supertest_1.default)(app).post("/auth/login").send(authUser);
    expect(loginRes.statusCode).toBe(200);
    expect(loginRes.body).toHaveProperty("accessToken");
    accessToken = loginRes.body.accessToken;
}));
afterAll(() => __awaiter(void 0, void 0, void 0, function* () {
    yield mongoose_1.default.connection.close();
}));
// ---------- Tests ----------
describe("User test suite", () => {
    test("GET /users (should return an array - currently has 2 users from auth/register)", () => __awaiter(void 0, void 0, void 0, function* () {
        const res = yield (0, supertest_1.default)(app).get("/users");
        expect(res.statusCode).toBe(200);
        expect(Array.isArray(res.body)).toBe(true);
        expect(res.body.length).toBe(2);
    }));
    test("GET /users/:id => should return the newly created user", () => __awaiter(void 0, void 0, void 0, function* () {
        const res = yield (0, supertest_1.default)(app).get(`/users/${newUser._id}`);
        expect(res.statusCode).toBe(200);
        expect(res.body.email).toBe(newUser.email);
    }));
    test("PUT /users/:id => should update user (no token required in your routes)", () => __awaiter(void 0, void 0, void 0, function* () {
        const updatedEmail = "updated@test.com";
        const res = yield (0, supertest_1.default)(app)
            .put(`/users/${newUser._id}`)
            .send({ email: updatedEmail });
        expect(res.statusCode).toBe(200);
        const getRes = yield (0, supertest_1.default)(app).get(`/users/${newUser._id}`);
        expect(getRes.statusCode).toBe(200);
        expect(getRes.body.email).toBe(updatedEmail);
        newUser.email = updatedEmail; // עדכון הערך של newUser
    }));
    test("DELETE /users/:id without token => should fail", () => __awaiter(void 0, void 0, void 0, function* () {
        const res = yield (0, supertest_1.default)(app).delete(`/users/${newUser._id}`);
        expect(res.statusCode).not.toBe(200);
    }));
    test("DELETE /users/:id with token => should succeed", () => __awaiter(void 0, void 0, void 0, function* () {
        const res = yield (0, supertest_1.default)(app)
            .delete(`/users/${newUser._id}`)
            .set({ authorization: "JWT " + accessToken });
        expect(res.statusCode).toBe(200);
    }));
    test("GET /users => should now have only 1 user again", () => __awaiter(void 0, void 0, void 0, function* () {
        const res = yield (0, supertest_1.default)(app).get("/users");
        expect(res.statusCode).toBe(200);
        expect(Array.isArray(res.body)).toBe(true);
        expect(res.body.length).toBe(1);
    }));
    test("GET /users/:id => should be 404 if we try to get the deleted user", () => __awaiter(void 0, void 0, void 0, function* () {
        const res = yield (0, supertest_1.default)(app).get(`/users/${newUser._id}`);
        expect(res.statusCode).toBe(404);
    }));
});
//# sourceMappingURL=users.test.js.map