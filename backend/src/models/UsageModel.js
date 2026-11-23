// class UsageModel: SQL queries for Usage.
import { pool } from '../config/db.js';

export class UsageModel {
  async record({ userId, method, endpoint, statusCode }) {
    await pool.execute(
      'INSERT INTO api_usage (user_id, method, endpoint, status_code) VALUES (?, ?, ?, ?)',
      [userId, method, endpoint, statusCode],
    );
  }

  async countByUser(userId) {
    const [rows] = await pool.execute(
      'SELECT COUNT(*) AS total FROM api_usage WHERE user_id = ?',
      [userId],
    );
    return Number(rows[0].total);
  }

  // Requests per endpoint (for the admin stats table).
  async countByEndpoint() {
    const [rows] = await pool.execute(
      `SELECT method, endpoint, COUNT(*) AS requests
         FROM api_usage
        GROUP BY method, endpoint
        ORDER BY requests DESC`,
    );
    return rows;
  }
}
