# Decision Log — github-pr-test

## Scope Decisions
- **Static-only, zero build tooling**: Chosen to keep the experiment minimal and universally runnable (open `index.html`), while still looking “premium SaaS.”
- **Single-page app structure**: One `index.html` file with embedded CSS/JS for portability and easy PR review.

## Product Decisions
- **Decision simulator format**: A lightweight scoring model (Confidence, Impact, Urgency) is broadly applicable to many product decisions and easy to understand.
- **Three scenarios**: Included as a selector to make the tool feel more “product-like” without adding complexity.
- **Explainable output**: Recommendation includes a short rationale to increase trust and usability.

## Design Decisions (Premium SaaS)
- **Visual language**: Card-based layout, subtle gradient background, soft shadows, and clean typography to emulate modern SaaS.
- **Hierarchy**: Strong title and concise subtitle; inputs grouped in a distinct card; result in a highlighted panel.
- **Components**: Buttons, select, and range inputs styled consistently using CSS variables for maintainability.

## Interaction Decisions
- **Immediate feedback**: Range sliders display numeric values; result updates on “Run Simulation” to keep the interaction explicit and predictable.
- **Deterministic model**: No randomness; ensures stable outcomes for reviewers and easier QA.

## Technical Decisions
- **No external dependencies**: Avoids CDN risk and keeps the PR self-contained.
- **Progressive enhancement**: Page remains readable without JS; simulator features require JS.
- **Folder convention**: Project should live at `/projects/YYYY-MM-DD-github-pr-test` to match experiment archiving.

## Repo Workflow Decisions
- **New branch + PR to main**: Required to validate contribution workflow and enable review. PR should include only the new folder and required files (`README.md`, `manifest.json`, `index.html`).
