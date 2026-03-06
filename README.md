# RunePilot - League of Legends Draft Analyzer MVP

A React-based web application for analyzing League of Legends team drafts.

## Features

- **Draft Board**: Blue/Red team pick & ban interface for all 5 roles
- **Champion Pool**: Searchable, filterable champion browser with 50+ champions
- **Auto-advance**: Selecting a champion auto-moves to the next empty slot
- **Ban Phase**: Dedicated ban mode with up to 5 bans per team
- **Draft Analysis**: Real-time analysis for both teams including:
  - Damage type distribution (AD/AP balance)
  - Team strengths & weaknesses
  - Win conditions
  - Average champion win rates
- **Matchup Summary**: Side-by-side win rate comparison with prediction

## Getting Started

```bash
npm install
npm start
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## How to Use

1. Click any role slot (e.g., TOP, JUNGLE) to activate it
2. Click a champion in the pool to assign them to that slot
3. Use **Ban Mode** to select bans for each team
4. The **Analysis Panel** updates in real-time as you draft
5. Hit **Reset Draft** to start over

## Tech Stack

- React 18
- CSS custom properties (no external UI libraries)
- Static champion data with real-inspired win/pick/ban rates

## Notes

This is an MVP with static data. Future versions could integrate the Riot Games API for live patch data.
