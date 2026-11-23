// Checks the Jev key and question without starting the server. Run from backend/: node scripts/tryJev.js
// Costs 4 Jev credits.
import { AiDecisionService } from '../src/services/AiDecisionService.js';

const service = new AiDecisionService();
const hits = [[100, 95], [100, 70], [30, 10], [100, 0]];

for (const [previousHealth, currentHealth] of hits) {
  const decision = await service.decideFireDuration({ maxHealth: 100, previousHealth, currentHealth });
  console.log(`${previousHealth} -> ${currentHealth}:`, decision);
}
