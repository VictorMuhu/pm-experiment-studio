# Empirical Ledger — A/B Testing Coach

A PM reading an experiment result alone — no statistician, no data scientist — will misinterpret a p=0.04 on an underpowered test as a green light. This tool closes that gap by surfacing the exact statistical reasoning at the point of decision.

## What It Is

A standalone, browser-native five-screen A/B testing companion that walks a PM through the complete experiment lifecycle: from structuring a testable hypothesis, to configuring guardrail metrics and decision thresholds, to simulating outcomes, to declaring a winner — all without a single API call.

## Why It Exists

A Growth PM receiving a test result at 9 AM before a stakeholder review needs to know whether the reported lift is real, which guardrail metrics to check, and what to say if asked "how confident are you?" — without opening a stats textbook or waiting for a data analyst. This tool delivers a structured, defensible answer to that exact question. It is not a replacement for a stats team; it is the first-pass reasoning layer a PM can use independently.

## What It Does

1. **Hypothesis Builder** — Uses an IF/FOR/THEN/BECAUSE scaffold to force a structurally complete hypothesis before the experiment runs. The statement auto-generates in plain English as the user fills in the form.
2. **Experiment Configuration** — Sets the primary success metric, activates guardrail metrics, and calibrates success/failure thresholds via live sliders. The Predicted Engine Action panel updates in real time to reflect the current configuration.
3. **Metrics Dashboard** — Tracks primary metrics (CVR, RPU) and guardrail metrics with SAFE/WARNING status. A Coach Integrity sidebar runs a data-quality checklist and flags anomalies like Sample Ratio Mismatch.
4. **Experiment Simulator** — Projects three outcome scenarios (Statistical Success, Neutral, Statistical Failure) with a live SVG timeline chart, decision banner, impact grid, and Coach Analysis narrative that changes per scenario.
5. **Decision Engine** — Displays the final recommendation (SHIP TO 100% / CONTINUE TESTING / KILL), shows primary metric lift analysis, guardrail metric grid, and a clickable next-steps checklist.

## What Was Left Out

- **Backend or persistence**: All state is session-only. The tool is designed for a single decision moment — not longitudinal experiment tracking.
- **Real statistical calculations**: The simulator uses preset scenario data rather than live p-value math. Adding true Bayesian power calculations would require a compute backend and was out of scope for a standalone portfolio artifact.
- **Multi-variant (A/B/C/n) support**: The UI assumes a two-arm test. Multi-arm testing introduces winner selection complexity (multiple comparisons correction) that would require a dedicated screen set.

## Status

`draft`

## Target Persona

Growth PMs, Product Managers, Experimentation Leads who run A/B tests but don't have a statistician always available for interpretation.

## Tech Stack

- Pure HTML/CSS/JS (zero build step, zero dependencies)
- Tailwind CSS via CDN with a full Material Design 3 color token override
- Material Symbols icon font via Google Fonts
- Inter typeface via Google Fonts
- Vanilla JS router (display:none/block screen toggling)
- Inline SVG chart (path morphing per outcome mode)
