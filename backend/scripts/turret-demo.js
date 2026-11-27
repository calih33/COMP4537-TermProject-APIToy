import { TurretClient } from '../src/services/TurretClient.js';

const turret = new TurretClient();

try {
  console.log(await turret.status());
  await turret.panTo(20);
  await turret.waitIdle();
  await turret.panTo(-20);
  await turret.waitIdle();
  await turret.center();
  await turret.waitIdle();
  console.log((await turret.status()).pan_deg, 'back at center');
} catch (error) {
  console.error(error.message);
  process.exitCode = 1;
}
