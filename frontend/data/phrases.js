/**
 * Practice phrases organized by difficulty level
 */

export const PHRASES = {
    basic: [
        { id: 1, text: "Hello, how are you?", level: "basic" },
        { id: 2, text: "My name is John.", level: "basic" },
        { id: 3, text: "I like to eat apples.", level: "basic" },
        { id: 4, text: "The weather is nice today.", level: "basic" },
        { id: 5, text: "She has a blue car.", level: "basic" },
        { id: 6, text: "We go to school every day.", level: "basic" },
        { id: 7, text: "Can I have some water?", level: "basic" },
        { id: 8, text: "This is my favorite book.", level: "basic" },
        { id: 9, text: "I live in a small house.", level: "basic" },
        { id: 10, text: "Thank you very much.", level: "basic" },
    ],
    intermediate: [
        { id: 11, text: "I've been studying English for three years.", level: "intermediate" },
        { id: 12, text: "Would you mind opening the window?", level: "intermediate" },
        { id: 13, text: "She's been working at the hospital since 2020.", level: "intermediate" },
        { id: 14, text: "If I had more time, I would travel more.", level: "intermediate" },
        { id: 15, text: "The restaurant that we visited yesterday was excellent.", level: "intermediate" },
        { id: 16, text: "Don't worry too much about your future.", level: "intermediate" },
    ],
    advanced: [
        { id: 17, text: "Although the circumstances were challenging, she persevered through determination.", level: "advanced" },
        { id: 18, text: "The entrepreneur's innovative approach revolutionized the entire industry.", level: "advanced" },
        { id: 19, text: "Pronunciation requires consistent practice and careful attention to phonetic details.", level: "advanced" },
    ],
};

// Flatten all phrases into a single array for easy navigation
export const ALL_PHRASES = [
    ...PHRASES.basic,
    ...PHRASES.intermediate,
    ...PHRASES.advanced,
];

export const getLevelColor = (level) => {
    switch (level) {
        case 'basic':
            return '#22c55e';
        case 'intermediate':
            return '#eab308';
        case 'advanced':
            return '#ef4444';
        default:
            return '#6366f1';
    }
};

export const getLevelLabel = (level) => {
    switch (level) {
        case 'basic':
            return 'Básico';
        case 'intermediate':
            return 'Intermedio';
        case 'advanced':
            return 'Avanzado';
        default:
            return level;
    }
};
