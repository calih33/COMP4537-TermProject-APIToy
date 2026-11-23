// Records each API request (who, method, endpoint, status) in api_usage once the response is sent.
import { UsageModel } from '../models/UsageModel.js';

const usageModel = new UsageModel();

// Checking who is logged in happens on every page load, so it isn't counted as usage.
const UNTRACKED = new Set(['GET /api/v1/users/me']);

export function trackUsage(req, res, next) {
  res.on('finish', () => {
    if (!req.route) return; // no route matched (404), nothing to record
    const endpoint = req.originalUrl.split('?')[0];
    if (UNTRACKED.has(`${req.method} ${endpoint}`)) return;

    usageModel
      .record({
        userId: req.user?.id ?? null,
        method: req.method,
        endpoint,
        statusCode: res.statusCode,
      })
      .catch((err) => console.error('Failed to record API usage:', err.message));
  });
  next();
}
