# Free App Swap - basisstructuur

Dit is de eerste modulaire basis voor het planetenstelsel.

## Starten

Open `index.html` rechtstreeks in de browser.

Beter: start een kleine lokale server zodat de aparte component-html's netjes geladen worden:

```bash
python -m http.server 8000
```

Ga daarna naar:

```text
http://localhost:8000
```

Op Windows kan je ook `start_server.bat` dubbelklikken.

## Structuur

```text
freeappswap/
  index.html
  css/style.css
  js/*.js
  components/*.html
  data/users.json
  data/apps.json
  assets/
```

## Login/register

Voorlopig wordt de login lokaal opgeslagen in `localStorage`.
De structuur is bewust Supabase-ready gehouden.

In Account zit een knop om de lokale users JSON te downloaden.

## Later Supabase

`data/users.json` en `data/apps.json` tonen de velden die later naar Supabase-tabellen kunnen worden vertaald.
