# Unified Pricing (Calculator + Services) Design

**Goal:** Merge the calculator's per-model price matrix and the manually-curated Service catalog into one data source, so editing a price in one place updates it everywhere, while preserving per-model price accuracy, the brand-multiplier fallback estimate, and a fast bulk-editing admin screen.

## Background

Two independent systems currently coexist:

- **Calculator** (`src/lib/pricing-data.js`, ~590 lines): a hardcoded object keyed by device type → repair type (base price) and device type → brand (multiplier) → model (generation factor, port type, `specificPrices` overrides per repair type). Admin-edited via a `CalculatorConfig` Mongoose document (`pricingData: Mixed`) through `/admin-panel/calculator-config`.
- **Service catalog** (`Service` Mongoose model): a parent/child tree of categories and leaf services, each with a flat string `price` field (e.g. `"3000"` or `"Уточняйте"`), plus SEO fields (slug, metaTitle, description, etc). Admin-edited one entry at a time via `ServiceForm.js` at `/admin-panel/listservice`.

Root Service categories already share names with calculator device types (`Ремонт телефонов`, `Ремонт ноутбуков`, `Ремонт видеокарт`, `Ремонт телевизоров`), which is the natural seam for unification. Two other root categories (`Игровые консоли`, `Ремонт джойстиков`) have no calculator equivalent and are unaffected by this work.

A prior bug (fixed separately, outside this spec) made `ServicePricePage.js` treat "click category" and "open calculator" as mutually exclusive for these four categories, hiding all manually-created services underneath them. That fix already ships both entry points side by side; this spec makes the data underneath them the same data.

## Data Model

### New collections

**Brand**
- `name` (string, e.g. "Apple iPhone")
- `deviceType` (string, matches the Service category, e.g. `"phone"`)
- `multiplier` (number, e.g. `1.3`) — used for the auto-estimate fallback

**Model**
- `brandId` (ref Brand)
- `name` (string, e.g. "iPhone 12")
- `gen` (number) — generation/era factor used in the auto-estimate fallback, mirrors today's `gen` field
- `portType`, `hasSeparateGlass`, `appleOnly` and similar flags — carried over unchanged from today's per-model metadata in `pricing-data.js`

### Service model extension

Add one optional field to the existing `Service` schema:

- `priceVariants: [{ modelId: ObjectId (ref Model), price: Number }]`
- `basePrice: Number` (optional) — the flat estimate price used with a brand's `multiplier` when no `priceVariants` entry matches; mirrors today's calculator `basePrice` per repair type

The existing `price` (String) field is untouched and keeps its current role: the display value used on the public service page when no specific model is in context (e.g. `"от 2500 ₽"` or `"Уточняйте"`).

### Price resolution (single shared function)

Given a `Service` (leaf), a `Brand`, and a `Model`:

1. If `service.priceVariants` has an entry for this `modelId` → return that price (exact).
2. Else if `service.basePrice` is set → return `round(basePrice * brand.multiplier * (model.gen ?? 1))` (estimate).
3. Else → return `service.price` (display text, e.g. `"Уточняйте"`).

This function is the only place pricing logic lives. Both the calculator widget and any "price for my model" UI on a service page call it — no duplicate pricing logic.

## Admin UX

Two separate editing surfaces, unchanged in spirit from today:

- **Service form** (`ServiceForm.js`, unchanged): name, description, SEO fields, category placement, `price` (display fallback), `basePrice`.
- **Bulk pricing matrix** (replaces today's `/admin-panel/calculator-config`): pick a device category (e.g. "Ремонт телефонов"), see a table — rows are Models, columns are the category's leaf Services (repair types) — edit `priceVariants` cells directly, save in bulk. Adding a new Model (e.g. a newly released phone) is one row in a "Models" admin list and it immediately appears as a row in every repair-type table for that device category.

## Customer-Facing UX

- **Service detail page** (`/services/<slug>`): unchanged display (description, price text, booking button), plus a new "🧮 Точный расчёт по вашей модели" button that opens the calculator pre-scoped to this service's device type and repair type.
- **Calculator** (`RepairCalculator.js`): same device → brand → model → repair-type flow. Instead of importing the static `pricing-data.js`, it fetches live pricing from the unified data (new API route reading Brand/Model/Service.priceVariants) and calls the shared price-resolution function.
- **Services list/tree** (`/services`, `ServicePricePage.js`): unchanged — still browsing the same Service tree it does today.

## Migration

A one-time, dry-run-first script (matching the pattern already used for the earlier slug migration in this project):

1. Read `pricing-data.js` and the existing `CalculatorConfig.pricingData` (in case of live admin edits not yet reflected in the static file).
2. For each device type → repair type in the calculator data, attempt to match it to an existing Service leaf by name under the corresponding root category.
3. **Dry run**: print a report of proposed matches (`calculator repair type X` → `existing Service Y`) plus any calculator repair types with **no** confident match, for manual review — nothing is written.
4. On explicit confirmation (`--apply` flag, matching the project's existing migration-script convention), create/update `Brand` and `Model` documents, and populate matched Services' `priceVariants`/`basePrice`.
5. Repair types with no confident match are left for manual linking later; they do not block the rest of the migration and nothing is deleted.

## Rollout Phases

Given the size, this ships in four independently-testable phases (each phase leaves the site working):

1. **Data model** — new `Brand`/`Model` collections, `Service.priceVariants`/`basePrice` fields, shared price-resolution function, migration script (dry-run, then apply after review). No visible change to the site yet.
2. **Admin bulk pricing matrix** — new screen reading/writing the Phase 1 data. Old `/admin-panel/calculator-config` screen retired once this is confirmed working.
3. **Customer-facing rewire** — `RepairCalculator.js` reads live data instead of `pricing-data.js`; service detail page gets the "точный расчёт" button.
4. **Cleanup** — remove `pricing-data.js` and the `CalculatorConfig` model once Phases 1–3 are confirmed working in production and nothing still imports them.

## Out of Scope

- Changing the visual design of the calculator or service pages.
- Categories with no calculator equivalent (`Игровые консоли`, `Ремонт джойстиков`) — untouched.
- Retiring the flat `price` string field on `Service` — it stays as the display fallback.
