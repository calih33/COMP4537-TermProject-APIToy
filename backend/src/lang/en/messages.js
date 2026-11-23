// All user-facing strings live here (no hard-coded messages in controllers).

export const messages = {
  common: {
    serverError: 'Something went wrong on the server. Please try again.',
    badRequest: 'The request was not valid.',
    notFound: 'That endpoint does not exist.',
  },

  auth: {
    invalidInput: 'Please enter a valid email address and a password.',
    emailTaken: 'An account with that email already exists.',
    invalidCredentials: 'Invalid email or password.',
    notAuthenticated: 'Please log in to continue.',
    notAdmin: 'Administrator access is required.',
    loggedOut: 'Logged out.',
  },

  healthEvents: {
    invalidHealth:
      'Health values must be whole numbers from 0 to max health, and current health cannot be higher than previous health.',
    noDamage: 'No health was lost, so the blaster does not fire.',
    jevReason: (seconds, confidence) =>
      `Jev chose ${seconds} s for this hit (${Math.round(confidence * 100)}% confident).`,
    formulaReason: 'Jev was unavailable, so a backup formula chose the firing time.',
    capped: (max) => ` Capped at ${max} s by the safety limit.`,
  },
};
