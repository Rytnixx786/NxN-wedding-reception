# Nafis & Nishat — Wedding Invitation Website

A responsive, independently hostable React + TypeScript + Vite wedding invitation website recreating the **Minimalism Dark Red** wedding invitation design from the reference recording, complete with the extracted background song (*Bismillah*), interactive envelope & invitation card preview, live `Asia/Dhaka` countdown, January 2027 calendar, `.ics` & Google Calendar export, RSVP modal (Supabase-ready with local preview fallback), and exact RAOWA Convention Hall Google Maps integration.

## Quick Start

```bash
npm install
npm run dev
```

Open `http://localhost:5173` in your browser. Append `?open=1` to skip the floating-hearts opening curtain during development.

## Production Build

```bash
npm run build
npm run preview
```

## Editing Wedding Information

All personal wedding details live in a single central configuration file:

- `src/config/wedding.ts`

From `src/config/wedding.ts` you can update:
- Couple names & family/parent details
- Invitation card wording & Arabic Bismillah
- Reception date, time, and timezone (`Asia/Dhaka`)
- Venue address, coordinates, and Google Maps / Directions links (`https://maps.app.goo.gl/FtaJgTqfoaU92XwY9`)
- Background music track path and default volume
- Optional template modules (`features.photoGallery`, `features.dressCode`, `features.weddingSchedule`, `features.guestbook`, `features.giftBox`) — disabled by default to match the recorded invitation 1:1.

## Replacing Media Assets

- `public/audio/bismillah.mp3` — Background music track
- `public/images/floral-bouquet-cutout.webp` — Floral spray overlay
- `public/images/wax-seal-cutout.webp` — Gold heart wax seal
- `public/images/palace-bg.webp` — Architectural palace backdrop
- `public/favicon.svg` — Browser tab icon

## Enabling Live RSVP & Guestbook Persistence (Supabase)

By default (when `.env` credentials are not set), RSVP and Guestbook submissions are stored in the visitor's browser with a clear local-preview notice. To collect shared guest responses online:

1. Create a free project at [supabase.com](https://supabase.com).
2. Run the following SQL in the Supabase SQL Editor:

```sql
create table if not exists public.rsvps (
  id bigint generated always as identity primary key,
  guest_name text not null,
  phone text,
  guest_count text not null default '1',
  attendance text not null check (attendance in ('attending', 'declined')),
  guest_side text,
  message text,
  created_at timestamptz not null default now()
);

alter table public.rsvps enable row level security;

create policy "Allow public RSVP inserts"
  on public.rsvps for insert
  to anon
  with check (true);
```

3. Copy `.env.example` to `.env` and fill in `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`.

## Deploying to Vercel or Netlify

### Vercel
1. Push this repository to GitHub/GitLab.
2. Import the repository in Vercel (`vercel.json` is pre-configured).
3. Add optional `VITE_SUPABASE_*` environment variables if using Supabase.
4. Click **Deploy**.

### Netlify
1. Push this repository to GitHub/GitLab.
2. Import in Netlify (`netlify.toml` is pre-configured: build `npm run build`, publish `dist`).
3. Add optional `VITE_SUPABASE_*` environment variables if using Supabase.
4. Deploy.
