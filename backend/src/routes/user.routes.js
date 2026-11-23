// /api/v1/users routes.
import { Router } from 'express';
import { UserController } from '../controllers/UserController.js';
import { authenticate } from '../middleware/authenticate.js';

const router = Router();
const controller = new UserController();

router.get('/me', authenticate, (req, res) => controller.getMe(req, res));

export default router;
