Santangelo OS v0.9.0 Lite Architecture
====================================

WHAT CHANGED
- The interactive web app no longer downloads the entire OS for every action.
- Home, departure, calendar, meals, shopping, chores, and house are separate lightweight GET modules.
- Tabs load their own data only when opened.
- Grocery adds appear immediately in the UI, then save in the background.
- Purchased grocery items disappear immediately and sync without a full dashboard reload.
- Chore and meal actions return only the data they changed.
- Wall mode initially loads only Home + Calendar; it does not pull shopping/meals/house data it does not display.
- Departure refreshes independently every 2 minutes; Home every 5 minutes; Calendar every 10 minutes; weather stays hourly.
- Alexa v1 routes are preserved.

DEPARTURE / SPORTS UPDATE
- Sports Season Manager now supports separate columns named:
    Practice Arrival Buffer (min)
    Game Arrival Buffer (min)
  (Names without "(min)" are also accepted.)
- Flag Football defaults: practice 15 min early, game 30 min early.
- Baseball preserves the Availability & Travel Rules game override (70 min) and can use a practice buffer from Sports Season Manager.
- Event titles containing Game / vs / tournament / opponent / match are treated as games unless they also say Practice or Rehearsal.

GOOGLE MAPS TRAFFIC SETUP
This release can calculate driving time from each Google Calendar event's Location field using Google Maps Routes API.

1. In Google Cloud, enable Routes API for the project you want to use and create an API key with Routes API restriction. Billing must be enabled for Google Maps Platform.
2. In Apps Script, open Project Settings -> Script properties. Add:
     GOOGLE_MAPS_API_KEY = your private Maps API key
     SANTANGELO_HOME_ADDRESS = your home street address
   Keep both out of GitHub and out of the spreadsheet.
3. Calendar events need a usable destination in their Location field. If Location is blank, the OS falls back to the static travel rule.
4. The route result is cached for 15 minutes. More than 90 minutes before departure it uses TRAFFIC_AWARE for lower latency; closer to departure it uses TRAFFIC_AWARE_OPTIMAL.

INSTALL
1. Apps Script: replace WebApi.gs with this WebApi.gs. Keep/add AlexaApi.gs and ParentSquareIntegration.gs as separate files.
2. Save and deploy the existing web app as a NEW VERSION, keeping the same /exec URL.
3. GitHub: replace index.html and app.js. Replace styles.css with the included file too; it is an exact copy of the latest stylesheet you uploaded, so your phone/computer and wall font sizes are preserved.
4. For Yodeck use: https://pnesantangelo.github.io/Santangelo-OS/?mode=wall&v=090

IMPORTANT
- Do not put the Google Maps API key in app.js or GitHub. The traffic request runs server-side in Apps Script.
- Legacy action=dashboard remains available as a fallback, but v0.9.0 does not use it during normal interactive operation.
