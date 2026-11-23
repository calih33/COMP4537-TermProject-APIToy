// class UserModel: SQL queries for User.
import { pool } from '../config/db.js';

export class UserModel {
  async findByEmail(email) {
    const [rows] = await pool.execute(
      'SELECT id, email, password_hash, role FROM users WHERE email = ?',
      [email],
    );
    return rows[0] ?? null;
  }

  async findById(id) {
    const [rows] = await pool.execute(
      'SELECT id, email, role, created_at FROM users WHERE id = ?',
      [id],
    );
    return rows[0] ?? null;
  }

  async create(email, passwordHash) {
    const [result] = await pool.execute(
      'INSERT INTO users (email, password_hash) VALUES (?, ?)',
      [email, passwordHash],
    );
    return result.insertId;
  }

  // Every user with how many API requests they've made (for the admin page).
  async findAllWithUsage() {
    const [rows] = await pool.execute(
      `SELECT u.id, u.email, u.role, u.created_at, COUNT(a.id) AS total_requests
         FROM users u
         LEFT JOIN api_usage a ON a.user_id = u.id
        GROUP BY u.id
        ORDER BY u.id`,
    );
    return rows;
  }
}
