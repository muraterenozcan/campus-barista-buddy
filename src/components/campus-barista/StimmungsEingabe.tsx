import { Camera, Mic } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useSpeechRecognition } from "@/hooks/use-speech-recognition";
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
  const {
    unterstuetzt: mikrofonUnterstuetzt,
    hoertZu,
    start: startHoeren,
    stop: stopHoeren,
  } = useSpeechRecognition(onTextChange);

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
        {mikrofonUnterstuetzt ? (
          <Button
            type="button"
            variant="outline"
            aria-pressed={hoertZu}
            onClick={hoertZu ? stopHoeren : startHoeren}
            style={hoertZu ? { backgroundColor: "#0098D5", borderColor: "#0098D5" } : undefined}
            className={cn(
              "h-11 border-haw-soft text-haw-primary hover:bg-haw-soft/20",
              hoertZu && "animate-pulse text-white hover:text-white",
            )}
          >
            <Mic className="size-4" />
            {hoertZu ? "Ich höre zu..." : "Sprechen"}
          </Button>
        ) : (
          <p className="flex h-11 items-center justify-center rounded-md border border-dashed border-haw-soft px-2 text-center text-[11px] leading-tight text-muted-foreground">
            Spracheingabe wird von diesem Browser nicht unterstützt. Bitte Text eingeben.
          </p>
        )}
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
