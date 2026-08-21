# Campus Barista

Erstelle eine Web-Anwendung namens "Campus Barista" für die HAW Hamburg. Oberflächensprache: durchgehend Deutsch. Mobile-first, muss auf dem Smartphone einwandfrei aussehen.

Zweck: Die Person beschreibt ihre aktuelle Situation, das System schlägt genau ein Getränk vor.

Aufbau der Startseite, von oben nach unten:

Kopfbereich: "Campus Barista", darunter kleiner "Dein Getränkevorschlag am Campus"

Standortauswahl als kleines Dropdown: "HAW Berliner Tor", "HAW Bergedorf", "TU München". Vorauswahl: HAW Berliner Tor

Wetterzeile, dezent: Ort, Temperatur, Uhrzeit. Vorerst feste Beispielwerte

Eingabebereich mit der Überschrift "Wie geht's dir gerade?" und vier gleichwertigen Wegen:

Ein mehrzeiliges Textfeld, Platzhalter "Zum Beispiel: müde, hatte drei Vorlesungen hintereinander"

Ein Mikrofon-Button "Sprechen" (vorerst nur sichtbar, ohne Funktion)

Ein Kamera-Button "Gesichtsausdruck" (vorerst nur sichtbar, ohne Funktion)

Drei Auswahl-Buttons nebeneinander: "Müde", "Gestresst", "Gut drauf"

Hauptbutton "Vorschlag holen", volle Breite

Ergebnisbereich, erscheint erst nach dem Klick

Ergebniskarte:

Bild des Getränks, quadratisch, abgerundet

Name des Getränks, groß

Begründung in zwei Sätzen

Eine dezente Zeile darunter: "Verfügbar ab 15:36 – die Maschine ist bis dahin belegt."

Ein kleiner Button "Anderen Vorschlag"

Daten: Lege src/data/getraenke.json an. Ich füge den Inhalt gleich ein. Felder: id, name, beschreibung, preis_cent, zubereitung_sekunden, koffein, kategorie, bild, verfuegbar. Bilder liegen später in public/images/.

Verhalten vorerst: Beim Klick auf "Vorschlag holen" wird zufällig ein Getränk mit verfuegbar: true gewählt und in der Ergebniskarte angezeigt. Noch keine KI-Anbindung.

Zustände, bitte alle umsetzen:

Ladezustand: graue Platzhalterflächen, kein leerer Bildschirm

Leerzustand vor der ersten Eingabe: kurzer Hinweistext statt leerer Fläche

Fehlerzustand: freundliche deutsche Meldung mit Wiederholen-Button

Der Hauptbutton ist deaktiviert, solange keine Eingabe vorliegt

Corporate Design der HAW Hamburg, verbindlich:

Hauptfarbe #144E9B für Buttons, Überschriften und aktive Elemente

Akzentfarbe #0098D5 für Links und Hervorhebungen

#9DC0DF für dezente Flächen und Trennlinien

Hintergrund weiß, sehr viel Weißraum

Schriften als Google Fonts: "Open Sans" für Fließtext im Schnitt Light, "Martel" im Schnitt Heavy für die großen Überschriften und den Getränkenamen

Überschriften in Open Sans Bold werden ausschließlich in Versalien und in #144E9B gesetzt

Alle Texte linksbündig. Kein Blocksatz, keine zentrierte Ausrichtung

Abgerundete Karten mit dezentem Schatten, pro Bildschirm eine klare Hauptaktion

Verwende kein Logo der HAW Hamburg.

Erkläre mir am Ende in einfachen Worten, welche Dateien du angelegt hast.

This project was built with [Lovable](https://lovable.dev).

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/52148484-b874-4b38-812c-edf2dcb3ca92).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
