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
const server_1 = __importDefault(require("../server"));
const mongoose_1 = __importDefault(require("mongoose"));
const dotenv_1 = __importDefault(require("dotenv"));
// טעינת משתני סביבה
dotenv_1.default.config({ path: ".env_test" });
// הגדרת זמן מקסימלי לטסטים
jest.setTimeout(30000);
describe("Server initialization tests", () => {
    beforeAll(() => __awaiter(void 0, void 0, void 0, function* () {
        // ניתוק מכל חיבור קיים
        if (mongoose_1.default.connection.readyState !== 0) {
            yield mongoose_1.default.disconnect();
        }
    }));
    afterAll(() => __awaiter(void 0, void 0, void 0, function* () {
        // ניתוק החיבור בסוף הטסטים
        if (mongoose_1.default.connection.readyState !== 0) {
            yield mongoose_1.default.disconnect();
        }
    }));
    beforeEach(() => __awaiter(void 0, void 0, void 0, function* () {
        // ניתוק חיבורים לפני כל טסט
        if (mongoose_1.default.connection.readyState !== 0) {
            yield mongoose_1.default.disconnect();
        }
    }));
    test("Should throw an error when DB_CONNECT is not set", () => __awaiter(void 0, void 0, void 0, function* () {
        const originalDbConnect = process.env.DB_CONNECT;
        // מחיקת משתנה הסביבה
        delete process.env.DB_CONNECT;
        // בדיקה שהפונקציה זורקת שגיאה
        yield expect((0, server_1.default)()).rejects.toThrow("DB_CONNECT is not defined");
        // שחזור משתנה הסביבה
        process.env.DB_CONNECT = originalDbConnect;
    }));
    test("Test that the connection is correct when DB_CONNECT is set correctly", () => __awaiter(void 0, void 0, void 0, function* () {
        expect(process.env.DB_CONNECT).toBeDefined();
        // אתחול האפליקציה
        const app = yield (0, server_1.default)();
        // וידוא שהאפליקציה הוחזרה
        expect(app).toBeDefined();
        // וידוא שהחיבור למסד הנתונים פעיל
        expect(mongoose_1.default.connection.readyState).toBe(1); // מצב מחובר
    }));
    test("disconnection test", () => __awaiter(void 0, void 0, void 0, function* () {
        if (mongoose_1.default.connection.readyState !== 0) {
            yield mongoose_1.default.disconnect();
        }
        expect(mongoose_1.default.connection.readyState).toBe(0); // מצב מנותק
        const app = yield (0, server_1.default)();
        expect(app).toBeDefined();
        expect(mongoose_1.default.connection.readyState).toBe(1); // התחבר בהצלחה
    }));
    test("Test that database connection error handling is performed correctly", () => __awaiter(void 0, void 0, void 0, function* () {
        // this shuld be print error in console
        const originalDbConnect = process.env.DB_CONNECT;
        // הגדרת מחרוזת חיבור לא תקינה
        process.env.DB_CONNECT =
            "mongodb://invalid-connection-string:27017/testdb?serverSelectionTimeoutMS=1000";
        // בדיקה שהפונקציה זורקת שגיאה
        yield expect((0, server_1.default)()).rejects.toThrow();
        // שחזור מחרוזת החיבור המקורית
        process.env.DB_CONNECT = originalDbConnect;
    }));
    test("Make sure to close an existing connection before a new connection", () => __awaiter(void 0, void 0, void 0, function* () {
        // התחבר למסד הנתונים בפעם הראשונה
        yield (0, server_1.default)();
        const firstConnectionState = mongoose_1.default.connection.readyState;
        // התחבר שוב
        yield (0, server_1.default)();
        const secondConnectionState = mongoose_1.default.connection.readyState;
        // וידוא שהחיבור נשאר פעיל
        expect(firstConnectionState).toBe(1); // מחובר
        expect(secondConnectionState).toBe(1); // עדיין מחובר
    }));
    test("Make sure to disconnect all connections after the tests are finished", () => __awaiter(void 0, void 0, void 0, function* () {
        yield (0, server_1.default)();
        expect(mongoose_1.default.connection.readyState).toBe(1); // מחובר
        // ניתוק החיבור
        yield mongoose_1.default.disconnect();
        expect(mongoose_1.default.connection.readyState).toBe(0); // מנותק
    }));
    test("Test that checking that the Connecting mode is handled properly", () => __awaiter(void 0, void 0, void 0, function* () {
        // התחלת חיבור למסד הנתונים
        const connectionPromise = mongoose_1.default.connect(process.env.DB_CONNECT, {});
        // וידוא שמצב החיבור הוא "Connecting" (2)
        expect(mongoose_1.default.connection.readyState).toBe(2);
        // הפעלת הפונקציה
        yield (0, server_1.default)();
        // וידוא שהחיבור נסגר (readyState יחזור ל-1)
        yield connectionPromise; // מחכים שהחיבור יושלם כדי למנוע בעיות
        expect(mongoose_1.default.connection.readyState).toBe(1); // מצב מחובר
    }));
});
//# sourceMappingURL=server.test.js.map