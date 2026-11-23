// class AuthController: request/response handling for Auth endpoints.
import { config } from '../config/env.js';
import { messages } from '../lang/en/messages.js';
import { AuthService } from '../services/AuthService.js';

const authService = new AuthService();
const ONE_HOUR_MS = 60 * 60 * 1000;

// Client and API are on different sites in production, so the cookie needs SameSite=None + Secure.
// Locally both run on localhost (plain http), where Lax works and Secure would be rejected by some browsers.
const cookieOptions = {
  httpOnly: true,
  secure: config.isProduction,
  sameSite: config.isProduction ? 'none' : 'lax',
  path: '/',
};

export class AuthController {
  async register(req, res) {
    const user = await authService.register(req.body?.email, req.body?.password);
    res.status(201).json({ user });
  }

  async login(req, res) {
    const { user, token } = await authService.login(req.body?.email, req.body?.password);
    res.cookie(AuthService.COOKIE_NAME, token, { ...cookieOptions, maxAge: ONE_HOUR_MS });
    res.json({ user });
  }

  logout(req, res) {
    res.clearCookie(AuthService.COOKIE_NAME, cookieOptions);
    res.json({ message: messages.auth.loggedOut });
  }
}
