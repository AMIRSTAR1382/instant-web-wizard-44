import { useCallback, useEffect, useRef, useState } from "react";
import { Mic, Square } from "lucide-react";
import { usePreferences } from "@/context/PreferencesContext";
import type { TranslationKey } from "@/i18n/en";

interface MicTestProps {
  /** 0–100, from the Input volume slider. */
  inputVolume: number;
  noiseSuppression: boolean;
  echoCancellation: boolean;
  autoGainControl: boolean;
}

type WebkitWindow = Window & { webkitAudioContext?: typeof AudioContext };

/** Opens the microphone and shows a live level meter. Nothing is recorded or sent anywhere. */
export const MicTest = ({ inputVolume, noiseSuppression, echoCancellation, autoGainControl }: MicTestProps) => {
  const { t } = usePreferences();
  const [running, setRunning] = useState(false);
  const [error, setError] = useState<TranslationKey | null>(null);
  const [level, setLevel] = useState(0);
  const stopRef = useRef<(() => void) | null>(null);
  const volumeRef = useRef(inputVolume);
  volumeRef.current = inputVolume;

  const stop = useCallback(() => {
    stopRef.current?.();
    stopRef.current = null;
    setRunning(false);
    setLevel(0);
  }, []);

  // Release the microphone when the panel closes.
  useEffect(() => stop, [stop]);

  const start = async () => {
    setError(null);
    const AudioContextClass = window.AudioContext ?? (window as WebkitWindow).webkitAudioContext;
    if (!navigator.mediaDevices?.getUserMedia || !AudioContextClass) {
      setError("mic.unsupported");
      return;
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: { noiseSuppression, echoCancellation, autoGainControl },
      });
      const audioContext = new AudioContextClass();
      const analyser = audioContext.createAnalyser();
      analyser.fftSize = 512;
      audioContext.createMediaStreamSource(stream).connect(analyser);
      const samples = new Uint8Array(analyser.fftSize);
      let frame = 0;

      const tick = () => {
        analyser.getByteTimeDomainData(samples);
        let sum = 0;
        for (const sample of samples) {
          const centred = (sample - 128) / 128;
          sum += centred * centred;
        }
        const rms = Math.sqrt(sum / samples.length);
        setLevel(Math.min(1, rms * 5 * (volumeRef.current / 75)));
        frame = requestAnimationFrame(tick);
      };
      tick();

      stopRef.current = () => {
        cancelAnimationFrame(frame);
        stream.getTracks().forEach((track) => track.stop());
        void audioContext.close();
      };
      setRunning(true);
    } catch (err) {
      const name = err instanceof DOMException ? err.name : "";
      setError(name === "NotAllowedError" || name === "SecurityError" ? "mic.denied" : "mic.error");
    }
  };

  const percent = Math.round(level * 100);

  return (
    <div className="space-y-3">
      {running && (
        <div className="space-y-2">
          <div
            role="meter"
            aria-label={t("mic.level")}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={percent}
            className="h-3 overflow-hidden rounded-full bg-secondary"
          >
            <div
              className="h-full rounded-full bg-gradient-to-r from-accent to-primary transition-[width] duration-75 rtl:bg-gradient-to-l"
              style={{ width: `${percent}%` }}
            />
          </div>
          <p className="text-xs text-muted-foreground">{t("mic.hint")}</p>
        </div>
      )}

      {error && (
        <p role="alert" className="rounded-lg bg-destructive/10 p-3 text-xs text-destructive">
          {t(error)}
        </p>
      )}

      <button
        onClick={running ? stop : () => void start()}
        className="flex w-full items-center justify-center gap-2 rounded-lg bg-primary/10 py-3 text-sm font-medium text-primary transition-colors hover:bg-primary/20"
      >
        {running ? <Square className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
        {running ? t("mic.stop") : t("mic.test")}
      </button>
    </div>
  );
};
