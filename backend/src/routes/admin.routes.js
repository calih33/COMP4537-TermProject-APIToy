// /api/v1/admin routes. Every route here requires a logged-in admin, enforced on the server.
import { Router } from 'express';
import { AdminController } from '../controllers/AdminController.js';
import { authenticate } from '../middleware/authenticate.js';
import { requireAdmin } from '../middleware/requireAdmin.js';

const router = Router();
const controller = new AdminController();

router.use(authenticate, requireAdmin);
router.get('/users', (req, res) => controller.listUsers(req, res));
router.get('/stats', (req, res) => controller.getStats(req, res));

export default router;
