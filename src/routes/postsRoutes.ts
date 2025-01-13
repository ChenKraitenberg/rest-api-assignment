import express from "express";
const router = express.Router();
import postController from "../controllers/postsController";
import { authMiddleware } from "../controllers/authController";


/**
* @swagger
* tags:
*   name: Posts 
*   description: The Posts API
*/


/**
 * @swagger
 * components:
 *   schemas:
 *     Post:
 *       type: object
 *       required:
 *         - title
 *         - content
 *         - owner
 *       properties:
 *         title:
 *           type: string
 *           description: The post title
 *         content:
 *           type: string
 *           description: The post content
 *         owner:
 *           type: string
 *           description: The user ID of the post's owner
 *       example:
 *         title: My First Post
 *         content: This is the content of my first post.
 *         owner: 61d8c7e8a09c1f001e8d2f1a
 */

/**
 * @swagger
 * /posts:
 *   get:
 *     summary: Get all posts
 *     tags: [Posts]
 *     parameters:
 *       - in: query
 *         name: owner
 *         schema:
 *           type: string
 *         description: Filter posts by owner ID
 *     responses:
 *       200:
 *         description: List of all posts
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Post'
 *       400:
 *         description: Bad request
 */
// get all posts
router.get("/", postController.getAll.bind(postController));


/**
 * @swagger
 * /posts/{id}:
 *   get:
 *     summary: Get a post by ID
 *     tags: [Posts]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The post ID
 *     responses:
 *       200:
 *         description: Post data
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Post'
 *       404:
 *         description: Post not found
 *       400:
 *         description: Bad request
 */
// get post by id
router.get("/:id", (req, res) => {
  postController.getById(req, res);
});


/**
 * @swagger
 * /posts:
 *   post:
 *     summary: Create a new post
 *     tags: [Posts]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Post'
 *     responses:
 *       201:
 *         description: Post created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 _id:
 *                   type: string
 *                   description: The unique ID of the created post
 *                 title:
 *                   type: string
 *                   required: true 
 *                   description: The title of the post
 *                 content:
 *                   type: string
 *                   required: true
 *                   description: The content of the post
 *                 owner:
 *                   type: string
 *                   description: The user ID of the post's owner
 *               example:
 *                 _id: "61d8c7e8a09c1f001e8d2f1a"
 *                 title: "My First Post"
 *                 content: "This is the content of my first post."
 *                 owner: "61d8c7e8a09c1f001e8d2f1b"
 *       400:
 *         description: Bad request
 *       401:
 *         description: Unauthorized
 */

// create post
router.post("/", authMiddleware, postController.create.bind(postController));


/**
 * @swagger
 * /posts/{id}:
 *   put:
 *     summary: Update a post by ID
 *     tags: [Posts]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The post ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Post'
 *     responses:
 *       200:
 *         description: Post updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 _id:
 *                   type: string
 *                   description: The unique ID of the post
 *                 title:
 *                   type: string
 *                   description: The title of the post
 *                 content:
 *                   type: string
 *                   description: The content of the post
 *                 owner:
 *                   type: string
 *                   description: The user ID of the post's owner
 *               example:
 *                 _id: "61d8c7e8a09c1f001e8d2f1a"
 *                 title: "Updated Post Title"
 *                 content: "This is the updated content of the post."
 *                 owner: "61d8c7e8a09c1f001e8d2f1b"
 *       404:
 *         description: Post not found
 *         content:
 *           application/json:
 *             example:
 *               message: "Post not found"
 *       400:
 *         description: Bad request
 *         content:
 *           application/json:
 *             example:
 *               message: "ValidationError: Path `title` is required."
 */

// update post
router.put("/:id", postController.update.bind(postController));


/**
 * @swagger
 * /posts/{id}:
 *   delete:
 *     summary: Delete a post by ID
 *     tags: [Posts]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The post ID
 *     responses:
 *       200:
 *         description: Post deleted successfully
 *       404:
 *         description: Post not found
 *       400:
 *         description: Bad request
 */
// delete post
router.delete(
  "/:id",
  authMiddleware,
  postController.delete.bind(postController)
);

export default router;
