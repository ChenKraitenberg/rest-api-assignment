import initApp from "../server";
import mongoose from "mongoose";
import dotenv from "dotenv";

// Mock dotenv
jest.mock("dotenv", () => ({
  config: jest.fn(),
}));

// Mock mongoose
jest.mock("mongoose", () => ({
  ...jest.requireActual("mongoose"),
  connect: jest.fn(),
  connection: {
    readyState: 0,
    close: jest.fn().mockResolvedValue(null),
  },
}));

describe("Server Initialization", () => {
  beforeEach(() => {
    // Reset environment variables and mocks before each test
    jest.clearAllMocks();
    delete process.env.DB_CONNECT;
    (mongoose.connection as any).readyState = 0;
  });

  test("should throw error when DB_CONNECT is not defined", async () => {
    // Remove DB_CONNECT environment variable
    delete process.env.DB_CONNECT;

    // Expect the initApp to reject with an error
    await expect(initApp()).rejects.toThrow("DB_CONNECT is not defined");
  });

  test("should handle database connection states", async () => {
    // Mock mongoose connection
    process.env.DB_CONNECT = "mongodb://test-connection-string";
    (mongoose.connect as jest.Mock).mockResolvedValue({});

    // Scenario 1: Already connected state
    (mongoose.connection as any).readyState = 1;
    const appAlreadyConnected = await initApp();
    expect(appAlreadyConnected).toBeDefined();

    // Scenario 2: Connecting state
    (mongoose.connection as any).readyState = 2;
    const appConnecting = await initApp();
    expect(appConnecting).toBeDefined();

    // Scenario 3: Disconnected state
    (mongoose.connection as any).readyState = 0;
    const appDisconnected = await initApp();
    expect(appDisconnected).toBeDefined();
  });

  test("should close existing connection before connecting", async () => {
    // Setup
    process.env.DB_CONNECT = "mongodb://test-connection-string";
    (mongoose.connection as any).readyState = 2; // Connecting state
    (mongoose.connect as jest.Mock).mockResolvedValue({});

    await initApp();

    // Verify that close was called
    expect(mongoose.connection.close).toHaveBeenCalled();
    expect(mongoose.connect).toHaveBeenCalledWith(
      "mongodb://test-connection-string"
    );
  });

  test("should handle mongoose connection errors", async () => {
    // Mock mongoose connect to throw an error
    process.env.DB_CONNECT = "mongodb://invalid-connection-string";
    const connectionError = new Error("Connection failed");

    (mongoose.connect as jest.Mock).mockRejectedValue(connectionError);

    // Expect initApp to reject with the connection error
    await expect(initApp()).rejects.toThrow("Connection failed");
  });
});
