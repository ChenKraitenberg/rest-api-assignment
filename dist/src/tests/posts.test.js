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
const posts_models_1 = __importDefault(require("../models/posts_models"));
// ---------- Global Variables ----------
let app;
const testUser = {
    email: "test@user.com",
    password: "123456",
};
let accessToken;
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
beforeAll(() => __awaiter(void 0, void 0, void 0, function* () {
    app = yield (0, server_1.default)();
    yield posts_models_1.default.deleteMany();
    const response = yield (0, supertest_1.default)(app).post("/auth/register").send(testUser);
    const response2 = yield (0, supertest_1.default)(app).post("/auth/login").send(testUser);
    expect(response2.statusCode).toBe(200);
    accessToken = response2.body.accessToken;
    testPost.owner = response2.body._id;
}));
afterAll(() => __awaiter(void 0, void 0, void 0, function* () {
    yield mongoose_1.default.connection.close();
}));
// ---------- Tests ----------
describe("Posts test suite", () => {
    test("Post test get all posts", () => __awaiter(void 0, void 0, void 0, function* () {
        const response = yield (0, supertest_1.default)(app).get("/posts");
        expect(response.statusCode).toBe(200);
        expect(response.body).toHaveLength(0);
    }));
    test("Test Addding new post", () => __awaiter(void 0, void 0, void 0, function* () {
        const response = yield (0, supertest_1.default)(app)
            .post("/posts")
            .set({
            authorization: "JWT " + accessToken,
        })
            .send(testPost);
        expect(response.statusCode).toBe(201);
        expect(response.body.title).toBe(testPost.title);
        expect(response.body.content).toBe(testPost.content);
        postId = response.body._id;
    }));
    test("Test Addding invalid post", () => __awaiter(void 0, void 0, void 0, function* () {
        const response = yield (0, supertest_1.default)(app)
            .post("/posts")
            .set({
            authorization: "JWT " + accessToken,
        })
            .send(invalidPost);
        expect(response.statusCode).not.toBe(201);
    }));
    test("Test get all posts after adding", () => __awaiter(void 0, void 0, void 0, function* () {
        const response = yield (0, supertest_1.default)(app).get("/posts");
        expect(response.statusCode).toBe(200);
        expect(response.body).toHaveLength(1);
    }));
    test("Test get post by owner", () => __awaiter(void 0, void 0, void 0, function* () {
        const response = yield (0, supertest_1.default)(app).get("/posts?owner=" + testPost.owner);
        expect(response.statusCode).toBe(200);
        expect(response.body).toHaveLength(1);
        expect(response.body[0].owner).toBe(testPost.owner);
    }));
    test("Test get post by id", () => __awaiter(void 0, void 0, void 0, function* () {
        const response = yield (0, supertest_1.default)(app).get("/posts/" + postId);
        expect(response.statusCode).toBe(200);
        expect(response.body._id).toBe(postId);
    }));
    test("Test get post by id fail", () => __awaiter(void 0, void 0, void 0, function* () {
        const response = yield (0, supertest_1.default)(app).get("/posts/67447b032ce3164be7c4412d");
        expect(response.statusCode).toBe(404);
    }));
    test("Force error on create", () => __awaiter(void 0, void 0, void 0, function* () {
        const response = yield (0, supertest_1.default)(app)
            .post("/posts")
            .set({ authorization: "JWT  + ${accessToken}" })
            .send({ title: "test" })
            .send({ title: { invalidKey: 123 } });
        expect(response.statusCode).toBe(400);
    }));
    // You need at least one test for each method that does CRUD (getAll, getById, create, update, delete) where the model throws an error.
    test("Force error on create (invalid data)", () => __awaiter(void 0, void 0, void 0, function* () {
        const response = yield (0, supertest_1.default)(app)
            .post("/posts")
            .set({ authorization: "JWT " + accessToken })
            .send({ title: { invalidKey: 123 } });
        // מניחים שבסכמה title הוא String בלבד
        // מצפים שזה יפיל את ה-controller ל-catch(...)
        expect(response.statusCode).toBe(400);
    }));
    test("Force error on getById - cast error", () => __awaiter(void 0, void 0, void 0, function* () {
        const response = yield (0, supertest_1.default)(app).get("/posts/abc123!?");
        expect(response.statusCode).toBe(400); // אם כתבת בקוד שכך הוא מגיב ל-cast error
    }));
    test("Force error on getById - not found", () => __awaiter(void 0, void 0, void 0, function* () {
        const response = yield (0, supertest_1.default)(app).get("/posts/67447b032ce3164be7c4412d");
        expect(response.statusCode).toBe(404); // אם כתבת בקוד שכך הוא מגיב ל-not found
    }));
    test("Force error on update - cast error", () => __awaiter(void 0, void 0, void 0, function* () {
        const response = yield (0, supertest_1.default)(app)
            .put("/posts/abc123!?")
            .set({ authorization: "JWT " + accessToken })
            .send({ title: "test" });
        expect(response.statusCode).toBe(400); // אם כתבת בקוד שכך הוא מגיב ל-cast error
    }));
    test("Force error on update - not found", () => __awaiter(void 0, void 0, void 0, function* () {
        const response = yield (0, supertest_1.default)(app)
            .put("/posts/67447b032ce3164be7c4412d")
            .send({ title: "test" });
        expect(response.statusCode).toBe(404); // אם כתבת בקוד שכך הוא מגיב ל-not found
    }));
    test("Force error on delete - cast error", () => __awaiter(void 0, void 0, void 0, function* () {
        const response = yield (0, supertest_1.default)(app).delete("/posts/abc123!?");
        expect(response.statusCode).toBe(400); // אם כתבת בקוד שכך הוא מגיב ל-cast error
    }));
    test("Force error on delete - not found", () => __awaiter(void 0, void 0, void 0, function* () {
        // מזהה תקין מבחינת פורמט hex 24 ספרות, אבל כנראה לא קיים ב-DB
        const notExistingId = "64a79b44dc9f9f73013f2612";
        const response = yield (0, supertest_1.default)(app)
            .delete(`/posts/${notExistingId}`)
            .set({ authorization: `JWT ${accessToken}` });
        // כעת מצפים שתקבלי 404 כי post === null
        expect(response.statusCode).toBe(404);
    }));
});
//# sourceMappingURL=posts.test.js.map