# SG Travels: Window Seat

A travel discovery experience for SG Travels where you choose a holiday by **feeling**, not by destination. You pull up an aircraft window shade, set three dials (Zen to Wild, Romantic to Adventurous, Luxury to Raw) and the view outside changes to the trip that fits.

- **Backend:** ASP.NET Core Web API on .NET 10 (clean architecture, unit tested)
- **Frontend:** Angular 21 (standalone components, signals, zoneless)
- **Concept note:** [`CONCEPT_NOTE.md`](CONCEPT_NOTE.md) explains what the differentiator is, why it exists, how it works and what happens when someone uses it.

---

## 1. What you need installed

| Tool | Version | Check with |
|---|---|---|
| .NET SDK | **10.0** or newer | `dotnet --version` |
| Node.js | **20.19+, 22.12+ or 24+** | `node -v` |
| npm | comes with Node | `npm -v` |

Downloads: .NET from <https://dotnet.microsoft.com/download>, Node.js (LTS) from <https://nodejs.org>.

Only have .NET 8? See [Using .NET 8 instead](#using-net-8-instead).

---

## 2. Run it locally (two terminals)

### Terminal 1: start the API

```bash
cd backend
dotnet restore
dotnet run --project src/SGTravels.Api
```

Wait until you see `Now listening on: http://localhost:5080`.

- API explorer (Swagger): <http://localhost:5080/swagger>
- Health check: <http://localhost:5080/health> should say `Healthy`

### Terminal 2: start the website

```bash
cd frontend
npm install
npm start
```

Open **<http://localhost:4200>**.

The Angular dev server forwards every `/api` call to `http://localhost:5080` (see `frontend/proxy.conf.json`), so there's nothing else to configure. Keep both terminals running.

### Run the backend tests

```bash
cd backend
dotnet test
```

23 tests cover the matching engine, discovery ranking and enquiry rules.

---

## 3. Or run everything with Docker (one command)

Needs Docker Desktop (or Docker Engine with Compose).

```bash
docker compose up --build
```

Open **<http://localhost:8080>**. Nginx serves the Angular build and proxies `/api` to the .NET container. Stop with `Ctrl+C`, clean up with `docker compose down`.

---

## 4. Try the experience

1. **Home** (`/`): drag the window shade up, or just move a dial and it opens itself. Watch the view, the match readout and the site's accent colour change. Try the presets.
2. **Show trips that feel like this** opens **Discover** (`/discover`): 3 to 5 boarding passes, best match first. Point at a pass to see it in the window. The URL holds your feeling, so it's shareable.
3. **Explore this trip** opens **Journey detail** (`/journeys/japan-koyo-trails`): panoramic hero, highlights, a day-by-day "flight path" with a plane that follows your reading, experiences, hotels, inclusions and price.
4. **Reserve a seat** opens **Reserve** (`/journeys/…/reserve`): the boarding pass fills in as you type; submit to get a `SGT-XXXXXX` reference.

All screens are responsive. Check them at phone width in your browser's device toolbar.

---

## 5. Project structure

```
sg-travels/
├── README.md                 ← you are here
├── CONCEPT_NOTE.md           ← one-page concept note (assignment deliverable)
├── docker-compose.yml
├── backend/
│   ├── SGTravels.sln
│   ├── global.json           ← pins .NET SDK 10 (rolls forward to newer)
│   ├── Directory.Build.props ← shared settings: net10.0, nullable, analyzers
│   ├── Dockerfile
│   ├── src/
│   │   ├── SGTravels.Core/            domain + application logic, zero dependencies
│   │   │   ├── Feelings/             FeelingVector, FeelingMatcher, MatchExplainer
│   │   │   ├── Journeys/             Journey model, IJourneyCatalog, JourneyService
│   │   │   ├── Discovery/            DiscoveryService (ranks 3–5 matches)
│   │   │   └── Enquiries/            EnquiryService, IEnquiryStore, references
│   │   ├── SGTravels.Infrastructure/  JSON catalogue (validated at startup), in-memory store
│   │   └── SGTravels.Api/             controllers, DTO contracts, Program.cs
│   │       ├── Data/journeys.json    ← all trip content lives here
│   │       └── SGTravels.Api.http     ← ready-made requests for VS Code / Rider / VS
│   └── tests/SGTravels.Core.Tests/    xUnit tests
└── frontend/
    ├── proxy.conf.json       ← /api → http://localhost:5080 during development
    ├── Dockerfile, nginx.conf
    └── src/app/
        ├── core/             API client, models, FeelingStore, live matching, pipes
        ├── shared/
        │   ├── window-seat/  ★ the signature interaction (shade, views, readout)
        │   ├── scene/        illustrated destination views, drawn in SVG from API palettes
        │   ├── feeling-panel/ the three dials + presets
        │   ├── boarding-pass/ discovery result card
        │   └── porthole/     tiny window thumbnail
        └── pages/            home, discover, journey, reserve, not-found
```

---

## 6. API reference

Base URL `http://localhost:5080`. Full interactive docs at `/swagger` in Development.

| Method | Path | What it does |
|---|---|---|
| GET | `/api/feelings` | The three dials (labels and questions) |
| GET | `/api/journeys?featured=true` | Journey summaries, soonest departure first |
| GET | `/api/journeys/{slug}` | Full journey: itinerary, stays, inclusions, departures |
| GET | `/api/discover?zenWild=15&romanticAdventurous=25&luxuryRaw=10&take=4` | 3–5 ranked matches with score and reason |
| POST | `/api/enquiries` | Reserve a seat (no payment); returns a reference |
| GET | `/api/enquiries/{reference}` | Confirmation details (no contact data) |
| GET | `/health` | Liveness + catalogue check |

Errors use RFC 9457 problem details; validation errors are keyed by the camelCase field name, which the form maps straight onto its inputs. Enquiries are rate limited to 5 per minute per IP.

---

## 7. Engineering notes

**How matching works.** Each journey has a position in a 0–100 "feeling cube". The traveller's dials are a point in the same cube. The score is a weighted Euclidean distance where dials pushed far from neutral weigh up to 3× more, so strong preferences dominate. Axes that are close, decisive and on the same side become the plain-English reason ("As zen and luxurious as you asked for"). See `FeelingMatcher.cs` and its tests.

**Backend.** Core has no framework dependencies and is fully unit-testable (`TimeProvider` is injected for date logic). The catalogue is plain JSON, validated on startup (unique slugs, itinerary length equals trip days, hotel nights add up), so a bad content edit stops the app with a clear message rather than showing a broken page. Swap `JsonJourneyCatalog` or `InMemoryEnquiryStore` for a CMS, database or CRM by implementing one interface each. Includes ProblemDetails, output caching on catalogue reads, per-IP rate limiting, health checks and CORS for `localhost:4200`.

**Frontend.** Signals throughout (works zoneless), lazy-loaded routes, OnPush everywhere. Dial changes are debounced and `switchMap`-ed so stale responses are dropped. Destination views are drawn in SVG from palette data in the API: no image CDN, nothing to break, and editors can re-theme a trip in JSON. Accessibility: the shade is a keyboard-operable slider, dials are native range inputs with spoken values, there's a skip link, visible focus states, and `prefers-reduced-motion` turns animation off.

**Editing content.** Change prices, dates, itineraries or add a trip in `backend/src/SGTravels.Api/Data/journeys.json` and restart the API. Available scenes for `theme.scene`: `fuji`, `alps`, `aurora`, `savanna`, `fjord`, `karst`, `adriatic`.

**Prices and hotels** are realistic sample content for the assignment, not live SG Travels inventory.

---

## 8. Troubleshooting

**The site loads but shows "Trips didn't load" or the window stays blank.** The API isn't running or isn't on port 5080. Start Terminal 1 first and check <http://localhost:5080/health>.

**`A compatible .NET SDK was not found`.** Install the .NET 10 SDK, or follow [Using .NET 8 instead](#using-net-8-instead).

**Port 5080 or 4200 is already in use.** Change `applicationUrl` in `backend/src/SGTravels.Api/Properties/launchSettings.json` and `target` in `frontend/proxy.conf.json` to match, or run `npm start -- --port 4300` for the frontend.

**`npm install` fails with an engine error.** Your Node is too old for Angular 21. Install the current Node LTS.

**Fonts look plain.** The typefaces (Gloock and Archivo) load from Google Fonts; offline, the site falls back to system fonts and still works.

**Windows note.** All commands work in PowerShell or Command Prompt as written.

---

## Using .NET 8 instead

1. In `backend/Directory.Build.props`, change `<TargetFramework>net10.0</TargetFramework>` to `net8.0`.
2. In `backend/global.json`, change `"version": "10.0.100"` to `"8.0.100"`.
3. In `backend/Dockerfile`, change both image tags from `10.0` to `8.0` (only if you use Docker).

The code uses no .NET 10-only APIs, so it builds and runs the same on .NET 8.

---
