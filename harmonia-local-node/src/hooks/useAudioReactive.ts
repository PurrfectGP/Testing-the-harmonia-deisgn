/**
 * useAudioReactive - Hook for audio-reactive visual elements
 * Session 11: Audio-Reactive Elements
 *
 * Features:
 * - Audio context with analyzer node
 * - Frequency data extraction
 * - Bass, mid, treble band separation
 * - Smoothed output values
 * - Optional microphone input
 */

import { useState, useEffect, useRef, useCallback } from 'react';

export interface AudioReactiveData {
  // Overall volume (0-1)
  volume: number;
  // Frequency bands (0-1)
  bass: number;
  mid: number;
  treble: number;
  // Raw frequency data
  frequencyData: Uint8Array | null;
  // Is audio playing/active
  isActive: boolean;
}

interface UseAudioReactiveOptions {
  // Smoothing factor (0-1, higher = smoother)
  smoothing?: number;
  // FFT size (must be power of 2)
  fftSize?: number;
  // Whether to use microphone input
  useMicrophone?: boolean;
  // Audio element to analyze
  audioElement?: HTMLAudioElement | null;
}

export function useAudioReactive(options: UseAudioReactiveOptions = {}) {
  const {
    smoothing = 0.8,
    fftSize = 256,
    useMicrophone = false,
    audioElement = null,
  } = options;

  const [data, setData] = useState<AudioReactiveData>({
    volume: 0,
    bass: 0,
    mid: 0,
    treble: 0,
    frequencyData: null,
    isActive: false,
  });

  const audioContextRef = useRef<AudioContext | null>(null);
  const analyzerRef = useRef<AnalyserNode | null>(null);
  const dataArrayRef = useRef<Uint8Array | null>(null);
  const sourceRef = useRef<MediaStreamAudioSourceNode | MediaElementAudioSourceNode | null>(null);
  const rafRef = useRef<number | null>(null);
  const smoothedDataRef = useRef({ volume: 0, bass: 0, mid: 0, treble: 0 });

  // Initialize audio context and analyzer
  const initAudio = useCallback(async () => {
    try {
      // Create audio context
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioContextClass) {
        console.warn('Web Audio API not supported');
        return;
      }

      audioContextRef.current = new AudioContextClass();
      analyzerRef.current = audioContextRef.current.createAnalyser();
      analyzerRef.current.fftSize = fftSize;
      analyzerRef.current.smoothingTimeConstant = smoothing;

      const bufferLength = analyzerRef.current.frequencyBinCount;
      dataArrayRef.current = new Uint8Array(bufferLength);

      // Connect source
      if (useMicrophone) {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        sourceRef.current = audioContextRef.current.createMediaStreamSource(stream);
        sourceRef.current.connect(analyzerRef.current);
      } else if (audioElement) {
        sourceRef.current = audioContextRef.current.createMediaElementSource(audioElement);
        sourceRef.current.connect(analyzerRef.current);
        analyzerRef.current.connect(audioContextRef.current.destination);
      }

      setData(prev => ({ ...prev, isActive: true }));
    } catch (error) {
      console.error('Failed to initialize audio:', error);
    }
  }, [fftSize, smoothing, useMicrophone, audioElement]);

  // Analyze audio data
  const analyze = useCallback(() => {
    if (!analyzerRef.current || !dataArrayRef.current) return;

    analyzerRef.current.getByteFrequencyData(dataArrayRef.current as Uint8Array<ArrayBuffer>);
    const dataArray = dataArrayRef.current;
    const bufferLength = dataArray.length;

    // Calculate volume (average of all frequencies)
    let sum = 0;
    for (let i = 0; i < bufferLength; i++) {
      sum += dataArray[i];
    }
    const rawVolume = sum / bufferLength / 255;

    // Calculate frequency bands
    const bassEnd = Math.floor(bufferLength * 0.15); // ~0-300Hz
    const midEnd = Math.floor(bufferLength * 0.5);   // ~300-2kHz
    // treble is the rest                             // ~2k-20kHz

    let bassSum = 0;
    let midSum = 0;
    let trebleSum = 0;

    for (let i = 0; i < bassEnd; i++) {
      bassSum += dataArray[i];
    }
    for (let i = bassEnd; i < midEnd; i++) {
      midSum += dataArray[i];
    }
    for (let i = midEnd; i < bufferLength; i++) {
      trebleSum += dataArray[i];
    }

    const rawBass = bassSum / bassEnd / 255;
    const rawMid = midSum / (midEnd - bassEnd) / 255;
    const rawTreble = trebleSum / (bufferLength - midEnd) / 255;

    // Apply smoothing
    const s = smoothing;
    smoothedDataRef.current = {
      volume: smoothedDataRef.current.volume * s + rawVolume * (1 - s),
      bass: smoothedDataRef.current.bass * s + rawBass * (1 - s),
      mid: smoothedDataRef.current.mid * s + rawMid * (1 - s),
      treble: smoothedDataRef.current.treble * s + rawTreble * (1 - s),
    };

    setData({
      volume: smoothedDataRef.current.volume,
      bass: smoothedDataRef.current.bass,
      mid: smoothedDataRef.current.mid,
      treble: smoothedDataRef.current.treble,
      frequencyData: dataArray.slice() as Uint8Array,
      isActive: true,
    });

    rafRef.current = requestAnimationFrame(analyze);
  }, [smoothing]);

  // Start analysis
  const start = useCallback(async () => {
    if (!audioContextRef.current) {
      await initAudio();
    }

    if (audioContextRef.current?.state === 'suspended') {
      await audioContextRef.current.resume();
    }

    rafRef.current = requestAnimationFrame(analyze);
  }, [initAudio, analyze]);

  // Stop analysis
  const stop = useCallback(() => {
    if (rafRef.current) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }

    setData(prev => ({ ...prev, isActive: false }));
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stop();
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
    };
  }, [stop]);

  return {
    data,
    start,
    stop,
    isSupported: typeof AudioContext !== 'undefined' || typeof (window as any).webkitAudioContext !== 'undefined',
  };
}

// Utility to map audio values to visual parameters
export function mapAudioToVisual(
  value: number,
  minOutput: number,
  maxOutput: number,
  curve: 'linear' | 'exponential' | 'logarithmic' = 'linear'
): number {
  let mapped: number;

  switch (curve) {
    case 'exponential':
      mapped = Math.pow(value, 2);
      break;
    case 'logarithmic':
      mapped = Math.log10(value * 9 + 1);
      break;
    default:
      mapped = value;
  }

  return minOutput + mapped * (maxOutput - minOutput);
}

export default useAudioReactive;
