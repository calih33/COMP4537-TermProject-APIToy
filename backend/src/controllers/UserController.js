// class UserController: request/response handling for User endpoints.
import { messages } from '../lang/en/messages.js';
import { HttpError } from '../middleware/errorHandler.js';
import { UsageModel } from '../models/UsageModel.js';
import { UserModel } from '../models/UserModel.js';

const userModel = new UserModel();
const usageModel = new UsageModel();

export class UserController {
  // GET /users/me: who is logged in, read fresh from the database.
  async getMe(req, res) {
    const user = await userModel.findById(req.user.id);
    if (!user) throw new HttpError(401, messages.auth.notAuthenticated); // account was deleted
    const totalRequests = await usageModel.countByUser(user.id);
    res.json({ user: { id: user.id, email: user.email, role: user.role, totalRequests } });
  }
}
