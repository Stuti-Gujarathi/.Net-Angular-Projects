# AeroTrip ✈️

A full-stack flight search, booking and management product built with **ASP.NET Core 8** and **Angular 19**.

Search direct and one-stop flights across 14 airports and 6 airlines, compare fares on a 7-day calendar, book with add-ons and coupons, pay with card / UPI / net banking, get a boarding-pass e-ticket, and cancel with a transparent refund. Admins run the whole operation from a separate console.

---

## 1. Quick start

### Prerequisites

| Tool | Version | Check |
|------|---------|-------|
| .NET SDK | **8.0** or newer | `dotnet --version` |
| Node.js | **18.19+, 20.11+ or 22** | `node -v` |
| npm | 9+ | `npm -v` |

> The API has **zero NuGet packages**, so there is nothing to restore beyond the .NET SDK itself.

### Run it (two terminals)

**Terminal 1 — API**

```bash
cd backend/AeroTrip.Api
dotnet run
```

API is up at **http://localhost:5080**. Open it in a browser to see every endpoint and who can call it.

**Terminal 2 — Web app**

```bash
cd frontend/aerotrip-web
npm install      # first time only, takes ~1 minute
npm start
```

The app opens at **http://localhost:4200**.

### Or start both from one terminal

- **Windows (PowerShell):**
  `Start-Process powershell -ArgumentList '-NoExit','-Command','cd backend/AeroTrip.Api; dotnet run'; cd frontend/aerotrip-web; npm install; npm start`
- **macOS / Linux:**
  `(cd backend/AeroTrip.Api && dotnet run) & (cd frontend/aerotrip-web && npm install && npm start)`

### Opening in an IDE

- **Visual Studio / Rider:** open `backend/AeroTrip.sln` and press Run.
- **VS Code:** open the `aerotrip` folder. `backend/AeroTrip.Api/AeroTrip.Api.http` has ready-made API calls for the REST Client extension.

---

## 2. Demo accounts

Data lives **in memory**. Passwords are hashed with PBKDF2 at startup. Everything resets when the API restarts.

| Role | Email | Password | Lands on |
|------|-------|----------|----------|
| **Admin** | `admin@aerotrip.com` | `Admin@123` | `/admin` console |
| **User** | `riya@aerotrip.com` | `User@123` | `/account` dashboard |
| **User** | `arjun@aerotrip.com` | `User@123` | `/account` dashboard |

The login page lists these accounts — click one to fill the form. You can also register a new user.

Eight more background travellers (password `User@123`) exist so the admin dashboard has about three weeks of realistic booking history on first run.

---

## 3. Test payments

The payment gateway is simulated but validates like a real one (Luhn check, expiry date, UPI handle format).

| Method | Use | Result |
|--------|-----|--------|
| Card | `4111 1111 1111 1111`, any future expiry (e.g. `12/29`), any CVV | ✅ Succeeds |
| Card | `4000 0000 0000 0002` | ❌ Bank declines |
| Card | Any number failing the Luhn check | ❌ "Card number isn't valid" |
| UPI | `anything@okaxis` | ✅ Succeeds |
| UPI | `fail@okaxis` (any ID starting with "fail") | ❌ Declined |
| Net banking | HDFC, ICICI, SBI, Axis or Kotak | ✅ Succeeds |

The payment screen has a **Test payment details** panel that fills these in for you.

---

## 4. Roles and what they can do

| | Guest | User | Admin |
|---|:---:|:---:|:---:|
| Search flights, fare calendar, offers | ✅ | ✅ | ✅ |
| Book, pay, e-ticket | Asked to log in, then returned to the same booking | ✅ | ✅ |
| Dashboard, my trips, cancel and refund, profile | — | ✅ | — |
| Admin console (stats, bookings, flights, offers, users) | — | Blocked (403) | ✅ |

Access is enforced **in both places**:

- **API:** `[Authorize]` / `[Authorize(Roles = "Admin")]`.
- **Angular:** `authGuard`, `adminGuard` and `guestGuard`.

### The booking flow

1. **Search** `/flights` — open to guests.
2. **Book now** goes to `/booking/:id`. The guard sends guests to `/login?returnUrl=/booking/...`.
3. **After login** you land back on the same booking page with your flight still selected.
4. **Review page:** travellers, contact, add-ons, seat preference, coupon. The fare is re-quoted live by the server.
5. **Continue to payment** creates the booking and **holds the seats for 15 minutes** (a countdown is shown).
6. **Payment:** card, UPI or net banking. On success, seats are assigned and a PNR is issued.
7. **E-ticket:** one boarding pass per flight. You can print it or save it as a PDF, and cancel with the refund shown upfront.

---

## 5. Features

### For travellers

- **Search:** non-stop and **one-stop connecting itineraries**. Connections need 75 minutes to 10 hours, and can continue to the next day.
- **Correct local times for international flights.** DEL → LHR shows the London arrival time, with a +1 day marker when needed.
- **7-day fare calendar** with the cheapest day highlighted.
- **Filters:**
  - Stops
  - Departure time of day
  - Airlines, with the lowest fare shown for each
  - Maximum price
  - Refundable fares only
- **Sort tabs:** Best, Cheapest, Fastest, Earliest. Each tab shows its top fare and duration.
- **Flight details:** segment timeline, aircraft, baggage, meals and layover warnings.
- **Dynamic pricing** modelled on Indian carriers:
  - Fares rise as departure approaches.
  - Fares rise as the cabin fills.
  - Friday and Sunday departures cost a little more.
  - Red-eye departures cost a little less.
  - Connecting itineraries are discounted against the sum of their legs.
- **Taxes:** GST at 5% (economy and premium) or 12% (business), airport fees per flight, and a convenience fee.
- **Add-ons:**
  - Extra 15 kg baggage
  - Meals (hidden when the airline already includes one)
  - Travel insurance
  - Flexible ticket (full refund on cancellation)
  - Window or aisle seat preference
- **Coupons** with real rules: minimum spend, cabin-only, airline-only, international-only, usage limits and validity dates. Each failure gives a clear message, such as "Add ₹1,200 more to use this code".
- **Seat hold:** seats are reserved while you pay and released automatically after 15 minutes by a background worker.
- **Cancellation with refund preview:**
  - More than 72 hours before departure: ₹999 per passenger per flight is deducted.
  - 24 to 72 hours: 50% of the base fare plus all taxes are refunded.
  - Less than 24 hours: only taxes are refunded.
  - Flexible ticket: full refund.
- **Dashboard:**
  - Upcoming trips, trips completed and total spent
  - AeroMiles (5 per ₹100 spent)
  - Next-trip boarding pass with a countdown
  - Trip history filters
  - Profile and password change

### For admins

- **Overview:**
  - Net revenue, with the % change vs the previous 7 days
  - Bookings
  - Load factor for the next 7 days
  - Average booking value
  - Discounts given and refunds issued
  - Interactive 14-day revenue chart
  - Booking-status donut
  - Top routes and airline share
  - Latest bookings
- **Bookings:**
  - Search by PNR, name, email, airport or flight number
  - Filter by status, with pagination
  - Detail drawer
  - Cancel with full refund
- **Flights:**
  - Every scheduled flight, with operating days, fares per cabin and seats
  - Add or edit flights in a drawer form
  - Suspend or resume a flight, which removes it from or returns it to search instantly
- **Offers and discounts:**
  - Create, edit, pause and delete coupons
  - Usage progress bars
  - Card colour themes
- **Users:** see bookings and spend per user. Deactivating a user blocks them immediately, even if their login token hasn't expired.

---

## 6. Project structure

```
aerotrip/
├── backend/
│   ├── AeroTrip.sln
│   └── AeroTrip.Api/
│       ├── Controllers/        Auth, Catalog, Flights, Offers, Bookings, Payments, Admin
│       ├── DTOs/               Request/response contracts with validation attributes
│       ├── Models/             Domain entities: User, Airport, Airline, FlightSchedule,
│       │                       FlightInstance, Booking, Payment, Offer, enums
│       ├── Repositories/       Interfaces + in-memory implementations
│       ├── Services/           Auth, Flight search, Pricing, Offers, Booking, Payment,
│       │                       FlightSchedule, Admin, HoldExpiryWorker, Mappers, SeatAllocator
│       ├── Data/               InMemoryDataStore, SeedData (network, airlines, offers),
│       │                       DataSeeder (demo users + booking history)
│       ├── Infrastructure/     JWT (HS256) token service + auth handler, PBKDF2 hashing,
│       │                       global exception → ProblemDetails, IST clock, ₹ formatting
│       ├── Program.cs
│       └── AeroTrip.Api.http   Ready-made API requests
└── frontend/aerotrip-web/
    └── src/app/
        ├── core/               models, services (auth, flight, booking, catalog, admin, toast),
        │                       interceptors (JWT + error toasts), guards (auth/admin/guest)
        ├── shared/             icon set, airport combobox, search form, drawer/modal, toasts, pipes
        ├── layout/             navbar, footer
        └── pages/
            ├── home/           hero with animated route map, popular routes, offers
            ├── flights/        results page + boarding-pass flight card
            ├── auth/           login, register
            ├── booking/        review, payment, ticket/confirmation
            ├── account/        user dashboard, my trips, profile
            └── admin/          console shell, overview, bookings, flights, offers, users
```

**Request path:** Controller → Service → Repository → `InMemoryDataStore`. Controllers stay thin; all business rules live in services.

### Moving to a real database

Replace the six classes in `Repositories/` with Entity Framework Core implementations of the same interfaces, then change their registrations in `Program.cs`. Services, controllers and the Angular app don't change.

---

## 7. API reference

Base URL `http://localhost:5080/api`. Enums are sent as strings (`"Economy"`, `"Confirmed"`). Errors are returned as RFC 7807 problem details with a readable `detail` field.

| Method | Route | Access |
|--------|-------|--------|
| POST | `/auth/register`, `/auth/login` | Guest |
| GET / PUT | `/auth/me` | User |
| POST | `/auth/change-password` | User |
| GET | `/catalog/airports`, `/catalog/airlines`, `/catalog/popular-routes` | Guest |
| GET | `/flights/search?from&to&date&passengers&cabin` | Guest |
| GET | `/flights/itineraries/{id}?cabin&passengers` | Guest |
| GET | `/flights/fare-calendar?from&to&start&days&cabin` | Guest |
| GET | `/offers` | Guest |
| POST | `/bookings/quote` | User |
| POST | `/bookings` | User |
| GET | `/bookings/my`, `/bookings/{id}` | User |
| GET | `/bookings/{id}/cancellation-quote` | User |
| POST | `/bookings/{id}/cancel` | User |
| POST | `/payments` | User |
| GET | `/admin/stats` | Admin |
| GET | `/admin/bookings?status&search&page&pageSize`, `/admin/bookings/{id}` | Admin |
| POST | `/admin/bookings/{id}/cancel` | Admin |
| GET / POST | `/admin/flights` | Admin |
| PUT | `/admin/flights/{id}` | Admin |
| PATCH | `/admin/flights/{id}/status` | Admin |
| GET / POST | `/admin/offers` | Admin |
| PUT / DELETE | `/admin/offers/{id}` | Admin |
| PATCH | `/admin/offers/{id}/status` | Admin |
| GET | `/admin/users` | Admin |
| PATCH | `/admin/users/{id}/status` | Admin |

**Itinerary IDs** look like `SF101-20261215`, or `MN262-20261215_SF254-20261215` for a connection. They are generated by search.

---

## 8. Configuration

`backend/AeroTrip.Api/appsettings.json`

| Key | Default | Purpose |
|-----|---------|---------|
| `Jwt:Secret` | dev value | **Change this before deploying anywhere.** |
| `Jwt:ExpiryMinutes` | 480 | Login session length |
| `Cors:AllowedOrigins` | `http://localhost:4200` | Where the Angular app runs |
| `Booking:HoldMinutes` | 15 | Seat hold while paying |

The API port is set in `Properties/launchSettings.json` (5080). If you change it, also update `frontend/aerotrip-web/src/environments/environment.ts`.

Business times use **India Standard Time** regardless of the server's own time zone.

---

## 9. Troubleshooting

| Symptom | Fix |
|---------|-----|
| Toast says "Can't reach the AeroTrip API" | Start the backend (`dotnet run`) and check it's on port 5080. |
| "You must install or update .NET" / missing framework 8.0.0 | Already handled: the project rolls forward to any newer .NET you have (9, 10…). If you see it on an old copy, run `$env:DOTNET_ROLL_FORWARD="Major"; dotnet run`. |
| `Port 5080 is already in use` | Run `dotnet run --urls http://localhost:5090`, then update `environment.ts` to match. |
| Angular asks to share analytics, or the port is busy | `npm start -- --port 4300`, and add that origin to `Cors:AllowedOrigins`. |
| Logged out unexpectedly | The API restarted and the in-memory data was reset. Log in again with a demo account. |
| No flights for a date | A few regional flights skip one weekday. Use the fare calendar to pick a nearby date. |

### Production build

```bash
cd frontend/aerotrip-web && npm run build          # output: dist/aerotrip-web/browser
cd backend/AeroTrip.Api && dotnet publish -c Release
```

---

Crafted by **Suti Gujarati** — @codewithsuti
