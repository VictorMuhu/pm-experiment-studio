# Release Readiness Board

## Goal
Build a polished internal product management tool that tracks launch readiness across multiple features, highlighting risk, blockers, and confidence to ship.

## Problem
Teams often manage launch readiness in scattered docs, spreadsheets, and chat threads. This creates:
- Inconsistent definitions of “ready”
- Poor visibility into blockers and ownership
- Late discovery of high-risk items
- Difficulty comparing readiness across features/releases

## Why This Exists
This experiment tests whether a single, brutalist, analytics-style dashboard with clear readiness signals (confidence score + risk) reduces status churn and improves launch decision quality.

## Target Persona
- Product Managers and Release Managers coordinating multi-feature launches
- Engineering Managers tracking delivery risk and blockers
- Design/QA leads validating checklist completion

## Use Cases (3)
1) **Weekly release readiness review**: PM opens dashboard, sorts by risk, and reviews blockers and checklist gaps with owners.
2) **Go/No-Go decision support**: Release Manager uses confidence score + risk indicators to identify features that threaten launch date.
3) **Owner execution view**: Feature owner filters to “My Features” to see open blockers and remaining checklist items.

## Wireframe (ASCII art)

+-----------------------------------------------------------------------------------+
| Release Readiness Board (Dark / Brutalist)                 [Search] [Filter ▼]    |
+-----------------------------------------------------------------------------------+
| KPIs:  Avg Confidence: 78   High Risk: 3   Blocked: 5   Ready to Ship: 8          |
+-----------------------------+-----------------------------------------------------+
| Risk Breakdown (chart)      | Confidence Trend (sparkline)                       |
| [■ ■ ■ □ □]                 |  65  70  72  76  78                                |
+-----------------------------+-----------------------------------------------------+
| Features (table)                                                                    |
|-----------------------------------------------------------------------------------|
| Feature            Owner        Confidence   Risk   Blockers   Checklist  Status |
|-----------------------------------------------------------------------------------|
| SSO Improvements   A. Nguyen    82           Med    1          9/12       At Risk|
| Billing Revamp     J. Patel     61           High   3          6/14       Blocked|
| Search v2          M. Chen      90           Low    0          13/13      Ready  |
|-----------------------------------------------------------------------------------|
| [Select Feature] -> Right drawer / modal:                                           |
|  - Summary, Owner, Confidence details                                               |
|  - Blockers list (add/close)                                                        |
|  - Release checklist (toggle items)                                                 |
|  - Notes / timeline                                                                 |
+-----------------------------------------------------------------------------------+

## Tech Stack
- **Next.js (App Router) + React + TypeScript**
- **Tailwind CSS** for dark mode + brutalist styling
- **TanStack Table** for dense, analytics-style tables
- **Recharts** (or lightweight chart lib) for KPI mini-visuals
- **Local-first storage** (seed JSON + browser persistence) for experiment speed
- **ESLint + Prettier** for quality checks

## Future Enhancements
- Multi-release support (Release X vs Release Y) with snapshots
- Role-based views (PM vs Eng vs QA)
- Checklist templates per feature type
- Audit log for readiness changes
- Integrations: Jira/Linear, GitHub, Slack notifications
- Export: CSV / PDF for leadership reviews
