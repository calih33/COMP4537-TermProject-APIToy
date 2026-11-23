// class HealthEventModel: SQL queries for HealthEvent.
import { pool } from '../config/db.js';

export class HealthEventModel {
  async create(event) {
    const [result] = await pool.execute(
      `INSERT INTO health_events
         (event_id, user_id, max_health, previous_health, current_health,
          decided_by, suggested_seconds, reason, approved_seconds)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        event.eventId, event.userId, event.maxHealth, event.previousHealth, event.currentHealth,
        event.decidedBy, event.suggestedSeconds, event.reason, event.approvedSeconds,
      ],
    );
    return result.insertId;
  }
}
