import { Camera, Loader2, Mic, X } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { useGesichtsausdruck } from "@/hooks/use-gesichtsausdruck";
import { useSpeechRecognition } from "@/hooks/use-speech-recognition";
import { cn } from "@/lib/utils";
import type { Stimmung } from "@/lib/vorschlag";

const stimmungen: { id: Stimmung; label: string }[] = [
  { id: "muede", label: "Müde" },
  { id: "gestresst", label: "Gestresst" },
  { id: "gut-drauf", label: "Gut drauf" },
];

const stimmungsLabels: Record<Stimmung, string> = {
  muede: "Müde",
  gestresst: "Gestresst",
  "gut-drauf": "Gut drauf",
  neutral: "Neutral",
};

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
  const {
    unterstuetzt: mikrofonUnterstuetzt,
    hoertZu,
    start: startHoeren,
    stop: stopHoeren,
  } = useSpeechRecognition(onTextChange);
  const { dialogOffen, wertetAus, oeffneDialog, schliesseDialog, kameraErlauben } =
    useGesichtsausdruck(onStimmungChange);

  return (
    <section className="mt-8">
      <h2 className="ueberschrift text-sm">Wie geht&apos;s dir gerade?</h2>

      {stimmung && (
        <Badge
          variant="secondary"
          className="mt-3 gap-1 border-haw-soft bg-haw-soft/30 text-haw-primary"
        >
          {stimmungsLabels[stimmung]}
          <button
            type="button"
            onClick={() => onStimmungChange(null)}
            aria-label="Stimmung entfernen"
            className="cursor-pointer rounded-full hover:text-destructive"
          >
            <X className="size-3" />
          </button>
        </Badge>
      )}

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
          disabled={wertetAus}
          onClick={oeffneDialog}
          className="h-11 border-haw-soft text-haw-primary hover:bg-haw-soft/20"
        >
          {wertetAus ? <Loader2 className="size-4 animate-spin" /> : <Camera className="size-4" />}
          {wertetAus ? "Wird ausgewertet …" : "Gesichtsausdruck"}
        </Button>
      </div>

      <Dialog open={dialogOffen} onOpenChange={(offen) => !offen && schliesseDialog()}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Gesichtsausdruck auswerten?</DialogTitle>
            <DialogDescription>
              Das Bild wird ausschließlich auf deinem Gerät ausgewertet. Es wird nicht gespeichert
              und nicht übertragen. Ausgewertet wird nur der Gesichtsausdruck, es findet keine
              Gesichtserkennung statt.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={schliesseDialog}>
              Lieber die Buttons nutzen
            </Button>
            <Button
              type="button"
              onClick={kameraErlauben}
              className="bg-haw-primary text-primary-foreground hover:bg-haw-primary/90"
            >
              Kamera erlauben
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

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
