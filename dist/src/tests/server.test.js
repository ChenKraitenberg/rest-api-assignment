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
// Mock dotenv
jest.mock("dotenv", () => ({
    config: jest.fn(),
}));
// Mock mongoose
jest.mock("mongoose", () => (Object.assign(Object.assign({}, jest.requireActual("mongoose")), { connect: jest.fn(), connection: {
        readyState: 0,
        close: jest.fn().mockResolvedValue(null),
    } })));
describe("Server Initialization", () => {
    beforeEach(() => {
        // Reset environment variables and mocks before each test
        jest.clearAllMocks();
        delete process.env.DB_CONNECT;
        mongoose_1.default.connection.readyState = 0;
    });
    test("should throw error when DB_CONNECT is not defined", () => __awaiter(void 0, void 0, void 0, function* () {
        // Remove DB_CONNECT environment variable
        delete process.env.DB_CONNECT;
        // Expect the initApp to reject with an error
        yield expect((0, server_1.default)()).rejects.toThrow("DB_CONNECT is not defined");
    }));
    test("should handle database connection states", () => __awaiter(void 0, void 0, void 0, function* () {
        // Mock mongoose connection
        process.env.DB_CONNECT = "mongodb://test-connection-string";
        mongoose_1.default.connect.mockResolvedValue({});
        // Scenario 1: Already connected state
        mongoose_1.default.connection.readyState = 1;
        const appAlreadyConnected = yield (0, server_1.default)();
        expect(appAlreadyConnected).toBeDefined();
        // Scenario 2: Connecting state
        mongoose_1.default.connection.readyState = 2;
        const appConnecting = yield (0, server_1.default)();
        expect(appConnecting).toBeDefined();
        // Scenario 3: Disconnected state
        mongoose_1.default.connection.readyState = 0;
        const appDisconnected = yield (0, server_1.default)();
        expect(appDisconnected).toBeDefined();
    }));
    test("should close existing connection before connecting", () => __awaiter(void 0, void 0, void 0, function* () {
        // Setup
        process.env.DB_CONNECT = "mongodb://test-connection-string";
        mongoose_1.default.connection.readyState = 2; // Connecting state
        mongoose_1.default.connect.mockResolvedValue({});
        yield (0, server_1.default)();
        // Verify that close was called
        expect(mongoose_1.default.connection.close).toHaveBeenCalled();
        expect(mongoose_1.default.connect).toHaveBeenCalledWith("mongodb://test-connection-string");
    }));
    test("should handle mongoose connection errors", () => __awaiter(void 0, void 0, void 0, function* () {
        // Mock mongoose connect to throw an error
        process.env.DB_CONNECT = "mongodb://invalid-connection-string";
        const connectionError = new Error("Connection failed");
        mongoose_1.default.connect.mockRejectedValue(connectionError);
        // Expect initApp to reject with the connection error
        yield expect((0, server_1.default)()).rejects.toThrow("Connection failed");
    }));
});
//# sourceMappingURL=server.test.js.map