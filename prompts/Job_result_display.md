We already have a JobDetail page that fetches job result JSON.

Currently it displays raw JSON.

Replace the result display with a professional structured layout.

---

## GOAL

Render result in a clean dashboard-style layout.

Sections:

1. Summary
2. Roles
3. Companies
4. Confidence score
5. Sources collected
6. Key links

---

## STEP 1: REMOVE RAW JSON DISPLAY

Remove:

<pre>{JSON.stringify(result)}</pre>

---

## STEP 2: SUMMARY CARD

Create a card:

Title: Summary
Display result.summary as paragraph.

---

## STEP 3: ROLES + COMPANIES

Two-column layout:

Left:
Roles list

Right:
Companies list

If empty → show "No data".

---

## STEP 4: METRICS ROW

Show small badges:

Confidence: 95%
Sources: 5

Style as rounded pills.

---

## STEP 5: KEY LINKS SECTION

Show list of clickable links.

Each link in a card:

* favicon
* domain
* clickable anchor

Open in new tab.

---

## STEP 6: STYLING

Use clean modern UI:

* rounded cards
* spacing
* soft shadows
* grid layout
* neutral colors

---

## STEP 7: COMPONENT STRUCTURE

Create small components:

ResultSummary
ResultMeta
ResultLinks

---

## EXPECTED RESULT

Instead of raw JSON, page shows:

Summary text
Roles list
Companies list
Confidence badge
Sources count
Clickable links

---

## IMPORTANT

Do NOT use heavy UI libraries.
Use simple CSS or Tailwind if already installed.
