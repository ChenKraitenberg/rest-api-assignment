import express from "express";
const router = express.Router();
import authController from "../controllers/authController";

/**
* @swagger
* tags:
*   name: Auth
*   description: The Authentication API
*/


/**
* @swagger
* components:
*   securitySchemes:
*       bearerAuth:
*           type: http
*           scheme: bearer
*           bearerFormat: JWT
*/

/**
* @swagger
* components:
*   schemas:
*     User:
*       type: object
*       required:
*         - email
*         - password
*       properties:
*         email:
*           type: string
*           description: The user's email
*         password:
*           type: string
*           description: The user's password
*       example:
*         email: 'bob@example.com'
*         password: 'password123'
*/


/**
* @swagger
* /auth/register:
 *   post:
 *     summary: Registers a new user
 *     tags: [Auth]
 *     requestBody: 
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/User'
 *     responses:
 *       200:
 *         description: Registered successfully, returns the user
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 */
router.post("/register", authController.register);

/**
 * @swagger
 * /auth/login:
 *   post:
 *     summary: Logs in a user
 *     tags: [Auth]
 *     requestBody: 
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/User'
 *     responses:
 *       200:
 *         description: Successfully logged in, returns tokens and user ID
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 accessToken:
 *                   type: string
 *                   description: JWT Access token
 *                 refreshToken:
 *                   type: string
 *                   description: JWT Refresh token
 *                 _id:
 *                   type: string
 *                   description: User ID
 *       400:
 *         description: Invalid email or password
 */
router.post("/login", authController.login);

/**
 * @swagger
 * /auth/logout:
 *   post:
 *     summary: Logs out a user
 *     tags: [Auth]
 *     requestBody: 
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               refreshToken:
 *                 type: string
 *                 description: The refresh token to invalidate
 *     responses:
 *       200:
 *         description: Successfully logged out
 *       400:
 *         description: Invalid refresh token
 */
router.post("/logout", authController.logout);

/**
 * @swagger
 * /auth/refresh:
 *   post:
 *     summary: Refreshes access and refresh tokens
 *     tags: [Auth]
 *     requestBody: 
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               refreshToken:
 *                 type: string
 *                 description: The refresh token to renew
 *     responses:
 *       200:
 *         description: Successfully refreshed tokens
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 accessToken:
 *                   type: string
 *                   description: New access token
 *                 refreshToken:
 *                   type: string
 *                   description: New refresh token
 *                 _id:
 *                   type: string
 *                   description: User ID
 *       400:
 *         description: Invalid refresh token
 */
router.post("/refresh", authController.refresh);

export default router;
