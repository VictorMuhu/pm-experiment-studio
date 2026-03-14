# Process Notes

How work actually flows in this repo.

---

## Starting a New Project

1. Run the scaffold script:
   ```bash
   node scripts/scaffold.js --name "Your Idea Here"
   ```
   This creates a folder in `/scratch` with the template files pre-filled.

2. Write the problem statement first — in `README.md`, under "Why It Exists." If you can't write a specific problem statement, the project isn't ready to start.

3. Work in `/scratch` until it clears the quality bar in CONTRIBUTING.md.

4. Move the folder to `/projects`, update `manifest.json` (especially `status` and `updated`), and open a PR.

---

## Promoting from Scratch to Projects

The checklist is in CONTRIBUTING.md. The spirit of it: `/projects` should only contain things you'd actually show someone. If you're hesitant to share a link, it belongs in scratch.

The move is just a folder rename. Keep the same slug.

---

## Keeping the Index Current

Run `node scripts/build-index.js` after adding or updating a project. This regenerates `projects/index.json`, which can be consumed by external tools or a portfolio site.

This can also be set up as a pre-commit hook:

```bash
# .git/hooks/pre-commit
node scripts/validate.js && node scripts/build-index.js
git add projects/index.json
```

---

## Archiving a Project

Change `status` to `archived` in `manifest.json`. Add a note to the project README explaining why it's archived (abandoned, superseded, experiment concluded). Do not delete — archived projects are part of the record.

---

## Prompts

The `/prompts` directory stores reusable LLM prompts. Name files descriptively: `generate-problem-statement.md`, `review-decision-log.md`, etc. Include a header comment explaining the prompt's purpose and any required context.
