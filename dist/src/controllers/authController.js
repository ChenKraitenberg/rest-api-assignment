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
exports.authMiddleware = void 0;
const user_model_1 = __importDefault(require("../models/user_model"));
const bcrypt_1 = __importDefault(require("bcrypt"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const register = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const password = req.body.password;
        const salt = yield bcrypt_1.default.genSalt(10);
        const hashedPassword = yield bcrypt_1.default.hash(password, salt);
        const user = yield user_model_1.default.create({
            email: req.body.email,
            password: hashedPassword,
        });
        res.status(200).send(user);
    }
    catch (err) {
        res.status(400).send(err);
    }
});
const generateTokens = (user) => {
    if (process.env.TOKEN_SECRET === undefined) {
        return null;
    }
    const rand = Math.random();
    const accessToken = jsonwebtoken_1.default.sign({
        _id: user._id,
        rand: rand,
    }, process.env.TOKEN_SECRET, { expiresIn: process.env.TOKEN_EXPIRATION });
    const refreshToken = jsonwebtoken_1.default.sign({
        _id: user._id,
        rand: rand,
    }, process.env.TOKEN_SECRET, { expiresIn: process.env.REFRESH_TOKEN_EXPIRATION });
    return { refreshToken: refreshToken, accessToken: accessToken };
};
const login = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const email = req.body.email;
    const password = req.body.password;
    try {
        const user = yield user_model_1.default.findOne({ email: email });
        if (!user) {
            res.status(400).send("incorrect email or password");
            return;
        }
        const validPassword = yield bcrypt_1.default.compare(password, user.password);
        if (!validPassword) {
            res.status(400).send("incorrect email or password");
            return;
        }
        const tokens = generateTokens(user);
        if (!tokens) {
            res.status(400).send("error");
            return;
        }
        if (user.refreshTokens == undefined) {
            user.refreshTokens = [];
        }
        user.refreshTokens.push(tokens.refreshToken);
        user.save();
        res.status(200).send(Object.assign(Object.assign({}, tokens), { _id: user._id }));
    }
    catch (err) {
        res.status(400).send(err);
    }
});
const validateRefreshToken = (refreshToken) => {
    return new Promise((resolve, reject) => {
        if (refreshToken == null) {
            reject("error");
            return;
        }
        if (!process.env.TOKEN_SECRET) {
            reject("error");
            return;
        }
        jsonwebtoken_1.default.verify(refreshToken, process.env.TOKEN_SECRET, (err, payload) => __awaiter(void 0, void 0, void 0, function* () {
            if (err) {
                reject(err);
                return;
            }
            const userId = payload._id;
            try {
                const user = yield user_model_1.default.findById(userId);
                if (!user) {
                    reject("error");
                    return;
                }
                //check if token exists
                if (!user.refreshTokens ||
                    !user.refreshTokens.includes(refreshToken)) {
                    user.refreshTokens = [];
                    yield user.save();
                    reject(err);
                    return;
                }
                resolve(user);
            }
            catch (err) {
                reject(err);
            }
        }));
    });
};
const logout = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const user = yield validateRefreshToken(req.body.refreshToken);
        if (!user) {
            res.status(400).send("error");
            return;
        }
        //remove the token from the user
        user.refreshTokens = user.refreshTokens.filter((token) => token !== req.body.refreshToken);
        yield user.save();
        res.status(200).send("logged out");
    }
    catch (err) {
        res.status(400).send("error");
        return;
    }
});
const refresh = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const user = yield validateRefreshToken(req.body.refreshToken);
        const tokens = generateTokens(user);
        if (!tokens) {
            res.status(400).send("error");
            return;
        }
        user.refreshTokens = user.refreshTokens.filter((token) => token !== req.body.refreshToken);
        user.refreshTokens.push(tokens.refreshToken);
        yield user.save();
        res.status(200).send(Object.assign(Object.assign({}, tokens), { _id: user._id }));
    }
    catch (err) {
        res.status(400).send("error");
    }
});
const authMiddleware = (req, res, next) => {
    const tokenHeader = req.headers["authorization"];
    const token = tokenHeader && tokenHeader.split(" ")[1];
    if (!token) {
        res.status(400).send("Access denied");
        return;
    }
    if (process.env.TOKEN_SECRET === undefined) {
        res.status(400).send("server error");
        return;
    }
    jsonwebtoken_1.default.verify(token, process.env.TOKEN_SECRET, (err, payload) => {
        if (err) {
            res.status(400).send("Access denied");
        }
        else {
            const userId = payload._id;
            req.params.userId = userId;
            next();
        }
    });
};
exports.authMiddleware = authMiddleware;
exports.default = {
    register,
    login,
    refresh,
    logout,
};
//# sourceMappingURL=authController.js.map