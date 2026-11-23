// class AiDecisionService: asks Jev (TypeSafe's System One API) how long the blaster should fire for a hit.
// Docs: https://docs.typesafe.ai/primitives/choice
import { config } from '../config/env.js';
import { messages } from '../lang/en/messages.js';

const JEV_URL = 'https://api.typesafe.ai/v1/systemone';
const REQUEST_TIMEOUT_MS = 10_000;

// Each option's name is the firing time in seconds. Jev reads the descriptions and picks one.
const FIRE_DURATION_OPTIONS = {
  '0.5': 'Light hit. A small scratch the player barely notices.',
  '1': 'Moderate hit. A noticeable amount of health is gone.',
  '1.5': 'Heavy hit. A big chunk of health is gone, or the player is now in danger.',
  '2': 'Devastating hit. A massive loss, or the player is close to dying.',
};

export class AiDecisionService {
  async decideFireDuration({ maxHealth, previousHealth, currentHealth }) {
    const healthLost = previousHealth - currentHealth;
    if (healthLost === 0) {
      return { seconds: 0, decidedBy: 'formula', reason: messages.healthEvents.noDamage };
    }

    try {
      return await this.#askJev({ maxHealth, previousHealth, currentHealth, healthLost });
    } catch (err) {
      // If Jev is down, the demo still works, and the database records that the formula decided.
      console.error('Jev request failed, using formula fallback:', err.message);
      return this.#formulaFallback(healthLost, maxHealth);
    }
  }

  async #askJev({ maxHealth, previousHealth, currentHealth, healthLost }) {
    const response = await fetch(JEV_URL, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${config.aiApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: config.aiModel,
        state: {
          maxHealth,
          previousHealth,
          currentHealth,
          healthLost,
          percentLost: Math.round((healthLost / maxHealth) * 100),
        },
        questions: {
          fire_duration: {
            type: 'choice',
            instructions:
              'A video game player just took damage. A toy gel blaster fires at the real player as feedback. ' +
              'Choose how many seconds it should fire based on how severe the hit was. ' +
              'Consider both how much health was lost and how close the player now is to dying.',
            criteria: FIRE_DURATION_OPTIONS,
          },
        },
      }),
      signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
    });

    const body = await response.json().catch(() => null);
    if (!response.ok) {
      const detail = body?.error?.message ?? body?.error ?? body?.message ?? 'no body';
      throw new Error(`Jev responded ${response.status}: ${typeof detail === 'string' ? detail : JSON.stringify(detail)}`);
    }

    // Response: { model, answers: { fire_duration: { type: 'choice', choice, probabilities, confidence } }, usage }
    const answer = body?.answers?.fire_duration;
    if (!Object.hasOwn(FIRE_DURATION_OPTIONS, answer?.choice ?? '')) {
      throw new Error(`Jev returned an unknown choice: ${answer?.choice}`);
    }

    return {
      seconds: Number(answer.choice),
      decidedBy: 'ai',
      reason: messages.healthEvents.jevReason(answer.choice, answer.confidence ?? 0),
    };
  }

  #formulaFallback(healthLost, maxHealth) {
    const fraction = healthLost / maxHealth;
    const seconds = fraction < 0.1 ? 0.5 : fraction < 0.25 ? 1 : fraction < 0.5 ? 1.5 : 2;
    return { seconds, decidedBy: 'formula', reason: messages.healthEvents.formulaReason };
  }
}
