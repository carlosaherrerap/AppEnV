/**
 * EnLearn - English Pronunciation Practice App
 * Theme and styling configuration
 */

export const colors = {
    // Background
    background: '#0a0a1a',
    cardBackground: '#1a1a2e',
    cardBorder: '#2a2a4e',

    // Text
    textPrimary: '#ffffff',
    textSecondary: '#b0b0c0',
    textMuted: '#606080',

    // Accent
    primary: '#6366f1',
    primaryLight: '#818cf8',
    secondary: '#8b5cf6',

    // Pronunciation scores
    green: '#22c55e',
    yellow: '#eab308',
    orange: '#f97316',
    red: '#ef4444',

    // States
    recording: '#ef4444',
    processing: '#6366f1',
};

export const gradients = {
    primary: ['#6366f1', '#8b5cf6'],
    background: ['#0a0a1a', '#1a1a2e'],
    card: ['#1a1a2e', '#2a2a4e'],
};

export const shadows = {
    small: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 2,
    },
    medium: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 4.65,
        elevation: 4,
    },
    large: {
        shadowColor: '#6366f1',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.44,
        shadowRadius: 10.32,
        elevation: 8,
    },
};

export const spacing = {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
    xxl: 48,
};

export const typography = {
    h1: {
        fontSize: 32,
        fontWeight: '700',
        color: colors.textPrimary,
    },
    h2: {
        fontSize: 24,
        fontWeight: '600',
        color: colors.textPrimary,
    },
    body: {
        fontSize: 18,
        fontWeight: '400',
        color: colors.textPrimary,
    },
    caption: {
        fontSize: 14,
        fontWeight: '400',
        color: colors.textSecondary,
    },
};
