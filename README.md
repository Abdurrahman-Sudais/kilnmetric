# KilnMetric

**Learn from every firing cycle.**

KilnMetric helps ceramic manufacturers connect firing records, material batches and inspection results to estimate defect risk, surface recurring patterns and track engineer-approved trials.

> KilnMetric is a proposed product. Pricing is illustrative and the prototype uses fictional data. Founded by **Olumide Fashola** with co-founder **Amina Bello**. The domain `kilnmetric.com` and the email `olumide@kilnmetric.com` are placeholders — confirm them before launch. Organisation types named on the site are prospective customers with no implied affiliation.

## Design

Porcelain and cobalt, like Delft tiles: Cormorant display type, Figtree text and Spline Sans Mono, cobalt ornament rules, celadon for good outcomes and ember for heat and risk.

- **Hero** — a firing curve (drying, preheat, peak, cooling) that draws itself, with a batch that cooled too fast; below it a row of tiles, two of which crack.
- **Batch history** as a chain of glazed tiles, **defect risk** as a dial with explained contributions, **patterns** as with/without bars from inspected batches, **trials** as two plates, rules as Roman-numbered panels, statistics on rimmed plates and founders in tile frames.

## Firing ledger (`/app`)

Eleven fictional batches of 30 × 60 wall tile. Each batch’s curve is drawn against the reference; defect risk comes from a small logistic model whose feature contributions are shown (calibrated so predictions sit within about 0.7 points of inspected rejection rates). Patterns compare inspected batches with and without a condition. Engineers hold, investigate or release batches (with a reason) and approve trials only inside the approved process window; quality inspectors record trial results. Roles: Plant Manager, Process Engineer, Quality Inspector, Kiln Operator.

Every decision in the prototype is made by a person, needs a reason, and is written to an exportable log. Changes persist in `localStorage`. Motion is skipped when the visitor prefers reduced motion, and all content is server-rendered and readable without JavaScript.

## Structure

```
src/content.js      site facts, founders, sourced statistics
src/data.js         fictional data, roles
src/engine.js       the prototype’s rules (pure functions, tested)
src/App.jsx         marketing pages
src/Ledger.jsx      the firing ledger
src/motion.js       site-specific motion
src/styles.css      all styling
scripts/prerender.mjs  static HTML for every route
tests/              node --test suites
```

## Develop

```bash
npm install
npm run dev
```

```bash
npm run build   # Vite build, server render, static prerender of /, /app, /privacy, /terms and 404.html
npm test        # rules and content tests (node --test)
npm run preview
```

The output in `dist/` is fully static. `public/_headers` and `public/_redirects` cover Netlify/Cloudflare Pages; `vercel.json` covers Vercel.

The pilot form keeps requests in the browser and opens a pre-filled email until a form service is connected. To send submissions to HubSpot, set `VITE_HUBSPOT_PORTAL_ID` and `VITE_HUBSPOT_FORM_GUID` at build time and update the privacy notice first.
