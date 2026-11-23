// /api/v1/auth routes.
import { Router } from 'express';
import { AuthController } from '../controllers/AuthController.js';

const router = Router();
const controller = new AuthController();

router.post('/register', (req, res) => controller.register(req, res));
router.post('/login', (req, res) => controller.login(req, res));
router.post('/logout', (req, res) => controller.logout(req, res));

export default router;
