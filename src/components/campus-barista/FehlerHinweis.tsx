import { Button } from "@/components/ui/button";

export function FehlerHinweis({ onWiederholen }: { onWiederholen: () => void }) {
  return (
    <div className="rounded-2xl border border-haw-soft/60 bg-card p-5 shadow-sm">
      <h3 className="ueberschrift text-sm">Das hat gerade nicht geklappt</h3>
      <p className="mt-2 text-sm text-foreground/80">
        Wir konnten dir leider keinen Vorschlag holen. Versuch es einfach noch einmal.
      </p>
      <Button
        type="button"
        onClick={onWiederholen}
        size="sm"
        className="mt-4 bg-haw-primary text-primary-foreground hover:bg-haw-primary/90"
      >
        Erneut versuchen
      </Button>
    </div>
  );
}