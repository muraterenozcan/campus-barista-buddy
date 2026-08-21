import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";

/**
 * Wrapt die Web Speech API (SpeechRecognition) für Diktat auf Deutsch.
 * `onResult` wird bei jedem (auch vorläufigen) Ergebnis mit dem
 * vollständigen bisher erkannten Text aufgerufen.
 */
export function useSpeechRecognition(onResult: (text: string) => void) {
  // Erst nach dem Mount ermitteln (nicht im useState-Initializer!), sonst
  // weicht das serverseitig gerenderte HTML vom ersten Client-Render ab
  // (kein `window` auf dem Server) und die Hydration schlägt fehl.
  const [unterstuetzt, setUnterstuetzt] = useState(false);
  const [hoertZu, setHoertZu] = useState(false);
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const onResultRef = useRef(onResult);
  onResultRef.current = onResult;

  useEffect(() => {
    setUnterstuetzt(!!(window.SpeechRecognition ?? window.webkitSpeechRecognition));
    return () => {
      recognitionRef.current?.stop();
    };
  }, []);

  const start = useCallback(() => {
    const SpeechRecognitionCtor = window.SpeechRecognition ?? window.webkitSpeechRecognition;
    if (!SpeechRecognitionCtor) return;

    const recognition = new SpeechRecognitionCtor();
    recognition.lang = "de-DE";
    recognition.interimResults = true;
    recognition.continuous = false;

    recognition.onresult = (event) => {
      let transcript = "";
      for (let i = 0; i < event.results.length; i++) {
        transcript += event.results.item(i).item(0).transcript;
      }
      onResultRef.current(transcript);
    };

    recognition.onerror = (event) => {
      setHoertZu(false);
      if (event.error === "not-allowed" || event.error === "service-not-allowed") {
        toast("Mikrofonzugriff wurde verweigert. Du kannst den Text auch selbst eingeben.");
      } else if (event.error !== "aborted" && event.error !== "no-speech") {
        toast("Spracherkennung hat nicht funktioniert. Bitte versuche es erneut.");
      }
    };

    recognition.onend = () => setHoertZu(false);

    recognitionRef.current = recognition;
    recognition.start();
    setHoertZu(true);
  }, []);

  const stop = useCallback(() => {
    recognitionRef.current?.stop();
    setHoertZu(false);
  }, []);

  return { unterstuetzt, hoertZu, start, stop };
}
