import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useAdStore } from '../state/adStore';

interface GromoreSplashAdProps {
  onAdClosed: () => void;
  onAdError: (error: string) => void;
}

export const GromoreSplashAd: React.FC<GromoreSplashAdProps> = ({ onAdClosed, onAdError }) => {
  const { skipCountdown } = useAdStore(state => state.adState);
  const [timer, setTimer] = useState(skipCountdown);
  const [showSkipButton] = useState(true);

  useEffect(() => {
    const interval = setInterval(() => {
      setTimer(prev => {
        if (prev > 1) {
          return prev - 1;
        } else {
          clearInterval(interval);
          return 0;
        }
      });
    }, 1000);
    
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (timer === 0) {
      const autoCloseTimer = setTimeout(() => {
        onAdClosed();
      }, 5000);
      
      return () => clearTimeout(autoCloseTimer);
    }
  }, [timer, onAdClosed]);
  
  return (
    <View style={styles.container}>
      <View style={styles.adContent}>
        <Text style={styles.loadingText}>广告加载中...</Text>
      </View>
      <View style={styles.bottomBar}>
        <Text style={styles.appName}>天灯许愿</Text>
      </View>
      {showSkipButton && (
        <TouchableOpacity 
          style={[
            styles.skipButton, 
            timer > 0 && styles.skipButtonDisabled
          ]} 
          onPress={() => {
            if (timer === 0) {
              onAdClosed();
            }
          }}
          disabled={timer > 0}
        >
          <Text style={styles.skipText}>
            {timer > 0 ? `跳过 ${timer}s` : '跳过'}
          </Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.95)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 9999,
  },
  adContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: '#fff',
    marginTop: 10,
  },
  bottomBar: {
    position: 'absolute',
    bottom: 50,
    alignItems: 'center',
  },
  appName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
  },
  skipButton: {
    position: 'absolute',
    top: 60,
    right: 20,
    backgroundColor: 'rgba(0,0,0,0.7)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.4)',
    minWidth: 80,
    alignItems: 'center',
  },
  skipButtonDisabled: {
    backgroundColor: 'rgba(0,0,0,0.3)',
    borderColor: 'rgba(255,255,255,0.1)',
  },
  skipText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '500',
  },
});
