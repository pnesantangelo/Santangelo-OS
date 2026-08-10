# Santangelo OS Web v0.8.6.2

Reliability patch for the Raspberry Pi / Yodeck wall display.

Changes:
- Wi-Fi QR code is embedded directly in index.html; there is no separate image file to upload or cache.
- The app no longer falls back to fake demo data when the Apps Script request fails.
- Last successful live dashboard data is cached locally and remains visible during a temporary connection issue.
- If no live cache exists, the dashboard shows a connection/loading state rather than demo content.
- Adds cache-busting version tags for app.js and styles.css and no-cache HTML hints for Yodeck/GitHub Pages.
- Keeps all v0.8.6.1 readability, 12-hour clock, chore, navigation, dinner-recipe, and wall-display changes.

Apps Script backend is unchanged from v0.8.6.1. You do not need to redeploy Apps Script just for this patch if v0.8.6.1 is already deployed.


## v0.8.6.3 wall connection fix
- Removed demo data and the demo-data button completely.
- Wall mode ignores stale browser/localStorage API settings and always uses the known deployed /exec endpoint.
- Connection pill now reports CONNECTING, API REACHED, LIVE, OFFLINE, or CONNECTION ERROR.
- Preserves the user-supplied styles.css font sizes for wall weather and calendar.
- Wi-Fi QR remains embedded directly in index.html and is displayed in wall mode.


## v0.8.6.4 slow-connection reliability patch
- Dashboard API timeout increased to 60 seconds per attempt.
- Up to three attempts are made before showing an offline/error state.
- Failed displays automatically try again after 60 seconds.
- Last successful live dashboard response remains cached and visible during slow/offline periods.
- Normal background refresh is every 10 minutes; weather remains hourly.
- 12-hour AM/PM clock formatting remains explicitly enabled.
- User-supplied wall weather/calendar font sizes are preserved unchanged.
