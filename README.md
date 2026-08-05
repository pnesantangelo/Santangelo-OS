# Santangelo OS Web v0.6

This version adds a live four-week family calendar to the Home dashboard.

## Calendar colors
- Phillip: dark navy
- Erin: burgundy / deep pink
- Carson: royal blue
- Nathan: Notre Dame green
- Addison: bright pink
- Both boys: teal
- Whole family: gray

## Update steps
1. Replace the files in the GitHub Pages repository with `index.html`, `styles.css`, and `app.js` from this package.
2. In the existing Google Apps Script project, replace `WebApi.gs` with this package's `WebApi.gs`.
3. Deploy a **new version** of the Apps Script web app using **Deploy > Manage deployments > Edit > New version > Deploy**.
4. The web app keeps the existing Apps Script URL stored on the phone. Open the web app and refresh it.

The calendar reads enabled calendars from the `Calendar Setup` sheet. Calendar rows marked for dashboard display are included. An event is colored using the Person value in that sheet; events whose person is `Both Boys` use teal.


## v0.6 meal-plan update

This version adds a weekly meal-plan review panel and a dedicated Meals tab. It requires replacing the Apps Script code with the included `WebApi.gs`, then creating a new deployment version in Apps Script.

Features:
- Green/yellow/red ingredient-readiness display
- Approve one meal or the whole week
- Request an alternate meal suggestion
- Accept the alternate suggestion
- Move meals up or down to rearrange the week
- Changes write back to the `Weekly Meal Plan` sheet

The Apps Script web app must be deployed with **Execute as: Me** and access appropriate for the family app. After redeploying, keep using the same deployment URL if you update the existing deployment; otherwise paste the new URL into More > Apps Script Web App URL.


## v0.6 meal navigation update
- Home shows only today’s dinner.
- Meals is a dedicated bottom-navigation tab.
- Meals begins with the condensed green/yellow/red weekly view.
- The Before Bed section shows the next meal’s prep/thaw actions and saves checklist progress on the device.
