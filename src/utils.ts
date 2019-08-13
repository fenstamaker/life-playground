import { useRef, useEffect } from "react";

export function useInterval(callback: () => void, delay: number) {
  const savedCallback = useRef<() => void>();

  // Remember the latest callback.
  useEffect(() => {
    savedCallback.current = callback;
  }, [callback]);

  // Set up the interval.
  useEffect(() => {
    function tick() {
      savedCallback.current();
    }
    if (delay !== null) {
      let id = setInterval(tick, delay);
      return () => clearInterval(id);
    }
  }, [delay]);
}

export function usePaintInterval(
  callback: (timestamp?: number) => void,
  delay: number
) {
  const savedCallback = useRef<(timestamp?: number) => void>();
  const previousTimestamp = useRef(window.performance.now());

  // Remember the latest callback.
  useEffect(() => {
    savedCallback.current = callback;
  }, [callback]);

  // Set up the interval.
  useEffect(() => {
    let frameId = 0;

    function tick(timestamp: number) {
      frameId = window.requestAnimationFrame(tick);
      if (timestamp - previousTimestamp.current >= delay) {
        savedCallback.current(timestamp);
        previousTimestamp.current = timestamp;
      }
    }

    if (delay !== null) {
      frameId = window.requestAnimationFrame(tick);

      return () => window.cancelAnimationFrame(frameId);
    }
  }, [delay]);
}

export function useWorker(callback: (e: MessageEvent) => void, worker: Worker) {
  const savedWorker = useRef<Worker>();
  const savedCallback = useRef<(e: MessageEvent) => void>();

  useEffect(() => {
    savedWorker.current = worker;
  }, [worker]);

  useEffect(() => {
    savedCallback.current = callback;
  }, [callback]);

  useEffect(() => {
    function tick(e: MessageEvent) {
      savedCallback.current(e);
    }
    savedWorker.current.onmessage = tick;
    return () => savedWorker.current.terminate();
  }, [false]);

  return (savedWorker.current || { postMessage: (): void => null }).postMessage;
}
