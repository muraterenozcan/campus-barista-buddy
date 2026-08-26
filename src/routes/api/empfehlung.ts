import { createFileRoute } from "@tanstack/react-router";
import * as z from "zod/v4";

// Läuft ausschließlich serverseitig. Der Schlüssel (LOVABLE_API_KEY) wird vom
// Lovable-KI-Gateway bereitgestellt und nie an den Browser ausgeliefert.

const MAX_TEXT_LAENGE = 500;
const ANFRAGEN_PRO_MINUTE = 10;
const ZEITFENSTER_MS = 60_000;
const KI_TIMEOUT_MS = 15_000;
const KI_ENDPUNKT = "https://ai.gateway.lovable.dev/v1/chat/completions";
const KI_MODELL = "google/gemini-2.5-flash";

const anfrageZeiten = new Map<string, number[]>();

function ermittleClientId(request: Request): string {
  return request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "lokal";
}

/** Einfaches Sliding-Window-Rate-Limit pro Browser, im Server-Speicher gehalten. */
function pruefeRateLimit(clientId: string): boolean {
  const jetzt = Date.now();
  const bisherige = (anfrageZeiten.get(clientId) ?? []).filter(
    (zeit) => jetzt - zeit < ZEITFENSTER_MS,
  );
  if (bisherige.length >= ANFRAGEN_PRO_MINUTE) {
    anfrageZeiten.set(clientId, bisherige);
    return false;
  }
  bisherige.push(jetzt);
  anfrageZeiten.set(clientId, bisherige);
  return true;
}

const GetraenkKurzSchema = z.object({
  id: z.string(),
  name: z.string(),
  beschreibung: z.string(),
  koffein: z.string(),
});

const AnfrageSchema = z.object({
  text: z.string(),
  stimmung: z.string().nullable(),
  standort: z.string().min(1),
  temperatur: z.number().nullable(),
  uhrzeit: z.string().min(1),
  getraenke: z.array(GetraenkKurzSchema).min(1),
  letzteIds: z.array(z.string()),
});

function fehlerAntwort(nachricht: string, status: number): Response {
  return Response.json({ error: nachricht }, { status });
}

export const Route = createFileRoute("/api/empfehlung")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        try {
          if (!pruefeRateLimit(ermittleClientId(request))) {
            return fehlerAntwort("Zu viele Anfragen, bitte kurz warten.", 429);
          }

          if (!process.env["ANTHROPIC_API_KEY"]) {
            console.error("ANTHROPIC_API_KEY ist nicht gesetzt.");
            return fehlerAntwort("KI-Empfehlung ist nicht konfiguriert.", 500);
          }

          const rohdaten: unknown = await request.json().catch(() => null);
          const geparst = AnfrageSchema.safeParse(rohdaten);
          if (!geparst.success) {
            return fehlerAntwort("Ungültige Anfrage.", 400);
          }
          const eingabe = geparst.data;
          const text = eingabe.text.slice(0, MAX_TEXT_LAENGE);

          // Verbindliche Regel: nach 18 Uhr keine Getränke mit hohem Koffeingehalt.
          // Serverzeit ist die vertrauenswürdige Quelle, nicht die vom Client
          // mitgeschickte Uhrzeit.
          const nachAchtzehnUhr = new Date().getHours() >= 18;
          const kandidaten = eingabe.getraenke.filter(
            (g) => !(nachAchtzehnUhr && g.koffein === "hoch"),
          );

          if (kandidaten.length === 0) {
            return fehlerAntwort("Keine passenden Getränke verfügbar.", 422);
          }

          const kandidatenIds = kandidaten.map((g) => g.id) as [string, ...string[]];
          const EmpfehlungSchema = z.object({
            getraenk_id: z.enum(kandidatenIds),
            begruendung: z.string(),
          });

          const systemPrompt = `Du bist der Empfehlungs-Assistent von "Campus Barista", einer App für Studierende an einem Hochschul-Campus.
Du bekommst eine kurze Beschreibung der aktuellen Situation einer Person und musst genau ein Getränk aus der mitgelieferten Liste empfehlen.

Regeln:
- Wähle ausschließlich eine "getraenk_id" aus der mitgelieferten Liste. Erfinde niemals eine eigene ID.
- Vermeide nach Möglichkeit die zuletzt vorgeschlagenen Getränke, sofern eine sinnvolle Alternative existiert.
- Die Begründung besteht aus genau zwei Sätzen auf Deutsch, ist freundlich und knapp, und bezieht sich auf die Situation der Person.`;

          const userPrompt = `Situation der Person:
- Text: ${text.trim().length > 0 ? `"${text}"` : "(keine Angabe)"}
- Stimmung: ${eingabe.stimmung ?? "keine Angabe"}
- Standort: ${eingabe.standort}
- Temperatur: ${eingabe.temperatur !== null ? `${eingabe.temperatur} °C` : "unbekannt"}
- Uhrzeit: ${eingabe.uhrzeit}
- Zuletzt vorgeschlagen (möglichst vermeiden): ${
            eingabe.letzteIds.length > 0 ? eingabe.letzteIds.join(", ") : "keine"
          }

Verfügbare Getränke:
${JSON.stringify(kandidaten, null, 2)}`;

          const client = new Anthropic({ apiKey: process.env["ANTHROPIC_API_KEY"] });

          const antwort = await client.messages.parse(
            {
              model: "claude-sonnet-5",
              max_tokens: 1024,
              system: systemPrompt,
              messages: [{ role: "user", content: userPrompt }],
              output_config: { format: zodOutputFormat(EmpfehlungSchema) },
            },
            { timeout: ANTHROPIC_TIMEOUT_MS },
          );

          const ergebnis = antwort.parsed_output;
          if (!ergebnis) {
            return fehlerAntwort("Keine gültige Antwort erhalten.", 502);
          }

          // Zusätzliche, explizite Prüfung gegen die Getränkeliste – unabhängig
          // von der Schema-Validierung oben.
          const bekannt = kandidaten.some((g) => g.id === ergebnis.getraenk_id);
          if (!bekannt) {
            return fehlerAntwort("Unbekannte getraenk_id in der Antwort.", 502);
          }

          return Response.json(ergebnis);
        } catch (fehler) {
          console.error("Empfehlung fehlgeschlagen:", fehler);
          return fehlerAntwort("Empfehlung fehlgeschlagen.", 502);
        }
      },
    },
  },
});
