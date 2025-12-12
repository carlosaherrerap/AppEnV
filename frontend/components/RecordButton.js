/**
 * RecordButton Component
 * Animated microphone button for recording audio with wave visualization
 */

import React, { useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Animated } from 'react-native';
import { colors, shadows, spacing } from '../styles/theme';
import AudioWave from './AudioWave';

const RecordButton = ({ isRecording, isProcessing, onPress, disabled, audioLevel = 0 }) => {
    const pulseAnim = useRef(new Animated.Value(1)).current;
    const rotateAnim = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        if (isRecording) {
            // Pulse animation while recording
            Animated.loop(
                Animated.sequence([
                    Animated.timing(pulseAnim, {
                        toValue: 1.2,
                        duration: 500,
                        useNativeDriver: true,
                    }),
                    Animated.timing(pulseAnim, {
                        toValue: 1,
                        duration: 500,
                        useNativeDriver: true,
                    }),
                ])
            ).start();
        } else {
            pulseAnim.setValue(1);
        }
    }, [isRecording, pulseAnim]);

    useEffect(() => {
        if (isProcessing) {
            // Rotation animation while processing
            Animated.loop(
                Animated.timing(rotateAnim, {
                    toValue: 1,
                    duration: 1500,
                    useNativeDriver: true,
                })
            ).start();
        } else {
            rotateAnim.setValue(0);
        }
    }, [isProcessing, rotateAnim]);

    const getButtonColor = () => {
        if (isRecording) return colors.recording;
        if (isProcessing) return colors.processing;
        return colors.primary;
    };

    const getButtonText = () => {
        if (isProcessing) return '⏳';
        if (isRecording) return '⏹️';
        return '🎤';
    };

    const getStatusText = () => {
        if (isProcessing) return 'Analizando...';
        if (isRecording) {
            if (audioLevel > 0.1) {
                return 'Escuchando tu voz...';
            }
            return 'Habla ahora...';
        }
        return 'Toca para grabar';
    };

    const spin = rotateAnim.interpolate({
        inputRange: [0, 1],
        outputRange: ['0deg', '360deg'],
    });

    return (
        <View style={styles.container}>
            {/* Audio Wave - shows when recording */}
            {isRecording && (
                <View style={styles.waveContainer}>
                    <AudioWave isActive={isRecording} audioLevel={audioLevel} />
                </View>
            )}

            <TouchableOpacity
                onPress={onPress}
                disabled={disabled || isProcessing}
                activeOpacity={0.8}
            >
                <Animated.View
                    style={[
                        styles.outerRing,
                        {
                            backgroundColor: getButtonColor() + '20',
                            transform: [{ scale: pulseAnim }],
                        },
                    ]}
                >
                    <Animated.View
                        style={[
                            styles.button,
                            { backgroundColor: getButtonColor() },
                            isProcessing && { transform: [{ rotate: spin }] },
                        ]}
                    >
                        <Text style={styles.buttonIcon}>{getButtonText()}</Text>
                    </Animated.View>
                </Animated.View>
            </TouchableOpacity>

            <Text style={styles.statusText}>{getStatusText()}</Text>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        alignItems: 'center',
        gap: spacing.md,
    },
    waveContainer: {
        marginBottom: spacing.sm,
    },
    outerRing: {
        width: 120,
        height: 120,
        borderRadius: 60,
        justifyContent: 'center',
        alignItems: 'center',
    },
    button: {
        width: 80,
        height: 80,
        borderRadius: 40,
        justifyContent: 'center',
        alignItems: 'center',
        ...shadows.large,
    },
    buttonIcon: {
        fontSize: 36,
    },
    statusText: {
        color: colors.textSecondary,
        fontSize: 14,
        textAlign: 'center',
    },
});

export default RecordButton;

