const { v4: uuidv4 } = require("uuid");
const db = require("../config/db");

function createThread(req, res) {
  const { title, content } = req.body;
  const userId = req.user.id;

  if (!title || !content) {
    return res.status(400).json({
      message: "Title and content are required"
    });
  }

  const threadId = `T-${uuidv4()}`;
  const now = new Date().toISOString();

  db.run(
    `
      INSERT INTO threads (id, user_id, title, content, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?)
    `,
    [threadId, userId, title, content, now, now],
    function (error) {
      if (error) {
        return res.status(500).json({
          message: "Failed to create thread"
        });
      }

      return res.status(201).json({
        message: "Thread created successfully",
        data: {
          id: threadId,
          user_id: userId,
          title,
          content,
          created_at: now,
          updated_at: now
        }
      });
    }
  );
}

function getAllThreads(req, res) {
  db.all(
    `
      SELECT 
        threads.id,
        threads.title,
        threads.content,
        threads.created_at,
        threads.updated_at,
        users.id AS user_id,
        users.username AS username
      FROM threads
      JOIN users ON threads.user_id = users.id
      ORDER BY threads.created_at DESC
    `,
    [],
    (error, threads) => {
      if (error) {
        return res.status(500).json({
          message: "Internal server error"
        });
      }

      return res.status(200).json({
        message: "Threads retrieved successfully",
        data: threads
      });
    }
  );
}

function getMyThreads(req, res) {
  const userId = req.user.id;

  db.all(
    `
      SELECT *
      FROM threads
      WHERE user_id = ?
      ORDER BY created_at DESC
    `,
    [userId],
    (error, threads) => {
      if (error) {
        return res.status(500).json({
          message: "Internal server error"
        });
      }

      return res.status(200).json({
        message: "My threads retrieved successfully",
        data: threads
      });
    }
  );
}

function getThreadById(req, res) {
  const { id } = req.params;

  db.get(
    `
      SELECT 
        threads.id,
        threads.title,
        threads.content,
        threads.created_at,
        threads.updated_at,
        users.id AS user_id,
        users.username AS username
      FROM threads
      JOIN users ON threads.user_id = users.id
      WHERE threads.id = ?
    `,
    [id],
    (error, thread) => {
      if (error) {
        return res.status(500).json({
          message: "Internal server error"
        });
      }

      if (!thread) {
        return res.status(404).json({
          message: "Thread not found"
        });
      }

      return res.status(200).json({
        message: "Thread retrieved successfully",
        data: thread
      });
    }
  );
}

function updateThread(req, res) {
  const { id } = req.params;
  const { title, content } = req.body;
  const userId = req.user.id;

  if (!title || !content) {
    return res.status(400).json({
      message: "Title and content are required"
    });
  }

  db.get("SELECT * FROM threads WHERE id = ?", [id], (error, thread) => {
    if (error) {
      return res.status(500).json({
        message: "Internal server error"
      });
    }

    if (!thread) {
      return res.status(404).json({
        message: "Thread not found"
      });
    }

    if (thread.user_id !== userId) {
      return res.status(403).json({
        message: "You are not allowed to update this thread"
      });
    }

    const updatedAt = new Date().toISOString();

    db.run(
      `
        UPDATE threads
        SET title = ?, content = ?, updated_at = ?
        WHERE id = ?
      `,
      [title, content, updatedAt, id],
      function (updateError) {
        if (updateError) {
          return res.status(500).json({
            message: "Failed to update thread"
          });
        }

        return res.status(200).json({
          message: "Thread updated successfully",
          data: {
            id,
            user_id: userId,
            title,
            content,
            created_at: thread.created_at,
            updated_at: updatedAt
          }
        });
      }
    );
  });
}

function deleteThread(req, res) {
  const { id } = req.params;
  const userId = req.user.id;

  db.get("SELECT * FROM threads WHERE id = ?", [id], (error, thread) => {
    if (error) {
      return res.status(500).json({
        message: "Internal server error"
      });
    }

    if (!thread) {
      return res.status(404).json({
        message: "Thread not found"
      });
    }

    if (thread.user_id !== userId) {
      return res.status(403).json({
        message: "You are not allowed to delete this thread"
      });
    }

    db.run("DELETE FROM threads WHERE id = ?", [id], function (deleteError) {
      if (deleteError) {
        return res.status(500).json({
          message: "Failed to delete thread"
        });
      }

      return res.status(200).json({
        message: "Thread deleted successfully"
      });
    });
  });
}

module.exports = {
  createThread,
  getAllThreads,
  getMyThreads,
  getThreadById,
  updateThread,
  deleteThread
};