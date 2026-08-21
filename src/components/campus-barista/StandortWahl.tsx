import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export type StandortId = "berliner-tor" | "bergedorf" | "tum";

export const standorte: Record<StandortId, { name: string; lat: number; lon: number }> = {
  "berliner-tor": { name: "HAW Berliner Tor", lat: 53.557, lon: 10.023 },
  bergedorf: { name: "HAW Bergedorf", lat: 53.489, lon: 10.222 },
  tum: { name: "TU München", lat: 48.149, lon: 11.568 },
};

export function StandortWahl({
  wert,
  onChange,
}: {
  wert: StandortId;
  onChange: (wert: StandortId) => void;
}) {
  return (
    <div className="mt-6">
      <label className="ueberschrift text-xs" htmlFor="standort">
        Standort
      </label>
      <Select value={wert} onValueChange={(v) => onChange(v as StandortId)}>
        <SelectTrigger id="standort" className="mt-2 h-9 w-full max-w-xs border-haw-soft text-sm">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {Object.entries(standorte).map(([id, s]) => (
            <SelectItem key={id} value={id}>
              {s.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
