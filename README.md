# Santangelo OS Web v0.7

## New in v0.7
- Approved meal names open a recipe detail panel.
- Recipe panel shows ingredients, available directions, timing, substitutions, thaw and batch-prep notes.
- Mark Cooked updates Last Served and the weekly plan status.
- Family rating writes back to Meal Library.
- Missing recipe ingredients can be added to Grocery List for Smart & Final.
- The Meals tab keeps the weekly review and Before Bed prep checklist.

## Deploy
1. Replace the GitHub Pages files with index.html, styles.css, and app.js.
2. Replace WebApi.gs in Apps Script.
3. Save and redeploy the existing web-app deployment as a new version.
4. Hard-refresh the browser after GitHub Pages finishes publishing.

Note: The recipe view can only display the directions currently stored in the Meal Library Notes field. Recipes with brief imported notes will show those notes until more detailed directions are added to the library.
