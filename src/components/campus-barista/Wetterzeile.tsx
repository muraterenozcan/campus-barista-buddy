import { useEffect, useState } from "react";

export function Wetterzeile({
  ort,
  temperatur,
}: {
  ort: string;
  temperatur: string;
}) {
  const [uhrzeit, setUhrzeit] = useState("");

  useEffect(() => {
    const aktualisieren = () =>
      setUhrzeit(
        new Date().toLocaleTimeString("de-DE", {
          hour: "2-digit",
          minute: "2-digit",
        }),
      );
    aktualisieren();
    const timer = window.setInterval(aktualisieren, 30_000);
    return () => window.clearInterval(timer);
  }, []);

  return (
    <p className="mt-3 border-b border-haw-soft/60 pb-4 text-xs text-muted-foreground">
      {ort} · {temperatur} · {uhrzeit || "--:--"} Uhr
    </p>
  );
}