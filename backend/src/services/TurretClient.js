import { config } from '../config/env.js';
import { HttpError } from '../middleware/errorHandler.js';

export class TurretClient {
  constructor(baseUrl = config.turretUrl, timeoutMs = config.turretTimeoutMs) {
    this.baseUrl = new URL(baseUrl);
    this.timeoutMs = timeoutMs;
  }

  async _call(path, body) {
    let response;
    try {
      response = await fetch(new URL(path, this.baseUrl), {
        method: body === undefined ? 'GET' : 'POST',
        headers: body === undefined ? undefined : { 'Content-Type': 'application/json' },
        body: body === undefined ? undefined : JSON.stringify(body),
        signal: AbortSignal.timeout(this.timeoutMs),
      });
    } catch (error) {
      if (error.name === 'TimeoutError' || error.name === 'AbortError') {
        throw new HttpError(504, 'Turret service timed out');
      }
      throw new HttpError(503, 'Turret service unavailable');
    }

    let data;
    try {
      data = await response.json();
    } catch {
      throw new HttpError(502, 'Turret service returned an invalid response');
    }

    if (!data || typeof data !== 'object' || Array.isArray(data)) {
      throw new HttpError(502, 'Turret service returned an invalid response');
    }
    if (!response.ok) {
      const status = response.status >= 500 ? 502 : response.status;
      throw new HttpError(status, data.error || 'Turret service request failed');
    }

    return data;
  }

  status() {
    return this._call('/status');
  }

  async waitIdle(timeoutMs = 30_000) {
    const start = Date.now();
    while (Date.now() - start < timeoutMs) {
      if (!(await this.status()).moving) return;
      await new Promise((resolve) => setTimeout(resolve, 100));
    }
    throw new Error('Pan timed out');
  }

  async log() {
    const data = await this._call('/log');
    if (!Array.isArray(data.log)) {
      throw new HttpError(502, 'Turret service returned an invalid log');
    }
    return data.log;
  }

  panTo(deg) {
    return this._call('/pan/to', { deg });
  }

  panBy(deg) {
    return this._call('/pan/by', { deg });
  }

  center() {
    return this._call('/pan/center', {});
  }

  stopPan() {
    return this._call('/pan/stop', {});
  }

  zeroPan() {
    return this._call('/pan/zero', {});
  }

  releasePan() {
    return this._call('/pan/release', {});
  }

  arm() {
    return this._call('/arm', {});
  }

  disarm() {
    return this._call('/disarm', {});
  }

  estop() {
    return this._call('/estop', {});
  }

  fire(ms) {
    return this._call('/fire', ms === undefined ? {} : { ms });
  }

  servoAngle(angle) {
    return this._call('/servo/angle', { angle });
  }

  servoRest() {
    return this._call('/servo/rest', {});
  }
}
