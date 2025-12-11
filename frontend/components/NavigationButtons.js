/**
 * NavigationButtons Component
 * Previous/Next buttons for navigating between phrases
 */

import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { colors, shadows, spacing } from '../styles/theme';

const NavigationButtons = ({
    currentIndex,
    totalPhrases,
    onPrevious,
    onNext,
    onReset,
    hasResults,
    overallScore = null,
    nextDisabled = false
}) => {
    const isFirst = currentIndex === 0;
    const isLast = currentIndex === totalPhrases - 1;
    const isNextDisabled = nextDisabled;

    // Show retry button if there are results AND score is less than 100%
    const showRetryButton = hasResults && (overallScore === null || overallScore < 100);

    return (
        <View style={styles.container}>
            <View style={styles.navigation}>
                <TouchableOpacity
                    style={[styles.navButton, isFirst && styles.navButtonDisabled]}
                    onPress={onPrevious}
                    disabled={isFirst}
                >
                    <Text style={[styles.navButtonText, isFirst && styles.navButtonTextDisabled]}>
                        ← Anterior
                    </Text>
                </TouchableOpacity>

                <View style={styles.progress}>
                    <Text style={styles.progressText}>
                        {currentIndex + 1} / {totalPhrases}
                    </Text>
                </View>

                <TouchableOpacity
                    style={[styles.navButton, isNextDisabled && styles.navButtonDisabled]}
                    onPress={onNext}
                    disabled={isNextDisabled}
                >
                    <Text style={[styles.navButtonText, isNextDisabled && styles.navButtonTextDisabled]}>
                        {isLast ? '✓ Finalizar' : 'Siguiente →'}
                    </Text>
                </TouchableOpacity>
            </View>

            {showRetryButton && (
                <TouchableOpacity style={styles.resetButton} onPress={onReset}>
                    <Text style={styles.resetButtonText}>🔄 Intentar de nuevo</Text>
                </TouchableOpacity>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        gap: spacing.md,
    },
    navigation: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: spacing.md,
    },
    navButton: {
        paddingVertical: spacing.sm,
        paddingHorizontal: spacing.md,
        borderRadius: 12,
        backgroundColor: colors.cardBackground,
        borderWidth: 1,
        borderColor: colors.cardBorder,
        ...shadows.small,
    },
    navButtonDisabled: {
        opacity: 0.5,
    },
    navButtonText: {
        color: colors.primary,
        fontSize: 14,
        fontWeight: '600',
    },
    navButtonTextDisabled: {
        color: colors.textMuted,
    },
    progress: {
        alignItems: 'center',
    },
    progressText: {
        color: colors.textSecondary,
        fontSize: 16,
        fontWeight: '500',
    },
    resetButton: {
        alignSelf: 'center',
        paddingVertical: spacing.sm,
        paddingHorizontal: spacing.lg,
        borderRadius: 12,
        backgroundColor: colors.primary + '20',
    },
    resetButtonText: {
        color: colors.primary,
        fontSize: 14,
        fontWeight: '500',
    },
});

export default NavigationButtons;
