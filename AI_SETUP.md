# KI-Auswertung der Freitextantworten

Die Quiz-App bewertet klare Treffer zuerst lokal (inkl. kleiner Tippfehler). Nur uneindeutige Freitextantworten werden serverseitig an die OpenAI Responses API geschickt. Teamnamen werden dabei nicht übertragen.

## Vercel

Im Vercel-Projekt unter **Settings → Environment Variables** setzen:

- `OPENAI_API_KEY` = dein OpenAI API-Key
- optional `OPENAI_JUDGE_MODEL` = `gpt-5.6-luna`

Danach Production neu deployen.

Der API-Key gehört **nicht** in `index.html`, JavaScript im Browser oder GitHub.

## Punkte

Pro Frage sind maximal 1000 Punkte möglich:

- falsche Antwort: 0
- richtige Antwort: 700 Basispunkte
- plus bis zu 300 Geschwindigkeitspunkte
- der Zeitbonus fällt über die 180 Sekunden linear von 300 auf 0

Damit zählt Richtigkeit deutlich stärker als bloße Geschwindigkeit.

## Freitext

Für ausgewählte Musik-/Filmfragen erscheint statt Multiple Choice ein Texteingabefeld. Exakte und naheliegende Varianten werden lokal erkannt; unklare Formulierungen werden von OpenAI semantisch geprüft.
