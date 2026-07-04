"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import { useSoundscapeStore } from "@/lib/soundscape-store";
import type { AnalyzeSoundscapeRequest } from "@/types/soundscape";
import { buildMetricsFromFrequencyData } from "@/utils/audio-metrics";

type AnalysisStatus = "idle" | "requesting" | "active" | "error";

type AudioSnippetHandler = (payload: AnalyzeSoundscapeRequest) => void;

type UseAudioAnalysisOptions = {
  onSnippet?: AudioSnippetHandler;
};

const RECORDING_DURATION_MS = 4000;
const ANALYSIS_INTERVAL_MS = 14000;

function blobToBase64(blob: Blob) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();

    reader.onloadend = () => {
      const result = reader.result;

      if (typeof result !== "string") {
        reject(new Error("Unable to encode audio snippet."));
        return;
      }

      resolve(result.split(",")[1] ?? "");
    };

    reader.onerror = () => reject(reader.error ?? new Error("Unable to read audio blob."));
    reader.readAsDataURL(blob);
  });
}

function getSupportedMimeType() {
  if (typeof MediaRecorder === "undefined") {
    return undefined;
  }

  const candidates = ["audio/webm;codecs=opus", "audio/webm", "audio/mp4"];
  return candidates.find((candidate) => MediaRecorder.isTypeSupported(candidate));
}

export function useAudioAnalysis(options: UseAudioAnalysisOptions = {}) {
  const onSnippet = options.onSnippet;
  const setMetrics = useSoundscapeStore((state) => state.setMetrics);
  const [status, setStatus] = useState<AnalysisStatus>("idle");
  const [error, setError] = useState<string | null>(null);

  const streamRef = useRef<MediaStream | null>(null);
  const contextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const rafRef = useRef<number | null>(null);
  const recorderTimeoutRef = useRef<number | null>(null);
  const recorderRef = useRef<MediaRecorder | null>(null);
  const unmountedRef = useRef(false);

  const stop = useCallback(() => {
    if (rafRef.current) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }

    if (recorderTimeoutRef.current) {
      window.clearTimeout(recorderTimeoutRef.current);
      recorderTimeoutRef.current = null;
    }

    recorderRef.current?.stop();
    recorderRef.current = null;

    analyserRef.current?.disconnect();
    analyserRef.current = null;

    contextRef.current?.close().catch(() => undefined);
    contextRef.current = null;

    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;

    if (!unmountedRef.current) {
      setStatus("idle");
    }
  }, []);

  const scheduleSnippetCapture = useCallback(() => {
    const mimeType = getSupportedMimeType();

    if (!streamRef.current || !onSnippet || !mimeType) {
      return;
    }

    recorderTimeoutRef.current = window.setTimeout(() => {
      if (!streamRef.current || !onSnippet || unmountedRef.current) {
        return;
      }

      const mediaRecorder = new MediaRecorder(streamRef.current, { mimeType });
      recorderRef.current = mediaRecorder;
      const chunks: Blob[] = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunks.push(event.data);
        }
      };

      mediaRecorder.onerror = () => {
        scheduleSnippetCapture();
      };

      mediaRecorder.onstop = async () => {
        recorderRef.current = null;

        if (chunks.length === 0) {
          scheduleSnippetCapture();
          return;
        }

        const blob = new Blob(chunks, { type: mimeType });
        const audioBase64 = await blobToBase64(blob).catch(() => "");
        const metrics = useSoundscapeStore.getState().metrics;

        if (audioBase64) {
          onSnippet({
            audioBase64,
            mimeType,
            metrics,
            capturedAt: new Date().toISOString(),
          });
        }

        scheduleSnippetCapture();
      };

      mediaRecorder.start();
      window.setTimeout(() => {
        if (mediaRecorder.state !== "inactive") {
          mediaRecorder.stop();
        }
      }, RECORDING_DURATION_MS);
    }, ANALYSIS_INTERVAL_MS);
  }, [onSnippet]);

  const start = useCallback(async () => {
    try {
      setStatus("requesting");
      setError(null);

      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          autoGainControl: false,
          echoCancellation: false,
          noiseSuppression: false,
        },
      });

      const audioContext = new AudioContext();
      const analyser = audioContext.createAnalyser();
      analyser.fftSize = 512;
      analyser.smoothingTimeConstant = 0.68;

      const source = audioContext.createMediaStreamSource(stream);
      source.connect(analyser);

      const data = new Uint8Array(analyser.frequencyBinCount);

      streamRef.current = stream;
      contextRef.current = audioContext;
      analyserRef.current = analyser;
      setStatus("active");

      const loop = () => {
        analyser.getByteFrequencyData(data);
        setMetrics(buildMetricsFromFrequencyData(data));
        rafRef.current = window.requestAnimationFrame(loop);
      };

      loop();
      scheduleSnippetCapture();
      return true;
    } catch (caughtError) {
      setStatus("error");
      setError(
        caughtError instanceof Error
          ? caughtError.message
          : "Microphone access was denied.",
      );
      return false;
    }
  }, [scheduleSnippetCapture, setMetrics]);

  useEffect(() => {
    return () => {
      unmountedRef.current = true;
      stop();
    };
  }, [stop]);

  return {
    error,
    start,
    status,
    stop,
  };
}
