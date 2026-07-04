"use client";

import { useEffect, useState } from "react";

export function useBackgroundCycle(totalItems: number, intervalMs = 9000) {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    setIndex(0);
  }, [totalItems]);

  useEffect(() => {
    if (totalItems <= 1) {
      return;
    }

    const interval = window.setInterval(() => {
      setIndex((current) => (current + 1) % totalItems);
    }, intervalMs);

    return () => window.clearInterval(interval);
  }, [intervalMs, totalItems]);

  return index;
}
