import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";

import { ErgebnisKarte } from "@/components/campus-barista/ErgebnisKarte";
import { ErgebnisSkeleton } from "@/components/campus-barista/ErgebnisSkeleton";
import { FehlerHinweis } from "@/components/campus-barista/FehlerHinweis";
import { Kopfbereich } from "@/components/campus-barista/Kopfbereich";
import {
  StandortWahl,
  standorte,
  type StandortId,
} from "@/components/campus-barista/StandortWahl";
import { StimmungsEingabe } from "@/components/campus-barista/StimmungsEingabe";
import { Wetterzeile } from "@/components/campus-barista/Wetterzeile";
import { Button } from "@/components/ui/button";
import {
  erstelleBegruendung,
  verfuegbarAb,
  waehleGetraenk,
  type Getraenk,
  type Stimmung,
} from "@/lib/vorschlag";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Campus Barista – Dein Getränkevorschlag am Campus" },
      {
        name: "description",
        content:
          "Beschreibe kurz, wie du dich fühlst, und Campus Barista schlägt dir genau ein passendes Getränk am Campus der HAW Hamburg vor.",
      },
      { property: "og:title", content: "Campus Barista – HAW Hamburg" },
      {
        property: "og:description",
        content: "Ein Getränkevorschlag, passend zu deiner Stimmung am Campus.",
      },
    ],
  }),
  component: Index,
});

type Vorschlag = {
  getraenk: Getraenk;
  begruendung: string;
  verfuegbarAbZeit: string;
};

type Status = "leer" | "laden" | "fertig" | "fehler";

function Index() {
  const [standort, setStandort] = useState<StandortId>("berliner-tor");
  const [text, setText] = useState("");
  const [stimmung, setStimmung] = useState<Stimmung | null>(null);
  const [status, setStatus] = useState<Status>("leer");
  const [vorschlag, setVorschlag] = useState<Vorschlag | null>(null);

  const hatEingabe = text.trim().length > 0 || stimmung !== null;

  const holeVorschlag = (ausser?: string) => {
    setStatus("laden");
    window.setTimeout(() => {
      try {
        const getraenk = waehleGetraenk(ausser);
        setVorschlag({
          getraenk,
          begruendung: erstelleBegruendung(getraenk, stimmung, text),
          verfuegbarAbZeit: verfuegbarAb(getraenk.zubereitung_sekunden),
        });
        setStatus("fertig");
      } catch {
        setVorschlag(null);
        setStatus("fehler");
      }
    }, 700);
  };

  const ort = standorte[standort];

  return (
    <main className="mx-auto min-h-screen w-full max-w-md bg-background px-5 pb-16">
      <Kopfbereich />
      <StandortWahl wert={standort} onChange={setStandort} />
      <Wetterzeile ort={ort.name} temperatur={ort.temperatur} />

      <StimmungsEingabe
        text={text}
        onTextChange={setText}
        stimmung={stimmung}
        onStimmungChange={setStimmung}
      />

      <Button
        type="button"
        disabled={!hatEingabe || status === "laden"}
        onClick={() => holeVorschlag()}
        className="mt-6 h-12 w-full bg-haw-primary text-base text-primary-foreground hover:bg-haw-primary/90"
      >
        {status === "laden" ? "Wird geholt …" : "Vorschlag holen"}
      </Button>

      <section className="mt-8">
        {status === "leer" && (
          <p className="rounded-2xl bg-haw-soft/20 p-4 text-sm text-muted-foreground">
            Beschreibe kurz, wie du dich fühlst – oder wähle eine Stimmung. Danach
            bekommst du genau einen Getränkevorschlag.
          </p>
        )}
        {status === "laden" && <ErgebnisSkeleton />}
        {status === "fehler" && <FehlerHinweis onWiederholen={() => holeVorschlag()} />}
        {status === "fertig" && vorschlag && (
          <ErgebnisKarte
            getraenk={vorschlag.getraenk}
            begruendung={vorschlag.begruendung}
            verfuegbarAbZeit={vorschlag.verfuegbarAbZeit}
            onAnderer={() => holeVorschlag(vorschlag.getraenk.id)}
          />
        )}
      </section>
    </main>
  );
}
