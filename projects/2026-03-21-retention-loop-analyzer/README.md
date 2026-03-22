# Retention Loop Analyzer

## What It Is

A dark-mode PM analytics tool for mapping, diagnosing, and stress-testing behavioral retention loops in B2C SaaS products.

## Why It Exists

A Growth PM who has just received a week-one retention report showing a 40% drop between activation and the core loop needs to identify exactly where the behavioral friction lives — and model a corrective intervention — before a Friday leadership readout. Currently this requires switching between Amplitude for funnel data, Miro for loop diagrams, and a spreadsheet for intervention modeling. This tool collapses all three into one coherent workspace.

## Target Persona

Senior Growth PM at a Series B–D B2C SaaS company managing a retention initiative. Responsible for D1–D30 retention KPIs. Presents weekly to a CPO.

## Screens

### 1. Loop Builder
Visual canvas with four interactive nodes (Trigger → Action → Reward → Investment) orbiting a central Stability Index metric. Node Inspector panel lets PMs tune reward strength, trigger logic, and path friction in real time.

### 2. Behavioral Flow
Sankey-style flow map showing drop-off at each stage (Entry Point → Core Loop → Retention) with a live Breakpoint Details panel that surfaces the critical friction magnitude and specific UX causes.

### 3. Intervention Simulator
Side-by-side comparison of baseline vs. simulated state. Three variable sliders (Reward Magnitude, Friction Level, Trigger Frequency) update the projected retention curve for days 1–90.

### 4. Insights
Executive strategy deck with a Health Index score, critical alert bento cards (loop speed, trigger timing, reward architecture), and an action queue.

## Design Direction

Dense analyst console — dark `#131313` surface, cyan primary (`#00E5FF / #C3F5FF`), magenta secondary (`#FE00FE / #FFABF3`), chartreuse tertiary (`#CDFF13`). Space Grotesk headlines, Inter body, JetBrains Mono for data. Material Symbols iconography.

## Tech

Pure HTML/CSS/JS — Tailwind CDN, Material Symbols, Google Fonts. No build step required.

## What Was Left Out

- Live data integration (Amplitude, Mixpanel) — would require backend auth flow
- Drag-and-drop node repositioning — loop builder nodes are visually positioned but not draggable
- Shareable/persistent loop state — no backend storage
- V2: loop state serialization and a collaboration URL for async async async async async reviews
