"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const router = express_1.default.Router();
const commentController_1 = __importDefault(require("../controllers/commentController"));
const authController_1 = require("../controllers/authController");
/**
* @swagger
* tags:
*   name: Comments
*   description: The Comments API
*/
/**
 * @swagger
 * components:
 *   schemas:
 *     Comment:
 *       type: object
 *       required:
 *         - comment
 *         - postId
 *         - owner
 *       properties:
 *         comment:
 *           type: string
 *           description: The content of the comment
 *         postId:
 *           type: string
 *           description: The ID of the post associated with the comment
 *         owner:
 *           type: string
 *           description: The ID of the user who owns the comment
 *       example:
 *         comment: This is a great post!
 *         postId: 61d8c7e8a09c1f001e8d2f1a
 *         owner: 61d8c7e8a09c1f001e8d2f1b
 */
/**
 * @swagger
 * /comments:
 *   get:
 *     summary: Get all comments
 *     tags: [Comments]
 *     parameters:
 *       - in: query
 *         name: owner
 *         schema:
 *           type: string
 *         description: Filter comments by owner ID
 *     responses:
 *       200:
 *         description: List of all comments
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Comment'
 *       400:
 *         description: Bad request
 */
// get all comments
router.get("/", commentController_1.default.getAll.bind(commentController_1.default));
/**
 * @swagger
 * /comments/{id}:
 *   get:
 *     summary: Get a comment by ID
 *     tags: [Comments]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The comment ID
 *     responses:
 *       200:
 *         description: Comment data
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Comment'
 *       404:
 *         description: Comment not found
 *       400:
 *         description: Bad request
 */
// get comment by id
router.get("/:id", (req, res) => {
    commentController_1.default.getById(req, res);
});
/**
 * @swagger
 * /comments:
 *   post:
 *     summary: Create a new comment
 *     tags: [Comments]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Comment'
 *     responses:
 *       201:
 *         description: Comment created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 _id:
 *                   type: string
 *                   description: The unique ID of the comment
 *                 comment:
 *                   type: string
 *                   description: The content of the comment
 *                 postId:
 *                   type: string
 *                   description: The ID of the post associated with the comment
 *                 owner:
 *                   type: string
 *                   description: The user ID of the comment's owner
 *               example:
 *                 _id: "61d8c7e8a09c1f001e8d2f1a"
 *                 comment: "This is a great post!"
 *                 postId: "61d8c7e8a09c1f001e8d2f1b"
 *                 owner: "61d8c7e8a09c1f001e8d2f1c"
 *       400:
 *         description: Bad request
 *         content:
 *           application/json:
 *             example:
 *               message: "ValidationError: Path `comment` is required."
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             example:
 *               message: "Access denied. Please provide a valid token."
 */
// create comment
router.post("/", authController_1.authMiddleware, commentController_1.default.create.bind(commentController_1.default));
/**
 * @swagger
 * /comments/{id}:
 *   put:
 *     summary: Update a comment by ID
 *     tags: [Comments]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The comment ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Comment'
 *     responses:
 *       200:
 *         description: Comment updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 _id:
 *                   type: string
 *                   description: The unique ID of the comment
 *                 comment:
 *                   type: string
 *                   description: The content of the comment
 *                 postId:
 *                   type: string
 *                   description: The ID of the post associated with the comment
 *                 owner:
 *                   type: string
 *                   description: The user ID of the comment's owner
 *               example:
 *                 _id: "61d8c7e8a09c1f001e8d2f1a"
 *                 comment: "Updated comment content"
 *                 postId: "61d8c7e8a09c1f001e8d2f1b"
 *                 owner: "61d8c7e8a09c1f001e8d2f1c"
 *       404:
 *         description: Comment not found
 *         content:
 *           application/json:
 *             example:
 *               message: "Comment not found"
 *       400:
 *         description: Bad request
 *         content:
 *           application/json:
 *             example:
 *               message: "ValidationError: Path `comment` is required."
 */
// update comment
router.put("/:id", commentController_1.default.update.bind(commentController_1.default));
/**
 * @swagger
 * /comments/{id}:
 *   delete:
 *     summary: Delete a comment by ID
 *     tags: [Comments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The comment ID
 *     responses:
 *       200:
 *         description: Comment deleted successfully
 *       404:
 *         description: Comment not found
 *       400:
 *         description: Bad request
 *       401:
 *         description: Unauthorized
 */
// delete comment
router.delete("/:id", authController_1.authMiddleware, commentController_1.default.delete.bind(commentController_1.default));
exports.default = router;
//# sourceMappingURL=commentsRoutes.js.map