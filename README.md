# Putni Planer — 100% BESPLATNO

AI aplikacija za planiranje putovanja na bosanskom.

## Šta radi

Za unesenu destinaciju i datume dobijaš:
- ✈️ **Letovi** za 4 osobe (2 odrasle + 2 tinejdžera) — 3 najjeftinije opcije
- 📅 **Alternativni datumi ±3 dana** — provjera uštede
- 🎯 **15 Must-See atrakcija** sa cijenama ulaznica
- 📆 **Dan-po-dan itinerer** — atrakcije grupisane geografski (da se ne vozaš naprijed-nazad)
- 🏠 **Apartman** sa 4 kreveta, dobro ocjenjen, blizu atrakcija
- 🚆 **Javni prevoz** — cijene dnevnih/višednevnih karata
- 🌤️ **Vrijeme** sa preporukom garderobe (OpenWeatherMap za bliske datume)
- 🍴 **Hrana u blizini smještaja** — marketi, fast food, restorani
- 🗺️ **Interaktivna mapa** sa svim tačkama (OpenStreetMap)
- 🛂 **Viza za BiH pasoš** — zahtjevi, dokumenti, vrijeme obrade
- 🌍 **Globalni lanci hrane** u blizini destinacije
- 🚨 **Hitni brojevi + ambasada BiH**
- 💰 **Ukupni budžet**
- 📄 **Export u PDF** (browser print)

## Stack — sve besplatno

| Dio | Servis | Cijena |
|---|---|---|
| Frontend hosting | Cloudflare Pages | 🟢 Besplatno (unlimited) |
| Backend | Cloudflare Pages Functions | 🟢 100k poziva/dan besplatno |
| Letovi + hoteli | Amadeus Self-Service | Zavisi od plana / test okruženja |
| Prognoza | Open-Meteo | 🟢 Besplatno |
| Mapa | OpenStreetMap + Leaflet | 🟢 Besplatno, bez ključa |
| **UKUPNO** | | **0 EUR / mjesec** |

## 1. Dobavi API ključeve (besplatno)

**Amadeus (za live letove i smještaj):**
1. Idi na https://developers.amadeus.com/
2. Kreiraj Self-Service aplikaciju
3. Kopiraj `AMADEUS_CLIENT_ID` i `AMADEUS_CLIENT_SECRET`

## 2. Lokalno pokretanje

```bash
npm install
cp .dev.vars.example .dev.vars
# Uredi .dev.vars i dodaj ključeve
npm run build
npx wrangler pages dev dist --compatibility-date=2024-01-01
```

Otvori `http://localhost:8788`.

## 3. GitHub + Cloudflare deploy

```bash
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/TVOJ_USER/putni-planer.git
git push -u origin main
```

Na https://dash.cloudflare.com:
1. **Workers & Pages** → **Create** → **Pages** → **Connect to Git**
2. Odaberi repo
3. Build settings:
   - Build command: `npm run build`
   - Output directory: `dist`
4. Nakon deploya → **Settings** → **Environment variables** → dodaj:
   - `AMADEUS_CLIENT_ID` = tvoj ključ
   - `AMADEUS_CLIENT_SECRET` = tvoj ključ
5. Retry deployment.

`functions/` folder Cloudflare automatski servira kao `/api/*`.

## 4. Struktura projekta

```
travel-app/
├── functions/api/plan.js   # Backend - Gemini + OpenWeatherMap
├── src/
│   ├── App.jsx             # UI komponente
│   ├── MapView.jsx         # Leaflet mapa
│   ├── main.jsx
│   └── index.css           # Tailwind + print CSS
├── public/favicon.svg
├── index.html
├── package.json
└── vite.config.js
```

## 5. Rate limitovi

Gemini free tier: ~15 zahtjeva/min, 1500/dan. Za privatnu porodičnu upotrebu — više nego dovoljno. Jedan zahtjev = jedno planiranje (ne po kartici).

Ako te dostignu limiti, postavi `GEMINI_MODEL=gemini-2.0-flash` koji ima veći besplatan limit.

## 6. PDF Export

Klik na **📄 Export PDF** u headeru. Koristi browser print (`Cmd/Ctrl + P`) sa print-CSS stilovima — nema dodatnih biblioteka. Interaktivna mapa se sakriva u PDF verziji (print ne podržava dobro Leaflet canvas).

## Napomena

Sve cijene i podaci dolaze iz AI web pretrage u trenutku upita. **Uvijek duplo provjeri** prije stvarne rezervacije — letovi i smještaj se mijenjaju iz minute u minutu.
