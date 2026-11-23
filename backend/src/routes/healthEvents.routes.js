// /api/v1/health-events routes.
import { Router } from 'express';
import { HealthEventController } from '../controllers/HealthEventController.js';
import { authenticate } from '../middleware/authenticate.js';

const router = Router();
const controller = new HealthEventController();

router.post('/', authenticate, (req, res) => controller.create(req, res));

export default router;
