# Santangelo OS v0.10.2b - Real Task Push Reminders

This patch builds on v0.10.2a. It keeps the existing local notification test and adds real server-driven Web Push for Tasks.

## What this patch does

- Keeps `Tasks -> Reminder At` as the source of reminder timing.
- Connects the installed Android web app to OneSignal Web Push.
- Uses the fixed external user ID `santangelo-primary` by default, so future devices can be attached to the same OS user.
- Adds a server-side test push action.
- Adds `Reminder Sent At` and `Reminder Message ID` columns to the Tasks sheet automatically.
- Adds `processTaskReminders()` to find open tasks whose Reminder At time is due and send them once.
- Adds `installTaskReminderTrigger()` to create a one-minute Apps Script trigger.
- Does not create Google Calendar events.

## Step 1 - Create the OneSignal web app

1. Create/sign in to a OneSignal account.
2. Create an app named `Santangelo OS`.
3. Configure **Web Push** using **Custom Code**.
4. Set the Site URL to the exact origin that hosts Santangelo OS (scheme + domain, with no page filename). Web Push is origin-specific.
5. In OneSignal Settings -> Keys & IDs, copy:
   - App ID
   - App API / REST API Key

Do not paste the REST API key into app.js, HTML, GitHub, or the static website.

## Step 2 - Add Apps Script properties

In the Santangelo OS Apps Script project, open Project Settings -> Script Properties and add:

- `ONESIGNAL_APP_ID` = your OneSignal App ID
- `ONESIGNAL_REST_API_KEY` = your OneSignal App API / REST API Key
- `ONESIGNAL_EXTERNAL_ID` = `santangelo-primary` (optional; this is the default)

The App ID is public. The REST API key stays server-side in Apps Script.

## Step 3 - Deploy the updated Web API

Replace the current Web API source with `Santangelo_OS_WebApi_v0.10.2b_PUSH.gs`, preserving the current Alexa helper file.

Deploy a new version of the existing Apps Script Web App. Keep the same access settings you already use for Santangelo OS.

Test this URL in a browser:

`YOUR_WEB_APP_URL?action=pushconfig`

It should return JSON containing the OneSignal App ID and `configured:true`.

## Step 4 - Install the reminder trigger

In the Apps Script editor, choose the function:

`installTaskReminderTrigger`

Run it once and approve any requested authorization. It creates a time-based trigger that calls `processTaskReminders` every minute.

Reminder delivery is therefore expected within roughly the next trigger cycle rather than to-the-second.

## Step 5 - Deploy the static web files

Deploy these files together, preserving the folder structure:

- `index.html`
- `app.js`
- `styles.css`
- `manifest.json`
- `service-worker.js`
- `push/onesignal/OneSignalSDKWorker.js`

The OneSignal worker must remain at that exact relative path and must be served as JavaScript from the same origin as Santangelo OS.

## Step 6 - Connect the Android phone

1. Open the installed Santangelo OS app from the Android home screen.
2. Open **More -> Notifications**.
3. Tap **Connect reminder delivery**.
4. Wait for `Reminder delivery connected`.
5. Tap **Send server test**.
6. Close/minimize Santangelo OS and confirm the server-driven test notification arrives.

This server test is different from the local test: it proves the push provider and Apps Script can reach the phone when the app is not open.

## Step 7 - Test a real task

Create a Task with a Reminder At time a few minutes in the future. Close the app. The trigger should send:

- Title: `Task Reminder`
- Body: the task name

After a successful send, the Tasks sheet records `Reminder Sent At` and the OneSignal message ID so the task is not sent repeatedly.

## Safety behavior

- Completed tasks do not send reminders.
- A reminder is sent only once.
- The checker only sends reminders that became due within the previous 24 hours. This prevents deployment from suddenly sending very old reminder entries.
- The OneSignal REST key is never returned by the Web API and never stored in the frontend.
