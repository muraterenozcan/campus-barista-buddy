import { useCallback, useState } from "react";
import { toast } from "sonner";

import { leiteStimmungAusAusdruck } from "@/lib/gesichtsausdruck";
import type { Stimmung } from "@/lib/vorschlag";

let modelleLadenPromise: Promise<void> | null = null;

/** Lädt die beiden benötigten face-api.js-Modelle einmalig aus /public/models. */
function ladeModelle() {
  if (!modelleLadenPromise) {
    modelleLadenPromise = import("face-api.js")
      .then((faceapi) =>
        Promise.all([
          faceapi.nets.tinyFaceDetector.loadFromUri("/models"),
          faceapi.nets.faceExpressionNet.loadFromUri("/models"),
        ]),
      )
      .then(() => undefined)
      .catch((fehler: unknown) => {
        modelleLadenPromise = null;
        throw fehler;
      });
  }
  return modelleLadenPromise;
}

/**
 * Steuert den kompletten Ablauf der Gesichtsausdruck-Erkennung: Einwilligungsdialog,
 * einmalige Bildaufnahme, Auswertung komplett im Browser (face-api.js) und
 * sofortiges Verwerfen von Bild und Kamerastream. Es wird nie ein Bild gespeichert
 * oder übertragen.
 */
export function useGesichtsausdruck(onStimmungErkannt: (stimmung: Stimmung) => void) {
  const [dialogOffen, setDialogOffen] = useState(false);
  const [wertetAus, setWertetAus] = useState(false);

  const oeffneDialog = useCallback(() => setDialogOffen(true), []);
  const schliesseDialog = useCallback(() => setDialogOffen(false), []);

  const kameraErlauben = useCallback(async () => {
    setDialogOffen(false);

    if (!navigator.mediaDevices?.getUserMedia) {
      toast("Kamera wird von diesem Browser nicht unterstützt. Nutze gern die Buttons.");
      return;
    }

    setWertetAus(true);
    let stream: MediaStream | null = null;
    const video = document.createElement("video");

    try {
      const faceapiPromise = import("face-api.js");
      const modellePromise = ladeModelle();
      stream = await navigator.mediaDevices.getUserMedia({ video: true });
      const [faceapi] = await Promise.all([faceapiPromise, modellePromise]);

      video.muted = true;
      video.playsInline = true;
      video.srcObject = stream;
      await video.play();
      if (video.readyState < 2) {
        await new Promise<void>((resolve) => {
          video.onloadeddata = () => resolve();
        });
      }

      const ergebnis = await faceapi
        .detectSingleFace(video, new faceapi.TinyFaceDetectorOptions())
        .withFaceExpressions();

      if (!ergebnis) {
        toast("Es konnte kein Gesicht erkannt werden. Nutze gern die Buttons.");
        return;
      }

      const stimmung = leiteStimmungAusAusdruck(ergebnis.expressions);
      if (!stimmung) {
        toast(
          "Die Auswertung war nicht eindeutig – der Vorschlag entsteht aus Uhrzeit, Wetter und Bestand.",
        );
        return;
      }

      onStimmungErkannt(stimmung);
    } catch (fehler) {
      if (fehler instanceof DOMException && fehler.name === "NotAllowedError") {
        toast("Kamerazugriff wurde verweigert. Du kannst stattdessen die Buttons nutzen.");
      } else {
        toast("Gesichtsauswertung ist gerade nicht verfügbar. Nutze stattdessen die Buttons.");
      }
    } finally {
      stream?.getTracks().forEach((spur) => spur.stop());
      video.srcObject = null;
      setWertetAus(false);
    }
  }, [onStimmungErkannt]);

  return { dialogOffen, wertetAus, oeffneDialog, schliesseDialog, kameraErlauben };
}
