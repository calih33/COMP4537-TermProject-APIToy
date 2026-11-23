// class AdminController: request/response handling for Admin endpoints.
import { UsageModel } from '../models/UsageModel.js';
import { UserModel } from '../models/UserModel.js';

const userModel = new UserModel();
const usageModel = new UsageModel();

export class AdminController {
  async listUsers(req, res) {
    const rows = await userModel.findAllWithUsage();
    res.json({
      users: rows.map((row) => ({
        id: row.id,
        email: row.email,
        role: row.role,
        createdAt: row.created_at,
        totalRequests: Number(row.total_requests),
      })),
    });
  }

  async getStats(req, res) {
    const rows = await usageModel.countByEndpoint();
    res.json({
      stats: rows.map((row) => ({
        method: row.method,
        endpoint: row.endpoint,
        requests: Number(row.requests),
      })),
    });
  }
}
