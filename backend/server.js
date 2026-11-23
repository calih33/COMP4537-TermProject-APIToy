// Entry point: starts the HTTP server.
import { app } from './src/app.js';
import { config } from './src/config/env.js';

app.listen(config.port, () => {
  console.log(`API listening on port ${config.port}`);
});
