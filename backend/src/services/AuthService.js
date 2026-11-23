// class AuthService: register, login, password hashing, JWT signing.
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { config } from '../config/env.js';
import { messages } from '../lang/en/messages.js';
import { HttpError } from '../middleware/errorHandler.js';
import { UserModel } from '../models/UserModel.js';

const SALT_ROUNDS = 12;
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const userModel = new UserModel();

export class AuthService {
  static COOKIE_NAME = 'token';

  async register(email, password) {
    const normalizedEmail = this.#validate(email, password);
    const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);
    try {
      const id = await userModel.create(normalizedEmail, passwordHash);
      return { id, email: normalizedEmail, role: 'user' };
    } catch (err) {
      if (err.code === 'ER_DUP_ENTRY') throw new HttpError(409, messages.auth.emailTaken);
      throw err;
    }
  }

  async login(email, password) {
    const normalizedEmail = this.#validate(email, password);
    const user = await userModel.findByEmail(normalizedEmail);
    // Same message whether the email or the password was wrong, so attackers can't tell which.
    if (!user || !(await bcrypt.compare(password, user.password_hash))) {
      throw new HttpError(401, messages.auth.invalidCredentials);
    }
    const token = jwt.sign({ id: user.id, role: user.role }, config.jwtSecret, {
      expiresIn: config.jwtExpiresIn,
    });
    return { user: { id: user.id, email: user.email, role: user.role }, token };
  }

  // Returns the token's payload, or null if it's missing, expired or tampered with.
  verifyToken(token) {
    if (!token) return null;
    try {
      return jwt.verify(token, config.jwtSecret);
    } catch {
      return null;
    }
  }

  #validate(email, password) {
    const normalizedEmail = typeof email === 'string' ? email.trim().toLowerCase() : '';
    if (!EMAIL_PATTERN.test(normalizedEmail) || typeof password !== 'string' || password === '') {
      throw new HttpError(400, messages.auth.invalidInput);
    }
    return normalizedEmail;
  }
}
