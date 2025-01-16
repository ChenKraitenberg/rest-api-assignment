import initApp from "../server";
import mongoose from "mongoose";
import dotenv from "dotenv";

// טעינת משתני סביבה
dotenv.config({ path: ".env_test" });

// הגדרת זמן מקסימלי לטסטים
jest.setTimeout(30000);

describe("Server initialization tests", () => {
  beforeAll(async () => {
    // ניתוק מכל חיבור קיים
    if (mongoose.connection.readyState !== 0) {
      await mongoose.disconnect();
    }
  });

  afterAll(async () => {
    // ניתוק החיבור בסוף הטסטים
    if (mongoose.connection.readyState !== 0) {
      await mongoose.disconnect();
    }
  });

  beforeEach(async () => {
    // ניתוק חיבורים לפני כל טסט
    if (mongoose.connection.readyState !== 0) {
      await mongoose.disconnect();
    }
  });

  test("Should throw an error when DB_CONNECT is not set", async () => {
    const originalDbConnect = process.env.DB_CONNECT;

    // מחיקת משתנה הסביבה
    delete process.env.DB_CONNECT;

    // בדיקה שהפונקציה זורקת שגיאה
    await expect(initApp()).rejects.toThrow("DB_CONNECT is not defined");

    // שחזור משתנה הסביבה
    process.env.DB_CONNECT = originalDbConnect;
  });

  test("Test that the connection is correct when DB_CONNECT is set correctly", async () => {
    expect(process.env.DB_CONNECT).toBeDefined();

    // אתחול האפליקציה
    const app = await initApp();

    // וידוא שהאפליקציה הוחזרה
    expect(app).toBeDefined();

    // וידוא שהחיבור למסד הנתונים פעיל
    expect(mongoose.connection.readyState).toBe(1); // מצב מחובר
  });

  test("disconnection test", async () => {
    if (mongoose.connection.readyState !== 0) {
      await mongoose.disconnect();
    }

    expect(mongoose.connection.readyState).toBe(0); // מצב מנותק

    const app = await initApp();
    expect(app).toBeDefined();
    expect(mongoose.connection.readyState).toBe(1); // התחבר בהצלחה
  });

  test("Test that database connection error handling is performed correctly", async () => {
    // this shuld be print error in console
    const originalDbConnect = process.env.DB_CONNECT;

    // הגדרת מחרוזת חיבור לא תקינה
    process.env.DB_CONNECT =
      "mongodb://invalid-connection-string:27017/testdb?serverSelectionTimeoutMS=1000";

    // בדיקה שהפונקציה זורקת שגיאה
    await expect(initApp()).rejects.toThrow();

    // שחזור מחרוזת החיבור המקורית
    process.env.DB_CONNECT = originalDbConnect;
  });

  test("Make sure to close an existing connection before a new connection", async () => {
    // התחבר למסד הנתונים בפעם הראשונה
    await initApp();
    const firstConnectionState = mongoose.connection.readyState;

    // התחבר שוב
    await initApp();
    const secondConnectionState = mongoose.connection.readyState;

    // וידוא שהחיבור נשאר פעיל
    expect(firstConnectionState).toBe(1); // מחובר
    expect(secondConnectionState).toBe(1); // עדיין מחובר
  });

  test("Make sure to disconnect all connections after the tests are finished", async () => {
    await initApp();

    expect(mongoose.connection.readyState).toBe(1); // מחובר

    // ניתוק החיבור
    await mongoose.disconnect();
    expect(mongoose.connection.readyState).toBe(0); // מנותק
  });
  test("Test that checking that the Connecting mode is handled properly", async () => {
    // התחלת חיבור למסד הנתונים
    const connectionPromise = mongoose.connect(process.env.DB_CONNECT!, {});

    // וידוא שמצב החיבור הוא "Connecting" (2)
    expect(mongoose.connection.readyState).toBe(2);

    // הפעלת הפונקציה
    await initApp();

    // וידוא שהחיבור נסגר (readyState יחזור ל-1)
    await connectionPromise; // מחכים שהחיבור יושלם כדי למנוע בעיות
    expect(mongoose.connection.readyState).toBe(1); // מצב מחובר
  });
});
