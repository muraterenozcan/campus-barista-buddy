import { Volume2, VolumeX } from "lucide-react";
import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import { useSpeechSynthesis } from "@/hooks/use-speech-synthesis";
import type { Getraenk } from "@/lib/vorschlag";

export function ErgebnisKarte({
  getraenk,
  begruendung,
  verfuegbarAbZeit,
  onAnderer,
}: {
  getraenk: Getraenk;
  begruendung: string;
  verfuegbarAbZeit: string;
  onAnderer: () => void;
}) {
  const [bildFehler, setBildFehler] = useState(false);
  const {
    unterstuetzt: vorlesenUnterstuetzt,
    sprichtGerade,
    sprechen,
    stummschalten,
  } = useSpeechSynthesis();

  useEffect(() => {
    sprechen(begruendung);
    return () => stummschalten();
  }, [begruendung, sprechen, stummschalten]);

  return (
    <article className="rounded-2xl border border-haw-soft/60 bg-card p-5 shadow-sm">
      <div className="aspect-square w-full overflow-hidden rounded-2xl bg-haw-soft/40">
        {!bildFehler && (
          <img
            src={getraenk.bild}
            alt={getraenk.name}
            loading="lazy"
            onError={() => setBildFehler(true)}
            className="h-full w-full object-cover"
          />
        )}
      </div>

      <h3 className="titel-display mt-5 text-2xl leading-tight">{getraenk.name}</h3>
      <div className="mt-2 flex items-start gap-2">
        <p className="text-sm leading-relaxed text-foreground/80">{begruendung}</p>
        {vorlesenUnterstuetzt && (
          <Button
            type="button"
            variant="ghost"
            size="icon"
            aria-label={sprichtGerade ? "Vorlesen stummschalten" : "Begründung erneut vorlesen"}
            aria-pressed={sprichtGerade}
            onClick={() => (sprichtGerade ? stummschalten() : sprechen(begruendung))}
            className="h-8 w-8 shrink-0 text-haw-primary hover:bg-haw-soft/20"
          >
            {sprichtGerade ? (
              <Volume2 className="size-4 animate-pulse" />
            ) : (
              <VolumeX className="size-4" />
            )}
          </Button>
        )}
      </div>

      <p className="mt-4 text-xs text-muted-foreground">
        Verfügbar ab {verfuegbarAbZeit} – die Maschine ist bis dahin belegt.
      </p>

      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={onAnderer}
        className="mt-4 border-haw-soft text-haw-accent hover:bg-haw-soft/20"
      >
        Anderen Vorschlag
      </Button>
    </article>
  );
}
