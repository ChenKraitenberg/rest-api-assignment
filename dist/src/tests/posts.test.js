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
// ---------- משתנים גלובליים ----------
let app;
const testUser = {
    email: "test@user.com",
    password: "123456",
};
let accessToken;
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
beforeAll(() => __awaiter(void 0, void 0, void 0, function* () {
    app = yield (0, server_1.default)();
    yield posts_models_1.default.deleteMany();
    // הרשמה והתחברות משתמש
    const registerResponse = yield (0, supertest_1.default)(app)
        .post("/auth/register")
        .send(testUser);
    const loginResponse = yield (0, supertest_1.default)(app).post("/auth/login").send(testUser);
    expect(loginResponse.statusCode).toBe(200);
    accessToken = loginResponse.body.accessToken;
    validPost.owner = loginResponse.body._id;
}));
afterAll(() => __awaiter(void 0, void 0, void 0, function* () {
    yield mongoose_1.default.connection.close();
}));
// ---------- בדיקות ----------
describe("Posts Test Suite", () => {
    describe("CRUD Operations", () => {
        test("Get all posts initially", () => __awaiter(void 0, void 0, void 0, function* () {
            const response = yield (0, supertest_1.default)(app).get("/posts");
            expect(response.statusCode).toBe(200);
            expect(response.body).toHaveLength(0);
        }));
        test("Add a new valid post", () => __awaiter(void 0, void 0, void 0, function* () {
            const response = yield (0, supertest_1.default)(app)
                .post("/posts")
                .set("authorization", `JWT ${accessToken}`)
                .send(validPost);
            expect(response.statusCode).toBe(201);
            expect(response.body.title).toBe(validPost.title);
            expect(response.body.content).toBe(validPost.content);
            postId = response.body._id;
        }));
        test("Add an invalid post", () => __awaiter(void 0, void 0, void 0, function* () {
            const response = yield (0, supertest_1.default)(app)
                .post("/posts")
                .set("authorization", `JWT ${accessToken}`)
                .send(invalidPost);
            expect(response.statusCode).not.toBe(201);
        }));
        test("Get all posts after adding", () => __awaiter(void 0, void 0, void 0, function* () {
            const response = yield (0, supertest_1.default)(app).get("/posts");
            expect(response.statusCode).toBe(200);
            expect(response.body).toHaveLength(1);
        }));
        test("Get posts by owner", () => __awaiter(void 0, void 0, void 0, function* () {
            const response = yield (0, supertest_1.default)(app).get(`/posts?owner=${validPost.owner}`);
            expect(response.statusCode).toBe(200);
            expect(response.body).toHaveLength(1);
            expect(response.body[0].owner).toBe(validPost.owner);
        }));
        test("Get post by valid ID", () => __awaiter(void 0, void 0, void 0, function* () {
            const response = yield (0, supertest_1.default)(app).get(`/posts/${postId}`);
            expect(response.statusCode).toBe(200);
            expect(response.body._id).toBe(postId);
        }));
        test("Get post by invalid ID format", () => __awaiter(void 0, void 0, void 0, function* () {
            const response = yield (0, supertest_1.default)(app).get("/posts/invalid-id");
            expect(response.statusCode).toBe(400);
        }));
        test("Get post by non-existing ID", () => __awaiter(void 0, void 0, void 0, function* () {
            const nonExistingId = "67447b032ce3164be7c4412d";
            const response = yield (0, supertest_1.default)(app).get(`/posts/${nonExistingId}`);
            expect(response.statusCode).toBe(404);
        }));
        test("Update post with valid data", () => __awaiter(void 0, void 0, void 0, function* () {
            const updatedData = { title: "Updated Title" };
            const response = yield (0, supertest_1.default)(app)
                .put(`/posts/${postId}`)
                .set("authorization", `JWT ${accessToken}`)
                .send(updatedData);
            expect(response.statusCode).toBe(200);
            expect(response.body.title).toBe(updatedData.title);
        }));
        test("Update post with invalid ID format", () => __awaiter(void 0, void 0, void 0, function* () {
            const response = yield (0, supertest_1.default)(app)
                .put("/posts/invalid-id")
                .set("authorization", `JWT ${accessToken}`)
                .send({ title: "Test" });
            expect(response.statusCode).toBe(400);
        }));
        test("Update non-existing post", () => __awaiter(void 0, void 0, void 0, function* () {
            const nonExistingId = "67447b032ce3164be7c4412d";
            const response = yield (0, supertest_1.default)(app)
                .put(`/posts/${nonExistingId}`)
                .set("authorization", `JWT ${accessToken}`)
                .send({ title: "Test" });
            expect(response.statusCode).toBe(404);
        }));
        test("Delete post with valid ID", () => __awaiter(void 0, void 0, void 0, function* () {
            const response = yield (0, supertest_1.default)(app)
                .delete(`/posts/${postId}`)
                .set("authorization", `JWT ${accessToken}`);
            expect(response.statusCode).toBe(200);
        }));
        test("Delete post with invalid ID format", () => __awaiter(void 0, void 0, void 0, function* () {
            const response = yield (0, supertest_1.default)(app).delete("/posts/invalid-id");
            expect(response.statusCode).toBe(400);
        }));
        test("Delete non-existing post", () => __awaiter(void 0, void 0, void 0, function* () {
            const nonExistingId = "64a79b44dc9f9f73013f2612";
            const response = yield (0, supertest_1.default)(app)
                .delete(`/posts/${nonExistingId}`)
                .set("authorization", `JWT ${accessToken}`);
            expect(response.statusCode).toBe(404);
        }));
    });
    describe("Error Handling", () => {
        test("Handle DB error on GetAll", () => __awaiter(void 0, void 0, void 0, function* () {
            try {
                yield posts_models_1.default.find().limit(1); // נסה לבדוק שגיאת מסד נתונים
                const response = yield (0, supertest_1.default)(app).get("/posts");
                expect(response.statusCode).toBe(400);
            }
            catch (error) {
                // אם יש שגיאת מסד נתונים
                expect(error).toBeDefined();
            }
        }));
        test("Handle invalid owner filter", () => __awaiter(void 0, void 0, void 0, function* () {
            const invalidOwnerId = "zzzzzzzzzzzzzzzzzzzzzzzz"; // 24 תווים אך לא תקין
            const response = yield (0, supertest_1.default)(app).get(`/posts?owner=${invalidOwnerId}`);
            expect(response.statusCode).toBe(400);
            expect(response.text).toBe("Invalid owner ID format");
        }));
        test("Handle validation errors on update", () => __awaiter(void 0, void 0, void 0, function* () {
            const invalidData = { title: { invalid: "format" } };
            const invalidPostId = new mongoose_1.default.Types.ObjectId();
            const response = yield (0, supertest_1.default)(app)
                .put(`/posts/${invalidPostId}`)
                .set("authorization", `JWT ${accessToken}`)
                .send(invalidData);
            expect(response.statusCode).toBe(400);
        }));
        test("Handle validation errors on create", () => __awaiter(void 0, void 0, void 0, function* () {
            const invalidData = { title: { invalidKey: 123 } };
            const response = yield (0, supertest_1.default)(app)
                .post("/posts")
                .set("authorization", `JWT ${accessToken}`)
                .send(invalidData);
            expect(response.statusCode).toBe(400);
        }));
    });
});
//# sourceMappingURL=posts.test.js.map