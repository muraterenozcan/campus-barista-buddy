import { useState } from "react";

import { Button } from "@/components/ui/button";
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
      <p className="mt-2 text-sm leading-relaxed text-foreground/80">{begruendung}</p>

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