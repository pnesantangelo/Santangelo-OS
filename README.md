# Santangelo OS Web v0.8.5.2

This is a compatibility and calendar-fix patch for the portrait Yodeck/Raspberry Pi display.

## Fixes

- Replaces `structuredClone()` with an older-Chromium-safe JSON clone so Yodeck does not freeze on the static Demo data / Loading weather screen.
- Keeps the built-in Apps Script `/exec` default and Yorba Linda, CA weather default.
- Keeps hourly weather refresh and the five-day high/low/rain forecast.
- Makes portrait wall-mode detection slightly more tolerant on kiosk displays.
- Fixes Google Calendar all-day events appearing on both the event date and the following day. Google Calendar uses an exclusive end date for all-day events.

## Deploy

### GitHub Pages
Replace:
- `index.html`
- `styles.css`
- `app.js`

Commit/publish, then refresh the Yodeck webpage.

### Apps Script
Replace `WebApi.gs` and deploy a **new version of the existing web app deployment**. Keep the same `/exec` URL.

The Apps Script redeploy is required for the all-day calendar fix.
