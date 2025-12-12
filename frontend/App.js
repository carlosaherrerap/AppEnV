/**
 * EnLearn - English Pronunciation Practice App
 * Main application component with audio recording, statistics, and practice mode
 */

import React, { useState, useEffect, useRef } from 'react';
import {
  StyleSheet,
  View,
  Text,
  StatusBar,
  SafeAreaView,
  Platform
} from 'react-native';
import { Audio } from 'expo-av';
import { colors, spacing } from './styles/theme';
import { ALL_PHRASES } from './data/phrases';
import { transcribeAudio, API_BASE_URL } from './api/config';
import PhraseCard from './components/PhraseCard';
import RecordButton from './components/RecordButton';
import NavigationButtons from './components/NavigationButtons';
import StatsScreen from './components/StatsScreen';
import PracticeMode from './components/PracticeMode';
import Confetti from './components/Confetti';

export default function App() {
  // Screen navigation
  const [currentScreen, setCurrentScreen] = useState('phrases'); // 'phrases' | 'stats' | 'practice'

  // Phrase practice state
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [wordScores, setWordScores] = useState(null);
  const [overallScore, setOverallScore] = useState(null);
  const [hasPermission, setHasPermission] = useState(false);
  const [error, setError] = useState(null);

  // Session tracking
  const [sessionResults, setSessionResults] = useState(
    Array(ALL_PHRASES.length).fill(null)
  );
  const [problemWords, setProblemWords] = useState([]);

  // Celebration animation
  const [showConfetti, setShowConfetti] = useState(false);

  // Audio metering state
  const [audioLevel, setAudioLevel] = useState(0);

  const recordingRef = useRef(null);
  const meteringIntervalRef = useRef(null);
  const silenceTimerRef = useRef(null);
  const lastVoiceTimeRef = useRef(null);
  const currentPhrase = ALL_PHRASES[currentIndex];

  // Check if current phrase has been pronounced
  const hasPronouncedCurrent = sessionResults[currentIndex] !== null;

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
      setAudioLevel(0);

      if (!hasPermission) {
        await requestPermissions();
        return;
      }

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
        isMeteringEnabled: true,
      });

      recordingRef.current = recording;
      lastVoiceTimeRef.current = Date.now();
      setIsRecording(true);

      // Start metering polling
      meteringIntervalRef.current = setInterval(async () => {
        if (recordingRef.current) {
          try {
            const status = await recordingRef.current.getStatusAsync();
            if (status.isRecording && status.metering !== undefined) {
              // Convert dB to 0-1 range (typical range is -160 to 0 dB)
              const db = status.metering;
              const normalized = Math.max(0, Math.min(1, (db + 60) / 60));
              setAudioLevel(normalized);

              // Check for voice activity
              if (normalized > 0.1) {
                lastVoiceTimeRef.current = Date.now();
              } else {
                // Check silence duration
                const silenceDuration = Date.now() - lastVoiceTimeRef.current;
                if (silenceDuration >= 3000) {
                  // 3 seconds of silence - auto stop
                  stopRecording();
                }
              }
            }
          } catch (e) {
            // Ignore status errors during recording
          }
        }
      }, 100);

    } catch (err) {
      console.error('Error starting recording:', err);
      setError('Error al iniciar grabación');
    }
  };

  const stopRecording = async () => {
    try {
      // Clear metering interval
      if (meteringIntervalRef.current) {
        clearInterval(meteringIntervalRef.current);
        meteringIntervalRef.current = null;
      }

      if (!recordingRef.current) return;

      setIsRecording(false);
      setIsProcessing(true);
      setAudioLevel(0);

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

      // Save result to session
      const newResults = [...sessionResults];
      newResults[currentIndex] = {
        phraseId: currentPhrase.id,
        overallScore: result.overall_score,
        wordScores: result.word_scores,
      };
      setSessionResults(newResults);

      // Collect problem words (score < 70%)
      const badWords = result.word_scores
        .filter(ws => ws.score < 70)
        .map(ws => ({ word: ws.word, score: ws.score, phraseId: currentPhrase.id }));

      if (badWords.length > 0) {
        setProblemWords(prev => {
          // Avoid duplicates
          const existing = prev.map(w => w.word.toLowerCase());
          const newWords = badWords.filter(w => !existing.includes(w.word.toLowerCase()));
          return [...prev, ...newWords];
        });
      }

    } catch (err) {
      console.error('Error processing audio:', err);
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
      // Clear results for new phrase (don't load existing)
      setWordScores(null);
      setOverallScore(null);
      setError(null);
    } else {
      // Completed all phrases! Show celebration then stats
      setShowConfetti(true);
    }
  };

  const handlePrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
      // Load previous results if they exist
      const prevResult = sessionResults[currentIndex - 1];
      if (prevResult) {
        setWordScores(prevResult.wordScores);
        setOverallScore(prevResult.overallScore);
      } else {
        resetResults();
      }
    }
  };

  const resetResults = () => {
    // Clear current results to retry the phrase
    setWordScores(null);
    setOverallScore(null);
    setError(null);
  };

  const handleConfettiComplete = () => {
    setShowConfetti(false);
    setCurrentScreen('stats');
  };

  const handlePractice = () => {
    setCurrentScreen('practice');
  };

  const handlePracticeComplete = (masteredWords) => {
    // Show celebration
    setShowConfetti(true);
    // Remove mastered words from problem list
    setProblemWords(prev =>
      prev.filter(w => !masteredWords.includes(w.word))
    );
  };

  const handlePracticeConfettiComplete = () => {
    setShowConfetti(false);
    setCurrentScreen('stats');
  };

  const handleRestart = () => {
    // Reset everything for new session
    setCurrentIndex(0);
    setSessionResults(Array(ALL_PHRASES.length).fill(null));
    setProblemWords([]);
    setWordScores(null);
    setOverallScore(null);
    setError(null);
    setCurrentScreen('phrases');
  };

  const handleBackFromPractice = () => {
    setCurrentScreen('stats');
  };

  const getScoreColor = (score) => {
    if (score >= 90) return colors.green;
    if (score >= 70) return colors.yellow;
    if (score >= 50) return colors.orange;
    return colors.red;
  };

  // Render Practice Mode
  if (currentScreen === 'practice') {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="light-content" backgroundColor={colors.background} />
        <Confetti
          visible={showConfetti}
          onComplete={handlePracticeConfettiComplete}
        />
        <PracticeMode
          problemWords={problemWords}
          onComplete={handlePracticeComplete}
          onBack={handleBackFromPractice}
        />
      </SafeAreaView>
    );
  }

  // Render Stats Screen
  if (currentScreen === 'stats') {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="light-content" backgroundColor={colors.background} />
        <StatsScreen
          sessionResults={sessionResults}
          problemWords={problemWords}
          onPractice={handlePractice}
          onRestart={handleRestart}
        />
      </SafeAreaView>
    );
  }

  // Render Phrases Screen (main)
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={colors.background} />

      <Confetti visible={showConfetti} onComplete={handleConfettiComplete} />

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
          audioLevel={audioLevel}
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
          overallScore={overallScore}
          nextDisabled={!hasPronouncedCurrent || (overallScore !== null && overallScore < 25)}
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
