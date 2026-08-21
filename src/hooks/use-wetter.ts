import { useEffect, useState } from "react";

import { standorte, type StandortId } from "@/components/campus-barista/StandortWahl";

const CACHE_DAUER_MS = 30 * 60 * 1000;

type CacheEintrag = { temperatur: number; zeitpunkt: number };

const cache = new Map<StandortId, CacheEintrag>();

async function ladeTemperatur(lat: number, lon: number): Promise<number> {
  const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m`;
  const antwort = await fetch(url);
  if (!antwort.ok) throw new Error("Wetter konnte nicht geladen werden");
  const daten: unknown = await antwort.json();
  const temperatur = (daten as { current?: { temperature_2m?: unknown } }).current?.temperature_2m;
  if (typeof temperatur !== "number") throw new Error("Unerwartete Antwort von Open-Meteo");
  return temperatur;
}

/**
 * Lädt die aktuelle Temperatur für einen Standort über Open-Meteo (kein API-Schlüssel
 * nötig, keine Standortabfrage – feste Koordinaten je Standort). Ergebnisse werden pro
 * Standort 30 Minuten im Browser zwischengespeichert.
 */
export function useWetter(standortId: StandortId) {
  const [temperatur, setTemperatur] = useState<number | null>(null);
  const [laedt, setLaedt] = useState(true);
  const [fehler, setFehler] = useState(false);

  useEffect(() => {
    let abgebrochen = false;
    const { lat, lon } = standorte[standortId];

    const cacheEintrag = cache.get(standortId);
    if (cacheEintrag && Date.now() - cacheEintrag.zeitpunkt < CACHE_DAUER_MS) {
      setTemperatur(cacheEintrag.temperatur);
      setLaedt(false);
      setFehler(false);
      return;
    }

    setLaedt(true);
    setFehler(false);
    ladeTemperatur(lat, lon)
      .then((wert) => {
        if (abgebrochen) return;
        cache.set(standortId, { temperatur: wert, zeitpunkt: Date.now() });
        setTemperatur(wert);
        setLaedt(false);
      })
      .catch(() => {
        if (abgebrochen) return;
        setFehler(true);
        setLaedt(false);
      });

    return () => {
      abgebrochen = true;
    };
  }, [standortId]);

  return { temperatur, laedt, fehler };
}
