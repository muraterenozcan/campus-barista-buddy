import type { Stimmung } from "@/lib/vorschlag";

export type Ausdruckswerte = {
  neutral: number;
  happy: number;
  sad: number;
  angry: number;
  fearful: number;
  disgusted: number;
  surprised: number;
};

/** Unterhalb dieser Sicherheit des stärksten Ausdrucks gilt die Auswertung als nicht eindeutig. */
const MINDEST_SICHERHEIT = 0.5;

/**
 * Ab dieser Ausprägung von "neutral" gilt der Ausdruck als echte Ruhe
 * ("neutral"), darunter eher als Ausdruckslosigkeit ("müde").
 */
const NEUTRAL_HOCH_SCHWELLE = 0.7;

/**
 * Einzige Quelle für die Ableitung eines Stimmungs-Stichworts aus den
 * Ausdrucks-Wahrscheinlichkeiten von face-api.js. Liefert `null`, wenn der
 * stärkste Ausdruck zu unsicher ist, um ein Stichwort zu bilden.
 */
export function leiteStimmungAusAusdruck(werte: Ausdruckswerte): Stimmung | null {
  let staerkster: keyof Ausdruckswerte = "neutral";
  let hoechsterWert = -Infinity;
  for (const [name, wert] of Object.entries(werte) as [keyof Ausdruckswerte, number][]) {
    if (wert > hoechsterWert) {
      staerkster = name;
      hoechsterWert = wert;
    }
  }

  if (hoechsterWert < MINDEST_SICHERHEIT) return null;

  if (staerkster === "sad" || staerkster === "angry") return "gestresst";
  if (staerkster === "happy") return "gut-drauf";
  if (staerkster === "neutral" && hoechsterWert < NEUTRAL_HOCH_SCHWELLE) return "muede";
  return "neutral";
}
