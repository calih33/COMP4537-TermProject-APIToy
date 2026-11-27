import { TurretClient } from '../services/TurretClient.js';

export class DeviceController {
  constructor(turret = new TurretClient()) {
    this.turret = turret;
  }

  async status(req, res) {
    res.json(await this.turret.status());
  }

  async log(req, res) {
    res.json({ log: await this.turret.log() });
  }

  async panTo(req, res) {
    res.json(await this.turret.panTo(req.body?.deg));
  }

  async panBy(req, res) {
    res.json(await this.turret.panBy(req.body?.deg));
  }

  async center(req, res) {
    res.json(await this.turret.center());
  }

  async stopPan(req, res) {
    res.json(await this.turret.stopPan());
  }

  async zeroPan(req, res) {
    res.json(await this.turret.zeroPan());
  }

  async releasePan(req, res) {
    res.json(await this.turret.releasePan());
  }

  async arm(req, res) {
    res.json(await this.turret.arm());
  }

  async disarm(req, res) {
    res.json(await this.turret.disarm());
  }

  async estop(req, res) {
    res.json(await this.turret.estop());
  }

  async fire(req, res) {
    res.json(await this.turret.fire(req.body?.ms));
  }

  async servoAngle(req, res) {
    res.json(await this.turret.servoAngle(req.body?.angle));
  }

  async servoRest(req, res) {
    res.json(await this.turret.servoRest());
  }
}
