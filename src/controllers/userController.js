const db = require("../config/db");

function getUserProfile(req, res) {
  const { id } = req.params;

  db.get(
    `
      SELECT id, username, email, created_at
      FROM users
      WHERE id = ?
    `,
    [id],
    (error, user) => {
      if (error) {
        return res.status(500).json({
          message: "Internal server error"
        });
      }

      if (!user) {
        return res.status(404).json({
          message: "User not found"
        });
      }

      return res.status(200).json({
        message: "User profile retrieved successfully",
        data: user
      });
    }
  );
}

module.exports = {
  getUserProfile
};