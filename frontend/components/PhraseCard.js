/**
 * PhraseCard Component
 * Displays the phrase with color-coded pronunciation feedback
 */

import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import * as Speech from 'expo-speech';
import { colors, shadows, spacing } from '../styles/theme';
import { getLevelColor, getLevelLabel } from '../data/phrases';

const PhraseCard = ({ phrase, wordScores, showResults }) => {
    const [isSpeaking, setIsSpeaking] = useState(false);

    const getWordColor = (color) => {
        switch (color) {
            case 'green':
                return colors.green;
            case 'yellow':
                return colors.yellow;
            case 'orange':
                return colors.orange;
            case 'red':
                return colors.red;
            default:
                return colors.textPrimary;
        }
    };

    const handleListen = () => {
        if (isSpeaking) {
            Speech.stop();
            setIsSpeaking(false);
        } else {
            setIsSpeaking(true);
            Speech.speak(phrase.text, {
                language: 'en-US',
                rate: 0.9,
                onDone: () => setIsSpeaking(false),
                onError: () => setIsSpeaking(false),
            });
        }
    };

    const renderWord = (wordData, index) => {
        const wordColor = getWordColor(wordData.color);

        return (
            <Text
                key={index}
                style={[
                    styles.word,
                    { color: wordColor },
                    wordData.color === 'red' && styles.wordError,
                ]}
            >
                {wordData.word}{' '}
            </Text>
        );
    };

    const renderDefaultText = () => {
        return (
            <Text style={styles.phraseText}>
                {phrase.text}
            </Text>
        );
    };

    const renderColoredText = () => {
        if (!wordScores || wordScores.length === 0) {
            return renderDefaultText();
        }

        return (
            <Text style={styles.phraseTextContainer}>
                {wordScores.map((wordData, index) => renderWord(wordData, index))}
            </Text>
        );
    };

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <View style={[styles.levelBadge, { backgroundColor: getLevelColor(phrase.level) + '20' }]}>
                    <Text style={[styles.levelText, { color: getLevelColor(phrase.level) }]}>
                        {getLevelLabel(phrase.level)}
                    </Text>
                </View>
                <Text style={styles.phraseNumber}>
                    #{phrase.id}
                </Text>
            </View>

            <View style={styles.phraseContainer}>
                {showResults ? renderColoredText() : renderDefaultText()}
            </View>

            {/* Listen Button */}
            {!showResults && (
                <TouchableOpacity
                    style={[styles.listenButton, isSpeaking && styles.listenButtonActive]}
                    onPress={handleListen}
                >
                    <Text style={styles.listenButtonText}>
                        {isSpeaking ? '⏹️ Detener' : '🔊 Escuchar'}
                    </Text>
                </TouchableOpacity>
            )}

            {showResults && wordScores && (
                <View style={styles.legend}>
                    <View style={styles.legendItem}>
                        <View style={[styles.legendDot, { backgroundColor: colors.green }]} />
                        <Text style={styles.legendText}>Excelente</Text>
                    </View>
                    <View style={styles.legendItem}>
                        <View style={[styles.legendDot, { backgroundColor: colors.yellow }]} />
                        <Text style={styles.legendText}>Bien</Text>
                    </View>
                    <View style={styles.legendItem}>
                        <View style={[styles.legendDot, { backgroundColor: colors.orange }]} />
                        <Text style={styles.legendText}>Mejorar</Text>
                    </View>
                    <View style={styles.legendItem}>
                        <View style={[styles.legendDot, { backgroundColor: colors.red }]} />
                        <Text style={styles.legendText}>Revisar</Text>
                    </View>
                </View>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        backgroundColor: colors.cardBackground,
        borderRadius: 20,
        padding: spacing.lg,
        marginHorizontal: spacing.md,
        borderWidth: 1,
        borderColor: colors.cardBorder,
        ...shadows.medium,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: spacing.md,
    },
    levelBadge: {
        paddingHorizontal: spacing.sm,
        paddingVertical: spacing.xs,
        borderRadius: 8,
    },
    levelText: {
        fontSize: 12,
        fontWeight: '600',
        textTransform: 'uppercase',
    },
    phraseNumber: {
        color: colors.textMuted,
        fontSize: 14,
    },
    phraseContainer: {
        minHeight: 100,
        justifyContent: 'center',
    },
    phraseText: {
        fontSize: 24,
        fontWeight: '500',
        color: colors.textPrimary,
        lineHeight: 36,
        textAlign: 'center',
    },
    phraseTextContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'center',
        alignItems: 'center',
    },
    word: {
        fontSize: 24,
        fontWeight: '500',
        lineHeight: 36,
    },
    wordError: {
        textDecorationLine: 'underline',
        textDecorationStyle: 'wavy',
    },
    legend: {
        flexDirection: 'row',
        justifyContent: 'center',
        flexWrap: 'wrap',
        marginTop: spacing.lg,
        paddingTop: spacing.md,
        borderTopWidth: 1,
        borderTopColor: colors.cardBorder,
        gap: spacing.md,
    },
    legendItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.xs,
    },
    legendDot: {
        width: 10,
        height: 10,
        borderRadius: 5,
    },
    legendText: {
        color: colors.textSecondary,
        fontSize: 12,
    },
    listenButton: {
        alignSelf: 'center',
        paddingVertical: spacing.sm,
        paddingHorizontal: spacing.lg,
        borderRadius: 20,
        backgroundColor: colors.primary + '20',
        marginTop: spacing.md,
    },
    listenButtonActive: {
        backgroundColor: colors.primary,
    },
    listenButtonText: {
        color: colors.primary,
        fontSize: 16,
        fontWeight: '500',
    },
});

export default PhraseCard;
