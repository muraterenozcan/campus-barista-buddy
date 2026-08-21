import getraenkeDaten from "@/data/getraenke.json";

export type Getraenk = {
  id: string;
  name: string;
  beschreibung: string;
  preis_cent: number;
  zubereitung_sekunden: number;
  koffein: string;
  kategorie: string;
  bild: string;
  verfuegbar: boolean;
};

export type Stimmung = "muede" | "gestresst" | "gut-drauf" | "neutral";

export const getraenke = getraenkeDaten as Getraenk[];

/** Wählt zufällig ein verfügbares Getränk, möglichst nicht dasselbe wie zuvor. */
export function waehleGetraenk(ausser?: string): Getraenk {
  const verfuegbare = getraenke.filter((g) => g.verfuegbar);
  if (verfuegbare.length === 0) {
    throw new Error("Kein Getränk verfügbar");
  }
  const auswahl =
    verfuegbare.length > 1 && ausser ? verfuegbare.filter((g) => g.id !== ausser) : verfuegbare;
  return auswahl[Math.floor(Math.random() * auswahl.length)]!;
}

const stimmungsSatz: Record<Stimmung, string> = {
  muede: "Du klingst müde, deshalb darf es jetzt etwas wach machen.",
  gestresst: "Du klingst gestresst, deshalb passt jetzt etwas Beruhigendes.",
  "gut-drauf": "Du bist gut drauf, das halten wir mit etwas Feinem.",
  neutral: "Deine Stimmung ist gerade ausgeglichen, dazu passt etwas Ausgewogenes.",
};

/**
 * Einzige Quelle für die Begründung.
 * Später kann der Inhalt dieser Funktion vollständig durch eine KI-Antwort
 * ersetzt werden – die Komponenten bleiben unverändert.
 */
export function erstelleBegruendung(
  getraenk: Getraenk,
  stimmung: Stimmung | null,
  text: string,
): string {
  const ersterSatz = stimmung
    ? stimmungsSatz[stimmung]
    : text.trim().length > 0
      ? "Nach deiner Beschreibung passt jetzt genau eine Sache."
      : "Für den Moment passt genau eine Sache.";
  const zweiterSatz = `${getraenk.name}: ${getraenk.beschreibung.toLowerCase()} – in etwa ${Math.max(
    1,
    Math.round(getraenk.zubereitung_sekunden / 60),
  )} Minuten fertig.`;
  return `${ersterSatz} ${zweiterSatz}`;
}

/**
 * Belegte Zeitpunkte je Standort, vorerst als einfache Liste im Browser
 * gehalten (kein Server, kein Persistieren über den Tab hinaus).
 */
const belegteZeitpunkte: Record<string, string[]> = {};

/**
 * Aktuelle Uhrzeit plus Zubereitungszeit, aufgerundet auf den nächsten
 * 3-Minuten-Takt. Ist der Takt für den Standort bereits belegt, wird der
 * nächste freie 3-Minuten-Takt genommen.
 */
export function verfuegbarAb(
  zubereitungSekunden: number,
  standortId: string,
  jetzt: Date = new Date(),
): string {
  const liste = (belegteZeitpunkte[standortId] ??= []);

  const ziel = new Date(jetzt.getTime() + zubereitungSekunden * 1000);
  ziel.setSeconds(0, 0);
  const takt = 3;
  const rest = ziel.getMinutes() % takt;
  if (rest !== 0 || ziel.getTime() <= jetzt.getTime()) {
    ziel.setMinutes(ziel.getMinutes() + (takt - rest));
  }

  let zeit = ziel.toLocaleTimeString("de-DE", { hour: "2-digit", minute: "2-digit" });
  while (liste.includes(zeit)) {
    ziel.setMinutes(ziel.getMinutes() + takt);
    zeit = ziel.toLocaleTimeString("de-DE", { hour: "2-digit", minute: "2-digit" });
  }

  liste.push(zeit);
  return zeit;
}
