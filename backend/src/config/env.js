// Reads environment variables once so other files import config, not process.env.
import 'dotenv/config';

const isProduction = process.env.NODE_ENV === 'production';

export const config = {
  isProduction,
  port: Number(process.env.PORT ?? 3000),
  clientOrigin: process.env.CLIENT_ORIGIN ?? 'http://localhost:5173',

  db: {
    host: process.env.DB_HOST ?? 'localhost',
    port: Number(process.env.DB_PORT ?? 3306),
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    // Most hosted MySQL providers require TLS. Set DB_SSL=true for them.
    ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: true } : undefined,
  },

  jwtSecret: process.env.JWT_SECRET,
  jwtExpiresIn: '1h',

  aiApiKey: process.env.AI_API_KEY,
  aiModel: process.env.AI_MODEL ?? 'jev-latest',
  maxFireSeconds: Number(process.env.MAX_FIRE_SECONDS ?? 2),
  turretUrl: process.env.TURRET_URL ?? 'http://127.0.0.1:5000',
  turretTimeoutMs: Number(process.env.TURRET_TIMEOUT_MS ?? 10000),
};

if (!config.jwtSecret) {
  throw new Error('JWT_SECRET is not set. Copy .env.example to .env and fill it in.');
}
