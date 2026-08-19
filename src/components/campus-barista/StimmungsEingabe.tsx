import { Camera, Mic } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import type { Stimmung } from "@/lib/vorschlag";

const stimmungen: { id: Stimmung; label: string }[] = [
  { id: "muede", label: "Müde" },
  { id: "gestresst", label: "Gestresst" },
  { id: "gut-drauf", label: "Gut drauf" },
];

export function StimmungsEingabe({
  text,
  onTextChange,
  stimmung,
  onStimmungChange,
}: {
  text: string;
  onTextChange: (wert: string) => void;
  stimmung: Stimmung | null;
  onStimmungChange: (wert: Stimmung | null) => void;
}) {
  const kommtGleich = () => toast("Kommt gleich");

  return (
    <section className="mt-8">
      <h2 className="ueberschrift text-sm">Wie geht&apos;s dir gerade?</h2>

      <Textarea
        value={text}
        onChange={(e) => onTextChange(e.target.value)}
        rows={3}
        className="mt-3 resize-none border-haw-soft text-sm placeholder:text-muted-foreground/70 focus-visible:ring-haw-accent"
        placeholder="Zum Beispiel: müde, hatte drei Vorlesungen hintereinander"
      />

      <div className="mt-3 grid grid-cols-2 gap-3">
        <Button
          type="button"
          variant="outline"
          onClick={kommtGleich}
          className="h-11 border-haw-soft text-haw-primary hover:bg-haw-soft/20"
        >
          <Mic className="size-4" />
          Sprechen
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={kommtGleich}
          className="h-11 border-haw-soft text-haw-primary hover:bg-haw-soft/20"
        >
          <Camera className="size-4" />
          Gesichtsausdruck
        </Button>
      </div>

      <div className="mt-3 grid grid-cols-3 gap-3">
        {stimmungen.map((s) => {
          const aktiv = stimmung === s.id;
          return (
            <Button
              key={s.id}
              type="button"
              variant="outline"
              aria-pressed={aktiv}
              onClick={() => onStimmungChange(aktiv ? null : s.id)}
              className={cn(
                "h-11 border-haw-soft text-sm text-haw-primary hover:bg-haw-soft/20",
                aktiv &&
                  "border-haw-primary bg-haw-primary text-primary-foreground hover:bg-haw-primary/90 hover:text-primary-foreground",
              )}
            >
              {s.label}
            </Button>
          );
        })}
      </div>
    </section>
  );
}