// class HealthEventController: request/response handling for HealthEvent endpoints.
import { randomUUID } from 'node:crypto';
import { config } from '../config/env.js';
import { messages } from '../lang/en/messages.js';
import { HttpError } from '../middleware/errorHandler.js';
import { HealthEventModel } from '../models/HealthEventModel.js';
import { AiDecisionService } from '../services/AiDecisionService.js';
import { SafetyChecker } from '../services/SafetyChecker.js';

const DEFAULT_MAX_HEALTH = 100;

const aiDecisionService = new AiDecisionService();
const safetyChecker = new SafetyChecker();
const healthEventModel = new HealthEventModel();

function isValidHealthEvent(maxHealth, previousHealth, currentHealth) {
  return (
    [maxHealth, previousHealth, currentHealth].every(Number.isInteger) &&
    maxHealth > 0 &&
    previousHealth <= maxHealth &&
    currentHealth >= 0 &&
    currentHealth <= previousHealth
  );
}

export class HealthEventController {
  async create(req, res) {
    const { previousHealth, currentHealth } = req.body ?? {};
    const maxHealth = req.body?.maxHealth ?? DEFAULT_MAX_HEALTH;

    if (!isValidHealthEvent(maxHealth, previousHealth, currentHealth)) {
      throw new HttpError(400, messages.healthEvents.invalidHealth);
    }

    const decision = await aiDecisionService.decideFireDuration({
      maxHealth, previousHealth, currentHealth,
    });
    const { approvedSeconds, wasCapped } = safetyChecker.approveFireDuration(decision.seconds);
    const reason = wasCapped
      ? decision.reason + messages.healthEvents.capped(config.maxFireSeconds)
      : decision.reason;

    const id = await healthEventModel.create({
      eventId: randomUUID(),
      userId: req.user.id, // set by the authenticate middleware
      maxHealth,
      previousHealth,
      currentHealth,
      decidedBy: decision.decidedBy,
      suggestedSeconds: decision.seconds,
      reason,
      approvedSeconds,
    });

    res.status(201).json({
      event: {
        id,
        healthLost: previousHealth - currentHealth,
        suggestedSeconds: decision.seconds,
        approvedSeconds,
        decidedBy: decision.decidedBy,
        reason,
      },
    });
  }
}
