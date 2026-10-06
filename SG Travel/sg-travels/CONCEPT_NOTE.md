# Window Seat: a concept note

**SG Travels, UI/UX assignment: "Rethink travel discovery"**

## What it is

The whole experience is an aircraft window seat. The homepage opens on a closed window shade. You pull it up, and what you see outside depends on how you want your holiday to feel. Three dials sit beside the window: **Zen to Wild**, **Romantic to Adventurous**, **Luxury to Raw**. Move them, and the landscape outside drifts to a new place: Mt Fuji behind a torii in a lake, the aurora over a glass igloo, the Matterhorn above a chalet, elephants under Kilimanjaro.

That is the one crazy idea. Everything else on the site is quiet so this can be loud.

## Why it exists

Most people who want a holiday haven't chosen a destination yet. A search bar asks the hardest question first ("Where?") and travel sites answer with a grid of identical tiles. But the moment people *start* wanting to travel is usually a feeling: "I need somewhere slow and beautiful", "I want something wild this year". The window seat starts there.

The metaphor is also familiar and emotional for this audience. For most Indian travellers on an international holiday, the window seat is where the trip actually begins: the moment you look out and realise you're somewhere else. We borrow that moment and put it before the booking, not after.

It solves a real problem, not just a visual one:

- **People who don't know where to go** get somewhere to start without typing anything.
- **People who do know** still see two or three places they hadn't considered that feel the same.
- **Every recommendation explains itself** ("As zen and luxurious as you asked for", "94% match"), so it never feels like a black box or a sales pitch.

## How it works

1. **Pull the shade.** Drag it up, tap it, or use the arrow keys (it's an accessible slider). If you move a dial first, the shade opens itself, so your first action always shows its effect.
2. **Set the feeling.** Each dial runs 0 to 100. Three presets ("A quiet honeymoon", "Proper adventure", "A bit of everything") help people who don't want to fiddle. A live sentence turns the settings into words: *"Slow days, a little romance, polished stays."*
3. **The view changes.** Every 140 ms of stillness, the .NET API re-ranks all journeys. The best match fades into the window, the readout below names it and gives a match score, and the whole interface borrows that destination's colour.
4. **Board a trip.** "Show trips that feel like this" opens the 3 to 5 best matches as boarding passes (BOM to NRT, why you'll love it, duration, starting price, next departure, match score). Point at any pass and the window shows that place.
5. **Land.** On a journey page, the window opens out into a panoramic hero. The day-by-day itinerary is a flight path: a small plane follows the day you're reading.
6. **Reserve a seat.** The enquiry form fills in a boarding pass live as you type. On submit you get a reference (SGT-XXXXXX), stamped on the pass. No payment is taken; a travel designer calls back.

### The matching logic, in one paragraph

Each journey has a feeling position in a 0 to 100 cube. The traveller's dials are a point in the same cube. We score journeys by weighted distance, where dials pushed far from the middle count up to three times more than dials left near neutral. So "very zen, don't mind the rest" really does put zen trips first. Shared feelings (close, decisive, same side of the dial) become the plain-English reason on each pass.

## What happens when someone uses it

| They do | They see |
|---|---|
| Land on the page | A closed shade with "Pull up the shade" and a gentle nudge animation |
| Drag the shade up | Clouds drift past; the current best match is outside the window |
| Move a dial | The view cross-fades to the new best match; the accent colour across the site follows it; the sentence rewrites itself |
| Pick a preset | All three dials jump, the window changes in one move |
| Point at a boarding pass | That destination appears in the window |
| Open a trip | The window becomes a panoramic hero; the itinerary plane tracks their reading |
| Reserve | Their name, date and travellers print onto a boarding pass, then a reference is stamped on it |

## What we deliberately avoided

No hero search bar, no grid of destination tiles, no stock photography, no chatbot, and one primary action per screen. The cabin interior (grey-green panels, ink text, a seatbelt-sign amber for anything you can grab) stays calm so the view outside carries the emotion. Destination art is drawn in code from a palette in the content, so editors can re-theme a trip without a design release, and nothing breaks when an image CDN does.
