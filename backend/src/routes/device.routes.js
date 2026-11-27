import { Router } from 'express';
import { DeviceController } from '../controllers/DeviceController.js';
import { authenticate } from '../middleware/authenticate.js';

const router = Router();
const controller = new DeviceController();

router.get('/turret/status', authenticate, (req, res) => controller.status(req, res));
router.get('/turret/log', authenticate, (req, res) => controller.log(req, res));
router.post('/turret/pan/to', authenticate, (req, res) => controller.panTo(req, res));
router.post('/turret/pan/by', authenticate, (req, res) => controller.panBy(req, res));
router.post('/turret/pan/center', authenticate, (req, res) => controller.center(req, res));
router.post('/turret/pan/stop', authenticate, (req, res) => controller.stopPan(req, res));
router.post('/turret/pan/zero', authenticate, (req, res) => controller.zeroPan(req, res));
router.post('/turret/pan/release', authenticate, (req, res) => controller.releasePan(req, res));
router.post('/turret/arm', authenticate, (req, res) => controller.arm(req, res));
router.post('/turret/disarm', authenticate, (req, res) => controller.disarm(req, res));
router.post('/turret/estop', authenticate, (req, res) => controller.estop(req, res));
router.post('/turret/fire', authenticate, (req, res) => controller.fire(req, res));
router.post('/turret/servo/angle', authenticate, (req, res) => controller.servoAngle(req, res));
router.post('/turret/servo/rest', authenticate, (req, res) => controller.servoRest(req, res));

export default router;
