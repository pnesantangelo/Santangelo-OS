# Santangelo OS Web v0.8.6

## Home / wall display
- Removes shopping summaries from Home.
- Adds Home Health, Family Ready, and Day Load gauges at the top.
- Keeps next departure, today's dinner, departure checklist, and next four weeks calendar.
- Adds a portrait wall-display mode for Yodeck: open `https://pnesantangelo.github.io/Santangelo-OS/?mode=wall`.
- Adds configurable time/weather header. Set Weather city once in More.

## Shopping
- Adds a dedicated Shopping tab and Quick Add input.
- Merges active Grocery List rows with inventory-driven needs.
- Purchased items disappear from the active web view immediately.
- Records Quantity Bought and writes purchases to Purchase History.
- Auto-updates inventory only when an existing Kitchen Inventory or Household Staples item/alias can be matched. One-time purchases are not turned into inventory items.

## Deploy
1. Replace `index.html`, `styles.css`, and `app.js` in the existing GitHub Pages repository.
2. Replace Apps Script `WebApi.gs` with this package's `WebApi.gs`.
3. Deploy a new version of the existing Apps Script web app; keep the same `/exec` URL.
4. Hard refresh the web app.
5. For Yodeck use the wall URL above.


## v0.8.6 patch
- Built-in default Apps Script /exec connection for zero-setup displays.
- Default weather location: Yorba Linda, CA.
- Automatic portrait wall mode; use ?mode=app to force the normal interface.
- Five-day forecast with highs, lows, and rain chance/dry indicator.
- Weather refreshes hourly.


## v0.8.6
- House tab now reads active chores directly from Chore Library.
- Family members self-select chores; no pre-assignment is required.
- Completion records are written to Chore Assignments as Self-selected history.
- Daily chores reset each day; weekly and twice-weekly progress resets Monday.
- As-needed chores remain available but do not lower Home Health.
- Home Health now uses recurring chore completion rather than assigned-chore rows.
- Today's Home dinner first checks the dated Weekly Meal Plan row, then falls back to Daily Briefing.
- Keeps v0.8.5.1 portrait wall mode and hourly Yorba Linda weather/5-day forecast.
