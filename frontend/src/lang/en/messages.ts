// All user-facing strings live here (no hard-coded messages in components).
// This file was written with help from Claude code.

export const messages = {
    appTitle: 'Toy Blaster Control',

    common: {
        loading: 'Loading...',
        logout: 'Log out',
        signedInAs: (email: string) => `Signed in as ${email}`,
        genericError: 'Something went wrong. Please try again later.',
    },

    user: {
        heading: 'Dashboard',
        adminLink: 'Go to admin page',
        usageHeading: 'API usage',
        usageCount: (count: number) =>
            `You have made ${count} API ${count === 1 ? 'request' : 'requests'}.`,
        demoHeading: 'Try a health event',
        demoIntro:
            'Enter the player\'s health before and after a hit. The AI decides how long the blaster fires, and the server checks that time against the safety limits.',
        previousHealthLabel: 'Health before (0-100)',
        currentHealthLabel: 'Health after (0-100)',
        submit: 'Send health event',
        submitting: 'Waiting for the AI…',
        invalidHealth:
            'Use whole numbers from 0 to 100. Health after can\'t be higher than health before.',
        healthLost: 'Health lost',
        suggestedSeconds: 'Firing time chosen',
        approvedSeconds: 'Firing time approved by the safety check',
        seconds: (value: number) => `${value} ${value === 1 ? 'second' : 'seconds'}`,
        decidedBy: 'Decided by',
        decidedByAi: 'Jev AI',
        decidedByFormula: 'Backup formula (AI unavailable)',
        reason: 'Reasoning',
    },

    auth: {
        emailLabel: 'Email',
        passwordLabel: 'Password',
        confirmPasswordLabel: 'Confirm password',
        passwordsDontMatch: 'The passwords don\'t match.',

        loginHeading: 'Log in',
        loginButton: 'Log in',
        loggingIn: 'Logging in…',
        noAccount: 'Don\'t have an account?',
        registerLink: 'Register',

        registerHeading: 'Create an account',
        registerButton: 'Create account',
        registering: 'Creating account…',
        haveAccount: 'Already have an account?',
        loginLink: 'Log in',
    },

    admin: {
        heading: 'Admin',
        userPageLink: 'Go to user page',
        forbidden: 'You don\'t have permission to view this page.',
        usersHeading: 'Registered users',
        statsHeading: 'API usage by endpoint',
        noStats: 'No API requests recorded yet.',
        columns: {
            email: 'Email',
            role: 'Role',
            joined: 'Joined',
            requests: 'Requests',
            method: 'Method',
            endpoint: 'Endpoint',
        },
    },
};