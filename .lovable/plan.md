# Campus Barista – Plan

Eine mobile-first Web-App für die HAW Hamburg: Nutzerin beschreibt ihre Situation, die App schlägt genau ein Getränk vor. Oberfläche komplett auf Deutsch.

## Startseite (eine Seite, von oben nach unten)

1. Kopfbereich: "CAMPUS BARISTA" (Martel Heavy, #144E9B), darunter klein "Dein Getränkevorschlag am Campus"
2. Kleines Standort-Dropdown: HAW Berliner Tor (vorausgewählt), HAW Bergedorf, TU München
3. Dezente Wetterzeile: Ort, Temperatur, Uhrzeit – feste Beispielwerte, passend zum gewählten Standort
4. Eingabebereich "WIE GEHT'S DIR GERADE?"
   - Mehrzeiliges Textfeld mit Platzhalter "Zum Beispiel: müde, hatte drei Vorlesungen hintereinander"
   - Button "Sprechen" (Mikrofon-Icon, ohne Funktion, sichtbar deaktiviert wirkend aber anklickbar-neutral)
   - Button "Gesichtsausdruck" (Kamera-Icon, ohne Funktion)
   - Drei Stimmungs-Buttons nebeneinander: Müde, Gestresst, Gut drauf (auswählbar, aktiv in #144E9B)
5. Hauptbutton "Vorschlag holen", volle Breite, deaktiviert solange kein Text und keine Stimmung gewählt ist
6. Ergebnisbereich (erst nach Klick sichtbar)

## Ergebniskarte

- Quadratisches, abgerundetes Getränkebild
- Getränkename groß in Martel Heavy
- Begründung in zwei Sätzen (aus Beschreibung + gewählter Stimmung zusammengesetzt)
- Dezente Zeile: "Verfügbar ab 15:36 – die Maschine ist bis dahin belegt."
- Kleiner Button "Anderen Vorschlag"

## Zustände

- Leerzustand: kurzer Hinweistext ("Beschreibe kurz, wie du dich fühlst …") statt leerer Fläche
- Ladezustand: graue Platzhalterflächen (Skeleton) in Form der Ergebniskarte
- Fehlerzustand: freundliche deutsche Meldung mit Button "Erneut versuchen"
- Hauptbutton deaktiviert ohne Eingabe

## Verhalten

Klick auf "Vorschlag holen" → kurze simulierte Wartezeit (Ladezustand) → zufälliges Getränk mit `verfuegbar: true` aus `src/data/getraenke.json`. "Anderen Vorschlag" wählt ein anderes verfügbares Getränk. Keine KI-Anbindung.

## Design

- #144E9B (Primär: Buttons, Überschriften, aktive Elemente), #0098D5 (Akzent: Links, Hervorhebungen), #9DC0DF (dezente Flächen, Trennlinien), weißer Hintergrund, viel Weißraum
- Google Fonts per `<link>` im Root-Route-Head: Open Sans (300 Light, 700 Bold) und Martel (900 Heavy)
- Überschriften: Open Sans Bold, Versalien, #144E9B; große Überschriften/Getränkename in Martel Heavy
- Alle Texte linksbündig, abgerundete Karten mit dezentem Schatten, eine Hauptaktion pro Bildschirm
- Kein HAW-Logo

## Technische Details

- `src/styles.css`: Design-Tokens (`--haw-primary`, `--haw-accent`, `--haw-soft`, Font-Tokens) in oklch, Registrierung in `@theme inline`; Fonts über `src/routes/__root.tsx` head links
- `src/data/getraenke.json`: neue Datei mit Feldern id, name, beschreibung, preis_cent, zubereitung_sekunden, koffein, kategorie, bild, verfuegbar. Ich lege eine kleine Beispielliste an, die du anschließend durch deinen Inhalt ersetzen kannst (gleiches Format).
- Bilder werden aus `public/images/` erwartet; fehlt ein Bild, zeigt die Karte eine dezente Platzhalterfläche in #9DC0DF
- `src/routes/index.tsx` wird zur Startseite umgebaut (Placeholder entfernt), mit eigenem `head()` (Titel, Beschreibung, og/twitter auf Deutsch)
- Komponenten unter `src/components/campus-barista/`: `Kopfbereich`, `StandortWahl`, `Wetterzeile`, `StimmungsEingabe`, `ErgebnisKarte`, `ErgebnisSkeleton`, `FehlerHinweis`
- Zustandslogik lokal in der Route (`useState`), Vorschlagsauswahl in `src/lib/vorschlag.ts`
- Kein Backend nötig