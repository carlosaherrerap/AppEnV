/**
 * AudioWave Component
 * Animated waveform that reacts to voice/audio level
 */

import React, { useEffect, useRef } from 'react';
import { View, Animated, StyleSheet } from 'react-native';
import { colors } from '../styles/theme';

const BAR_COUNT = 5;
const MIN_HEIGHT = 4;
const MAX_HEIGHT = 40;

const AudioWave = ({ isActive, audioLevel = 0 }) => {
  const bars = useRef(
    Array.from({ length: BAR_COUNT }, () => new Animated.Value(MIN_HEIGHT))
  ).current;

  useEffect(() => {
    if (isActive) {
      // Animate bars based on audio level
      const targetHeight = MIN_HEIGHT + (MAX_HEIGHT - MIN_HEIGHT) * Math.min(audioLevel * 2, 1);
      
      bars.forEach((bar, index) => {
        // Add slight variation for natural look
        const variation = 1 + (Math.random() - 0.5) * 0.4;
        const height = Math.max(MIN_HEIGHT, targetHeight * variation);
        
        Animated.timing(bar, {
          toValue: height,
          duration: 100,
          useNativeDriver: false,
        }).start();
      });
    } else {
      // Reset to minimum when not active
      bars.forEach((bar) => {
        Animated.timing(bar, {
          toValue: MIN_HEIGHT,
          duration: 200,
          useNativeDriver: false,
        }).start();
      });
    }
  }, [isActive, audioLevel, bars]);

  // Idle animation when active but no voice
  useEffect(() => {
    if (!isActive) return;

    const idleAnimation = () => {
      if (audioLevel < 0.1) {
        bars.forEach((bar, index) => {
          const delay = index * 50;
          Animated.sequence([
            Animated.delay(delay),
            Animated.timing(bar, {
              toValue: MIN_HEIGHT + 2 + Math.random() * 3,
              duration: 300 + Math.random() * 200,
              useNativeDriver: false,
            }),
          ]).start();
        });
      }
    };

    const interval = setInterval(idleAnimation, 500);
    return () => clearInterval(interval);
  }, [isActive, audioLevel, bars]);

  return (
    <View style={styles.container}>
      {bars.map((bar, index) => (
        <Animated.View
          key={index}
          style={[
            styles.bar,
            {
              height: bar,
              backgroundColor: audioLevel > 0.1 ? colors.primary : colors.textMuted,
            },
          ]}
        />
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 50,
    gap: 4,
  },
  bar: {
    width: 6,
    borderRadius: 3,
  },
});

export default AudioWave;
