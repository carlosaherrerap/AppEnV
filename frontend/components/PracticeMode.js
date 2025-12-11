/**
 * PracticeMode Component
 * Practice individual problem words one at a time
 */

import React, { useState, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated } from 'react-native';
import { Audio } from 'expo-av';
import { colors, shadows, spacing } from '../styles/theme';
import { transcribeAudio } from '../api/config';
import RecordButton from './RecordButton';

const PracticeMode = ({ problemWords, onComplete, onBack }) => {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isRecording, setIsRecording] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);
    const [currentScore, setCurrentScore] = useState(null);
    const [masteredWords, setMasteredWords] = useState([]);
    const [error, setError] = useState(null);

    const recordingRef = useRef(null);
    const scaleAnim = useRef(new Animated.Value(1)).current;

    const currentWord = problemWords[currentIndex];
    const progress = ((currentIndex + 1) / problemWords.length) * 100;

    const animateWord = () => {
        Animated.sequence([
            Animated.timing(scaleAnim, {
                toValue: 1.1,
                duration: 150,
                useNativeDriver: true,
            }),
            Animated.timing(scaleAnim, {
                toValue: 1,
                duration: 150,
                useNativeDriver: true,
            }),
        ]).start();
    };

    const startRecording = async () => {
        try {
            setError(null);
            setCurrentScore(null);

            const { recording } = await Audio.Recording.createAsync({
                android: {
                    extension: '.wav',
                    outputFormat: Audio.AndroidOutputFormat.DEFAULT,
                    audioEncoder: Audio.AndroidAudioEncoder.DEFAULT,
                    sampleRate: 16000,
                    numberOfChannels: 1,
                    bitRate: 128000,
                },
                ios: {
                    extension: '.wav',
                    audioQuality: Audio.IOSAudioQuality.HIGH,
                    sampleRate: 16000,
                    numberOfChannels: 1,
                    bitRate: 128000,
                    linearPCMBitDepth: 16,
                    linearPCMIsBigEndian: false,
                    linearPCMIsFloat: false,
                },
                web: {
                    mimeType: 'audio/webm',
                    bitsPerSecond: 128000,
                },
            });

            recordingRef.current = recording;
            setIsRecording(true);
        } catch (err) {
            console.error('Error starting recording:', err);
            setError('Error al iniciar grabación');
        }
    };

    const stopRecording = async () => {
        try {
            if (!recordingRef.current) return;

            setIsRecording(false);
            setIsProcessing(true);

            await recordingRef.current.stopAndUnloadAsync();
            const uri = recordingRef.current.getURI();
            recordingRef.current = null;

            if (uri) {
                await processAudio(uri);
            }
        } catch (err) {
            console.error('Error stopping recording:', err);
            setError('Error al detener grabación');
            setIsProcessing(false);
        }
    };

    const processAudio = async (audioUri) => {
        try {
            // Send just the word for comparison
            const result = await transcribeAudio(audioUri, currentWord.word);

            // Get the score for the word
            const score = result.overall_score;
            setCurrentScore(score);
            setIsProcessing(false);
            animateWord();

            // If score >= 80%, mark as mastered
            if (score >= 80) {
                setMasteredWords([...masteredWords, currentWord.word]);
            }
        } catch (err) {
            console.error('Error processing audio:', err);
            setError('Error al procesar el audio');
            setIsProcessing(false);
        }
    };

    const handleRecordPress = () => {
        if (isRecording) {
            stopRecording();
        } else {
            startRecording();
        }
    };

    const handleNext = () => {
        if (currentIndex < problemWords.length - 1) {
            setCurrentIndex(currentIndex + 1);
            setCurrentScore(null);
            setError(null);
        } else {
            // Completed all words
            onComplete(masteredWords);
        }
    };

    const getScoreColor = (score) => {
        if (score >= 90) return colors.green;
        if (score >= 70) return colors.yellow;
        if (score >= 50) return colors.orange;
        return colors.red;
    };

    const getScoreMessage = (score) => {
        if (score >= 90) return '¡Excelente!';
        if (score >= 70) return '¡Muy bien!';
        if (score >= 50) return 'Sigue practicando';
        return 'Intenta de nuevo';
    };

    return (
        <View style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={onBack} style={styles.backButton}>
                    <Text style={styles.backButtonText}>← Volver</Text>
                </TouchableOpacity>
                <Text style={styles.title}>Modo Práctica</Text>
            </View>

            {/* Progress Bar */}
            <View style={styles.progressContainer}>
                <View style={styles.progressBar}>
                    <View style={[styles.progressFill, { width: `${progress}%` }]} />
                </View>
                <Text style={styles.progressText}>
                    {currentIndex + 1} / {problemWords.length}
                </Text>
            </View>

            {/* Word Display */}
            <View style={styles.wordContainer}>
                <Animated.View style={[styles.wordCard, { transform: [{ scale: scaleAnim }] }]}>
                    <Text style={[
                        styles.wordText,
                        currentScore !== null && { color: getScoreColor(currentScore) }
                    ]}>
                        {currentWord.word}
                    </Text>

                    {currentScore !== null && (
                        <View style={styles.scoreContainer}>
                            <Text style={[styles.scoreText, { color: getScoreColor(currentScore) }]}>
                                {Math.round(currentScore)}%
                            </Text>
                            <Text style={[styles.scoreMessage, { color: getScoreColor(currentScore) }]}>
                                {getScoreMessage(currentScore)}
                            </Text>
                        </View>
                    )}
                </Animated.View>
            </View>

            {/* Error Message */}
            {error && (
                <View style={styles.errorContainer}>
                    <Text style={styles.errorText}>⚠️ {error}</Text>
                </View>
            )}

            {/* Record Button */}
            <View style={styles.recordContainer}>
                <RecordButton
                    isRecording={isRecording}
                    isProcessing={isProcessing}
                    onPress={handleRecordPress}
                    disabled={false}
                />
            </View>

            {/* Next Button */}
            <View style={styles.navigationContainer}>
                <TouchableOpacity
                    style={[
                        styles.nextButton,
                        currentScore === null && styles.nextButtonDisabled
                    ]}
                    onPress={handleNext}
                    disabled={currentScore === null}
                >
                    <Text style={[
                        styles.nextButtonText,
                        currentScore === null && styles.nextButtonTextDisabled
                    ]}>
                        {currentIndex < problemWords.length - 1 ? 'Siguiente →' : '✓ Terminar'}
                    </Text>
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
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: spacing.lg,
    },
    backButton: {
        padding: spacing.sm,
    },
    backButtonText: {
        color: colors.primary,
        fontSize: 16,
    },
    title: {
        fontSize: 20,
        fontWeight: '600',
        color: colors.textPrimary,
        marginLeft: spacing.md,
    },
    progressContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.md,
        marginBottom: spacing.xl,
    },
    progressBar: {
        flex: 1,
        height: 8,
        backgroundColor: colors.cardBorder,
        borderRadius: 4,
        overflow: 'hidden',
    },
    progressFill: {
        height: '100%',
        backgroundColor: colors.primary,
        borderRadius: 4,
    },
    progressText: {
        color: colors.textSecondary,
        fontSize: 14,
    },
    wordContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    wordCard: {
        backgroundColor: colors.cardBackground,
        borderRadius: 24,
        padding: spacing.xxl,
        alignItems: 'center',
        borderWidth: 2,
        borderColor: colors.cardBorder,
        minWidth: 200,
        ...shadows.large,
    },
    wordText: {
        fontSize: 36,
        fontWeight: '700',
        color: colors.textPrimary,
        textAlign: 'center',
    },
    scoreContainer: {
        marginTop: spacing.lg,
        alignItems: 'center',
    },
    scoreText: {
        fontSize: 48,
        fontWeight: '700',
    },
    scoreMessage: {
        fontSize: 16,
        marginTop: spacing.xs,
    },
    errorContainer: {
        padding: spacing.md,
        backgroundColor: colors.red + '20',
        borderRadius: 12,
        marginBottom: spacing.md,
    },
    errorText: {
        color: colors.red,
        textAlign: 'center',
    },
    recordContainer: {
        alignItems: 'center',
        paddingVertical: spacing.lg,
    },
    navigationContainer: {
        paddingBottom: spacing.lg,
    },
    nextButton: {
        backgroundColor: colors.primary,
        paddingVertical: spacing.md,
        borderRadius: 12,
        alignItems: 'center',
        ...shadows.medium,
    },
    nextButtonDisabled: {
        backgroundColor: colors.cardBorder,
    },
    nextButtonText: {
        color: colors.textPrimary,
        fontSize: 18,
        fontWeight: '600',
    },
    nextButtonTextDisabled: {
        color: colors.textMuted,
    },
});

export default PracticeMode;
