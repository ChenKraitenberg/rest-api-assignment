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
const comment_models_1 = __importDefault(require("../models/comment_models"));
const user_model_1 = __importDefault(require("../models/user_model"));
// ---------- Global Variables ----------
let app;
const testUser = {
    email: `test_${Date.now()}@user.com`, // אימייל שונה בכל הרצה
    password: "123456",
};
let accessToken;
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
beforeAll(() => __awaiter(void 0, void 0, void 0, function* () {
    app = yield (0, server_1.default)();
    // מוחקים את כל ה-Comments
    yield comment_models_1.default.deleteMany();
    // מוחקים את המשתמש שכבר קיים עם אותו מייל (או מוחקים את כולם)
    yield user_model_1.default.deleteMany({ email: testUser.email });
    //  נרשמים
    const registerRes = yield (0, supertest_1.default)(app).post("/auth/register").send(testUser);
    expect(registerRes.statusCode).toBe(200);
    // מתחברים
    const loginRes = yield (0, supertest_1.default)(app).post("/auth/login").send(testUser);
    expect(loginRes.statusCode).toBe(200);
    accessToken = loginRes.body.accessToken;
}));
afterAll(() => __awaiter(void 0, void 0, void 0, function* () {
    yield mongoose_1.default.connection.close();
}));
// ---------- Tests ----------
describe("Comments test suite", () => {
    test("Comment test get all", () => __awaiter(void 0, void 0, void 0, function* () {
        const response = yield (0, supertest_1.default)(app).get("/comments");
        expect(response.statusCode).toBe(200);
        expect(response.body).toHaveLength(0);
    }));
    test("Test Adding new comment", () => __awaiter(void 0, void 0, void 0, function* () {
        const response = yield (0, supertest_1.default)(app)
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
    }));
    // גם כאן צריך לשלוח טוקן כי גם POST זה דורש authMiddleware
    test("Test Adding invalid comment", () => __awaiter(void 0, void 0, void 0, function* () {
        const response = yield (0, supertest_1.default)(app)
            .post("/comments")
            .set({ authorization: `JWT ${accessToken}` })
            .send(invalidComment);
        // מצפים שלא יהיה 201 כי חסרים שדות חובה
        expect(response.statusCode).not.toBe(201);
    }));
    test("Test get all comments after adding", () => __awaiter(void 0, void 0, void 0, function* () {
        const response = yield (0, supertest_1.default)(app).get("/comments");
        expect(response.statusCode).toBe(200);
        // כעת אמור להיות 1 כי הוספנו פוסט אחד מוצלח
        expect(response.body).toHaveLength(1);
    }));
    test("Test get comment by owner", () => __awaiter(void 0, void 0, void 0, function* () {
        const response = yield (0, supertest_1.default)(app).get("/comments?owner=" + testComment.owner);
        expect(response.statusCode).toBe(200);
        expect(response.body).toHaveLength(1);
        expect(response.body[0].owner).toBe(testComment.owner);
    }));
    test("Test get comment by id", () => __awaiter(void 0, void 0, void 0, function* () {
        const response = yield (0, supertest_1.default)(app).get("/comments/" + commentId);
        expect(response.statusCode).toBe(200);
        expect(response.body._id).toBe(commentId);
    }));
    test("Test get comment by id fail", () => __awaiter(void 0, void 0, void 0, function* () {
        const response = yield (0, supertest_1.default)(app).get("/comments/67447b032ce3164be7c4412d");
        expect(response.statusCode).toBe(404);
    }));
});
//# sourceMappingURL=comments.test.js.map