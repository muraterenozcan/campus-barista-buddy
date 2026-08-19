import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export type StandortId = "berliner-tor" | "bergedorf" | "tum";

export const standorte: Record<
  StandortId,
  { name: string; temperatur: string }
> = {
  "berliner-tor": { name: "HAW Berliner Tor", temperatur: "18 °C" },
  bergedorf: { name: "HAW Bergedorf", temperatur: "17 °C" },
  tum: { name: "TU München", temperatur: "21 °C" },
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
        <SelectTrigger
          id="standort"
          className="mt-2 h-9 w-full max-w-xs border-haw-soft text-sm"
        >
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