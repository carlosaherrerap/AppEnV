/**
 * EnLearn - English Pronunciation Practice App
 * Main application component with audio recording and transcription
 */

import React, { useState, useEffect, useRef } from 'react';
import {
  StyleSheet,
  View,
  Text,
  StatusBar,
  SafeAreaView,
  Alert,
  Platform
} from 'react-native';
import { Audio } from 'expo-av';
import { colors, spacing } from './styles/theme';
import { ALL_PHRASES } from './data/phrases';
import { transcribeAudio, API_BASE_URL } from './api/config';
import PhraseCard from './components/PhraseCard';
import RecordButton from './components/RecordButton';
import NavigationButtons from './components/NavigationButtons';

export default function App() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [wordScores, setWordScores] = useState(null);
  const [overallScore, setOverallScore] = useState(null);
  const [hasPermission, setHasPermission] = useState(false);
  const [error, setError] = useState(null);

  const recordingRef = useRef(null);

  const currentPhrase = ALL_PHRASES[currentIndex];

  useEffect(() => {
    requestPermissions();
  }, []);

  const requestPermissions = async () => {
    try {
      const { status } = await Audio.requestPermissionsAsync();
      setHasPermission(status === 'granted');

      if (status !== 'granted') {
        setError('Se necesita permiso del micrófono para grabar');
      }

      // Configure audio mode for recording
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
        staysActiveInBackground: false,
        shouldDuckAndroid: true,
      });
    } catch (err) {
      console.error('Error requesting permissions:', err);
      setError('Error al solicitar permisos');
    }
  };

  const startRecording = async () => {
    try {
      setError(null);

      if (!hasPermission) {
        await requestPermissions();
        return;
      }

      // Create recording with high quality settings
      const { recording } = await Audio.Recording.createAsync(
        {
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
        }
      );

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
      } else {
        setError('No se pudo obtener el audio grabado');
        setIsProcessing(false);
      }
    } catch (err) {
      console.error('Error stopping recording:', err);
      setError('Error al detener grabación');
      setIsProcessing(false);
    }
  };

  const processAudio = async (audioUri) => {
    try {
      const result = await transcribeAudio(audioUri, currentPhrase.text);

      setWordScores(result.word_scores);
      setOverallScore(result.overall_score);
      setIsProcessing(false);
    } catch (err) {
      console.error('Error processing audio:', err);

      // Provide helpful error message
      if (err.message?.includes('Network')) {
        setError(`No se puede conectar al servidor. Verifica que esté corriendo en ${API_BASE_URL}`);
      } else {
        setError('Error al procesar el audio. Intenta de nuevo.');
      }
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
    if (currentIndex < ALL_PHRASES.length - 1) {
      setCurrentIndex(currentIndex + 1);
      resetResults();
    }
  };

  const handlePrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
      resetResults();
    }
  };

  const resetResults = () => {
    setWordScores(null);
    setOverallScore(null);
    setError(null);
  };

  const getScoreColor = (score) => {
    if (score >= 90) return colors.green;
    if (score >= 70) return colors.yellow;
    if (score >= 50) return colors.orange;
    return colors.red;
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={colors.background} />

      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>EnLearn</Text>
        <Text style={styles.subtitle}>Practica tu pronunciación en inglés</Text>
      </View>

      {/* Phrase Card */}
      <View style={styles.cardContainer}>
        <PhraseCard
          phrase={currentPhrase}
          wordScores={wordScores}
          showResults={wordScores !== null}
        />
      </View>

      {/* Overall Score */}
      {overallScore !== null && (
        <View style={styles.scoreContainer}>
          <Text style={styles.scoreLabel}>Puntuación:</Text>
          <Text style={[styles.scoreValue, { color: getScoreColor(overallScore) }]}>
            {Math.round(overallScore)}%
          </Text>
        </View>
      )}

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
          disabled={!hasPermission}
        />
      </View>

      {/* Navigation */}
      <View style={styles.navigationContainer}>
        <NavigationButtons
          currentIndex={currentIndex}
          totalPhrases={ALL_PHRASES.length}
          onPrevious={handlePrevious}
          onNext={handleNext}
          onReset={resetResults}
          hasResults={wordScores !== null}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    paddingTop: spacing.xl,
    paddingHorizontal: spacing.lg,
    alignItems: 'center',
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    color: colors.primary,
    letterSpacing: 1,
  },
  subtitle: {
    fontSize: 14,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
  cardContainer: {
    flex: 1,
    justifyContent: 'center',
    paddingVertical: spacing.lg,
  },
  scoreContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  scoreLabel: {
    fontSize: 18,
    color: colors.textSecondary,
  },
  scoreValue: {
    fontSize: 32,
    fontWeight: '700',
  },
  errorContainer: {
    marginHorizontal: spacing.lg,
    marginBottom: spacing.md,
    padding: spacing.md,
    backgroundColor: colors.red + '20',
    borderRadius: 12,
  },
  errorText: {
    color: colors.red,
    textAlign: 'center',
    fontSize: 14,
  },
  recordContainer: {
    alignItems: 'center',
    paddingVertical: spacing.lg,
  },
  navigationContainer: {
    paddingBottom: spacing.xl,
  },
});
