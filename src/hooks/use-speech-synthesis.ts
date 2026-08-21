import { useCallback, useEffect, useState } from "react";

/**
 * Wrapt speechSynthesis für das deutsche Vorlesen kurzer Texte
 * (z. B. der Begründung eines Getränkevorschlags).
 */
export function useSpeechSynthesis() {
  // Erst nach dem Mount ermitteln (nicht im useState-Initializer!), sonst
  // weicht das serverseitig gerenderte HTML vom ersten Client-Render ab
  // (kein `window` auf dem Server) und die Hydration schlägt fehl.
  const [unterstuetzt, setUnterstuetzt] = useState(false);
  const [sprichtGerade, setSprichtGerade] = useState(false);

  useEffect(() => {
    setUnterstuetzt("speechSynthesis" in window);
    return () => {
      window.speechSynthesis?.cancel();
    };
  }, []);

  const sprechen = useCallback(
    (text: string) => {
      if (!unterstuetzt || !text.trim()) return;
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = "de-DE";
      utterance.onend = () => setSprichtGerade(false);
      utterance.onerror = () => setSprichtGerade(false);
      window.speechSynthesis.speak(utterance);
      setSprichtGerade(true);
    },
    [unterstuetzt],
  );

  const stummschalten = useCallback(() => {
    if (!unterstuetzt) return;
    window.speechSynthesis.cancel();
    setSprichtGerade(false);
  }, [unterstuetzt]);

  return { unterstuetzt, sprichtGerade, sprechen, stummschalten };
}
