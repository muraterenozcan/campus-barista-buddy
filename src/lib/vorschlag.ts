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
 * Regelbasierte Begründung ohne KI. Dient als Rückfallebene für
 * {@link holeEmpfehlung}, wenn der KI-Endpunkt fehlschlägt, zu lange braucht
 * oder eine ungültige Antwort liefert.
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

export type Empfehlung = {
  getraenk: Getraenk;
  begruendung: string;
};

/**
 * Holt eine KI-gestützte Empfehlung von /api/empfehlung. Schlägt der Aufruf
 * fehl, kommt keine Antwort innerhalb der clientseitigen Frist zurück oder
 * ist die Antwort ungültig, greift die regelbasierte Rückfallebene
 * ({@link waehleGetraenk} + {@link erstelleBegruendung}) – die Karte bleibt
 * also nie leer.
 */
export async function holeEmpfehlung(kontext: {
  text: string;
  stimmung: Stimmung | null;
  standort: string;
  temperatur: number | null;
  uhrzeit: string;
  letzteIds: string[];
  ausser?: string | undefined;
}): Promise<Empfehlung> {
  const verfuegbare = getraenke.filter((g) => g.verfuegbar);

  try {
    const controller = new AbortController();
    const timeoutId = window.setTimeout(() => controller.abort(), 12_000);

    let antwort: Response;
    try {
      antwort = await fetch("/api/empfehlung", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        signal: controller.signal,
        body: JSON.stringify({
          text: kontext.text,
          stimmung: kontext.stimmung,
          standort: kontext.standort,
          temperatur: kontext.temperatur,
          uhrzeit: kontext.uhrzeit,
          getraenke: verfuegbare.map((g) => ({
            id: g.id,
            name: g.name,
            beschreibung: g.beschreibung,
            koffein: g.koffein,
          })),
          letzteIds: kontext.letzteIds,
        }),
      });
    } finally {
      window.clearTimeout(timeoutId);
    }

    if (!antwort.ok) throw new Error("Empfehlung fehlgeschlagen");

    const daten: unknown = await antwort.json();
    const getraenkId = (daten as { getraenk_id?: unknown }).getraenk_id;
    const begruendung = (daten as { begruendung?: unknown }).begruendung;
    if (typeof getraenkId !== "string" || typeof begruendung !== "string") {
      throw new Error("Ungültige Antwort");
    }

    const getraenk = verfuegbare.find((g) => g.id === getraenkId);
    if (!getraenk) throw new Error("Unbekanntes Getränk in der Antwort");

    return { getraenk, begruendung };
  } catch {
    const getraenk = waehleGetraenk(kontext.ausser);
    return {
      getraenk,
      begruendung: erstelleBegruendung(getraenk, kontext.stimmung, kontext.text),
    };
  }
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
