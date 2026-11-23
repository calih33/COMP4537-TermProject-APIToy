// class SafetyChecker: caps the firing time no matter what the AI asks for.
import { config } from '../config/env.js';

export class SafetyChecker {
  approveFireDuration(requestedSeconds) {
    const approvedSeconds = Math.min(Math.max(requestedSeconds, 0), config.maxFireSeconds);
    return { approvedSeconds, wasCapped: approvedSeconds !== requestedSeconds };
  }
}
