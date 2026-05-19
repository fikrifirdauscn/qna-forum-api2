const express = require("express");
const authenticateToken = require("../middleware/authMiddleware");
const {
  createThread,
  getAllThreads,
  getMyThreads,
  getThreadById,
  updateThread,
  deleteThread
} = require("../controllers/threadController");

const router = express.Router();

/**
 * @swagger
 * /api/threads:
 *   post:
 *     summary: Create a new thread
 *     tags: [Threads]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *               - content
 *             properties:
 *               title:
 *                 type: string
 *                 example: How do I set up environment variables in Node.js?
 *               content:
 *                 type: string
 *                 example: I am confused about dotenv. Can someone explain?
 *     responses:
 *       201:
 *         description: Thread created successfully
 *       400:
 *         description: Title and content are required
 *       401:
 *         description: Unauthorized
 */
router.post("/", authenticateToken, createThread);

/**
 * @swagger
 * /api/threads:
 *   get:
 *     summary: Get all threads
 *     tags: [Threads]
 *     responses:
 *       200:
 *         description: Threads retrieved successfully
 */
router.get("/", getAllThreads);

/**
 * @swagger
 * /api/threads/my-threads:
 *   get:
 *     summary: Get threads created by logged-in user
 *     tags: [Threads]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: My threads retrieved successfully
 *       401:
 *         description: Unauthorized
 */
router.get("/my-threads", authenticateToken, getMyThreads);

/**
 * @swagger
 * /api/threads/{id}:
 *   get:
 *     summary: Get thread by ID
 *     tags: [Threads]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         example: T-123
 *     responses:
 *       200:
 *         description: Thread retrieved successfully
 *       404:
 *         description: Thread not found
 */
router.get("/:id", getThreadById);

/**
 * @swagger
 * /api/threads/{id}:
 *   put:
 *     summary: Update thread by ID, only by creator
 *     tags: [Threads]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         example: T-123
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *               - content
 *             properties:
 *               title:
 *                 type: string
 *                 example: Updated thread title
 *               content:
 *                 type: string
 *                 example: Updated thread content
 *     responses:
 *       200:
 *         description: Thread updated successfully
 *       400:
 *         description: Title and content are required
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden, only creator can update
 *       404:
 *         description: Thread not found
 */
router.put("/:id", authenticateToken, updateThread);

/**
 * @swagger
 * /api/threads/{id}:
 *   delete:
 *     summary: Delete thread by ID, only by creator
 *     tags: [Threads]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         example: T-123
 *     responses:
 *       200:
 *         description: Thread deleted successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden, only creator can delete
 *       404:
 *         description: Thread not found
 */
router.delete("/:id", authenticateToken, deleteThread);

module.exports = router;