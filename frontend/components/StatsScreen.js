/**
 * StatsScreen Component
 * Shows session statistics and list of problem words after completing all phrases
 */

import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { colors, shadows, spacing } from '../styles/theme';

const StatsScreen = ({ sessionResults, problemWords, onPractice, onRestart }) => {
    // Calculate statistics
    const completedPhrases = sessionResults.filter(r => r !== null).length;
    const totalPhrases = sessionResults.length;
    const averageScore = sessionResults
        .filter(r => r !== null)
        .reduce((sum, r) => sum + r.overallScore, 0) / completedPhrases || 0;

    const getScoreColor = (score) => {
        if (score >= 90) return colors.green;
        if (score >= 70) return colors.yellow;
        if (score >= 50) return colors.orange;
        return colors.red;
    };

    const getScoreEmoji = (score) => {
        if (score >= 90) return '🌟';
        if (score >= 70) return '👍';
        if (score >= 50) return '💪';
        return '📚';
    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>🎉 ¡Sesión Completada!</Text>

            {/* Summary Card */}
            <View style={styles.summaryCard}>
                <View style={styles.statRow}>
                    <Text style={styles.statLabel}>Frases completadas</Text>
                    <Text style={styles.statValue}>{completedPhrases}/{totalPhrases}</Text>
                </View>

                <View style={styles.divider} />

                <View style={styles.statRow}>
                    <Text style={styles.statLabel}>Puntuación promedio</Text>
                    <Text style={[styles.statValue, { color: getScoreColor(averageScore) }]}>
                        {getScoreEmoji(averageScore)} {Math.round(averageScore)}%
                    </Text>
                </View>
            </View>

            {/* Problem Words Section */}
            {problemWords.length > 0 && (
                <View style={styles.problemSection}>
                    <Text style={styles.sectionTitle}>
                        📝 Palabras a practicar ({problemWords.length})
                    </Text>
                    <ScrollView style={styles.wordList} showsVerticalScrollIndicator={false}>
                        {problemWords.map((wordData, index) => (
                            <View key={index} style={styles.wordItem}>
                                <Text style={[styles.wordText, { color: getScoreColor(wordData.score) }]}>
                                    {wordData.word}
                                </Text>
                                <Text style={[styles.wordScore, { color: getScoreColor(wordData.score) }]}>
                                    {Math.round(wordData.score)}%
                                </Text>
                            </View>
                        ))}
                    </ScrollView>
                </View>
            )}

            {/* No problems message */}
            {problemWords.length === 0 && (
                <View style={styles.perfectSection}>
                    <Text style={styles.perfectEmoji}>🏆</Text>
                    <Text style={styles.perfectText}>¡Excelente pronunciación!</Text>
                    <Text style={styles.perfectSubtext}>No tienes palabras que practicar</Text>
                </View>
            )}

            {/* Action Buttons */}
            <View style={styles.buttonContainer}>
                {problemWords.length > 0 && (
                    <TouchableOpacity style={styles.practiceButton} onPress={onPractice}>
                        <Text style={styles.practiceButtonText}>🎯 Practicar Palabras</Text>
                    </TouchableOpacity>
                )}

                <TouchableOpacity style={styles.restartButton} onPress={onRestart}>
                    <Text style={styles.restartButtonText}>🔄 Nueva Sesión</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: spacing.lg,
    },
    title: {
        fontSize: 28,
        fontWeight: '700',
        color: colors.textPrimary,
        textAlign: 'center',
        marginBottom: spacing.lg,
    },
    summaryCard: {
        backgroundColor: colors.cardBackground,
        borderRadius: 16,
        padding: spacing.lg,
        borderWidth: 1,
        borderColor: colors.cardBorder,
        ...shadows.medium,
    },
    statRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: spacing.sm,
    },
    statLabel: {
        fontSize: 16,
        color: colors.textSecondary,
    },
    statValue: {
        fontSize: 20,
        fontWeight: '700',
        color: colors.textPrimary,
    },
    divider: {
        height: 1,
        backgroundColor: colors.cardBorder,
        marginVertical: spacing.sm,
    },
    problemSection: {
        flex: 1,
        marginTop: spacing.lg,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: colors.textPrimary,
        marginBottom: spacing.md,
    },
    wordList: {
        flex: 1,
        backgroundColor: colors.cardBackground,
        borderRadius: 12,
        padding: spacing.md,
    },
    wordItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: spacing.sm,
        borderBottomWidth: 1,
        borderBottomColor: colors.cardBorder,
    },
    wordText: {
        fontSize: 18,
        fontWeight: '500',
    },
    wordScore: {
        fontSize: 14,
        fontWeight: '600',
    },
    perfectSection: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    perfectEmoji: {
        fontSize: 64,
        marginBottom: spacing.md,
    },
    perfectText: {
        fontSize: 24,
        fontWeight: '700',
        color: colors.green,
        textAlign: 'center',
    },
    perfectSubtext: {
        fontSize: 16,
        color: colors.textSecondary,
        marginTop: spacing.sm,
    },
    buttonContainer: {
        gap: spacing.md,
        marginTop: spacing.lg,
    },
    practiceButton: {
        backgroundColor: colors.primary,
        paddingVertical: spacing.md,
        borderRadius: 12,
        alignItems: 'center',
        ...shadows.medium,
    },
    practiceButtonText: {
        color: colors.textPrimary,
        fontSize: 18,
        fontWeight: '600',
    },
    restartButton: {
        backgroundColor: colors.cardBackground,
        paddingVertical: spacing.md,
        borderRadius: 12,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: colors.cardBorder,
    },
    restartButtonText: {
        color: colors.textSecondary,
        fontSize: 16,
        fontWeight: '500',
    },
});

export default StatsScreen;
