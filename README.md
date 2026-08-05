# Santangelo OS Web v0.8.4

This is the matched release containing all v0.7 recipe features, the v0.7.1 opaque recipe-panel fix, and the new spreadsheet-driven departure countdown/checklists.

## New in v0.8.1
- The Home **Next** card calculates the next real departure instead of relying only on Daily Briefing text.
- On active school days, the app counts down to the fixed **8:10 AM** school departure even though school is not placed on every child's calendar.
- After the school departure passes, the app automatically switches to the next travel event that day.
- Departure times include activity arrival/setup buffers from **Availability & Travel Rules**.
- Baseball games use the family's 70-minute early-arrival rule.
- The **Before you leave** list is loaded from **Departure Checklists** and matched by activity, person, and role.
- Participant, spectator, student, and driver checklist layers can be edited in the spreadsheet.
- Checklist completion is saved separately for each departure on the current device.
- When no departure remains, the app shows **No more departures today**.

## Spreadsheet tabs used
- Departure Checklists
- Departure Rules
- Availability & Travel Rules
- Calendar Setup
- Sports Season Manager

The checklist content is editable immediately in the spreadsheet. Edit the `Active?` column to disable an item without deleting it.

## Deployment
1. Upload/replace `index.html`, `styles.css`, and `app.js` in the GitHub Pages repository.
2. Replace the existing Apps Script `WebApi.gs` with the included `WebApi.gs`.
3. Save Apps Script.
4. Choose **Deploy > Manage deployments > Edit**.
5. Select **New version**, then deploy while keeping the existing deployment URL.
6. Hard-refresh the web app after GitHub Pages publishes.

## Notes
- The app searches connected calendars for **First Day of School**, **Last Day of School**, and **No School/School Holiday** events. When dates are unavailable, it uses a seasonal fallback.
- Travel minutes currently come from `Availability & Travel Rules`. Update the zero/default values there as you learn the real drive times.
- Spectator lists are automatically applied when an event belongs to the Whole Family calendar. Additional attendance-specific logic can be added later.


## Meal name mapping
The Weekly Meal Plan now uses column AA (`Recipe Key`) for exact Meal Library lookup while keeping the friendly display name in the existing meal columns. Column AB stores an alternate recipe key. Edit the `Meal Name Map` sheet to add aliases when a friendly name differs from the Meal Library name.


## New in v0.8.4
- Missing ingredients can be confirmed during meal approval.
- Each confirmed item may include the inventory name you actually use, such as `ham lunch meat` for `sliced ham`.
- Confirmed ingredients are removed from the meal's missing count before approval.
- Every confirmation is added to the editable `Inventory Review Queue` sheet for later inventory or alias cleanup.


## v0.8.4 ingredient approval safety
- The weekly approval card now lists every required ingredient that the OS cannot confirm from inventory.
- Every item must be marked **I have it** or **Need to buy** before approval.
- Only reviewed **Need to buy** items remain in the meal's Missing Items field.
- Grocery-list buttons add only the reviewed Missing Items, never the unreviewed recipe estimate.
- **I have it** selections continue to create Inventory Review Queue reminders, including optional inventory aliases.


## v0.8.4 changes
- Uses **Kitchen Inventory** for food and recipe ingredient matching.
- Uses **Household Staples** for non-food household purchasing and home-health cards.
- Rechecks Kitchen Inventory every time the app refreshes.
- Matches recipe ingredients against both the Item name and **Aliases / Alternate Names**.
- Only ingredients still unmatched after the live refresh appear in the approval review.
- Approved meals preserve the final reviewed shopping list.
