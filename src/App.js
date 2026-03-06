import React, { useState, useCallback } from "react";
import DraftBoard from "./components/DraftBoard";
import ChampionPool from "./components/ChampionPool";
import AnalysisPanel from "./components/AnalysisPanel";
import "./App.css";

const ROLES = ["TOP", "JUNGLE", "MID", "ADC", "SUPPORT"];
const MAX_BANS = 5;

const emptyTeam = () => ({
  TOP: null,
  JUNGLE: null,
  MID: null,
  ADC: null,
  SUPPORT: null,
});

const emptyBans = () => Array(MAX_BANS).fill(null);

export default function App() {
  const [blueTeam, setBlueTeam] = useState(emptyTeam());
  const [redTeam, setRedTeam] = useState(emptyTeam());
  const [blueBans, setBlueBans] = useState(emptyBans());
  const [redBans, setRedBans] = useState(emptyBans());
  const [activeSlot, setActiveSlot] = useState(null); // { team, role } or { team, banIndex }
  const [mode, setMode] = useState("picks"); // 'picks' | 'bans'

  const usedChampions = [
    ...Object.values(blueTeam).filter(Boolean).map((c) => c.id),
    ...Object.values(redTeam).filter(Boolean).map((c) => c.id),
    ...blueBans.filter(Boolean).map((c) => c.id),
    ...redBans.filter(Boolean).map((c) => c.id),
  ];

  const bannedChampionIds = [
    ...blueBans.filter(Boolean).map((c) => c.id),
    ...redBans.filter(Boolean).map((c) => c.id),
  ];

  const handleSlotClick = useCallback((team, role) => {
    setMode("picks");
    setActiveSlot({ team, role, type: "pick" });
  }, []);

  const handleBanSlotClick = useCallback((team, banIndex) => {
    // Find first empty ban slot for that team
    const bans = team === "blue" ? blueBans : redBans;
    const emptyIndex = bans.findIndex((b) => b === null);
    if (emptyIndex === -1) return;
    setMode("bans");
    setActiveSlot({ team, banIndex: emptyIndex, type: "ban" });
  }, [blueBans, redBans]);

  const handleChampionSelect = useCallback((champion) => {
    if (!activeSlot) return;

    const { team, role, banIndex, type } = activeSlot;

    if (type === "pick") {
      if (team === "blue") {
        setBlueTeam((prev) => ({ ...prev, [role]: champion }));
      } else {
        setRedTeam((prev) => ({ ...prev, [role]: champion }));
      }
      // Auto-advance to next empty slot
      const currentTeam = team === "blue" ? blueTeam : redTeam;
      const nextRole = ROLES.find(
        (r) => r !== role && !currentTeam[r] && r !== role
      );
      if (nextRole) {
        setActiveSlot({ team, role: nextRole, type: "pick" });
      } else {
        setActiveSlot(null);
      }
    } else if (type === "ban") {
      if (team === "blue") {
        setBlueBans((prev) => {
          const next = [...prev];
          next[banIndex] = champion;
          return next;
        });
      } else {
        setRedBans((prev) => {
          const next = [...prev];
          next[banIndex] = champion;
          return next;
        });
      }
      // Auto-advance to next empty ban slot
      const bans = team === "blue" ? blueBans : redBans;
      const nextEmpty = bans.findIndex((b, i) => i !== banIndex && b === null);
      if (nextEmpty !== -1) {
        setActiveSlot({ team, banIndex: nextEmpty, type: "ban" });
      } else {
        setActiveSlot(null);
      }
    }
  }, [activeSlot, blueTeam, redTeam, blueBans, redBans]);

  const handleReset = () => {
    setBlueTeam(emptyTeam());
    setRedTeam(emptyTeam());
    setBlueBans(emptyBans());
    setRedBans(emptyBans());
    setActiveSlot(null);
  };

  return (
    <div className="app">
      <header className="app-header">
        <div className="header-logo">
          <span className="logo-icon">⚔️</span>
          <span className="logo-text">RunePilot</span>
          <span className="logo-sub">Draft Analyzer</span>
        </div>
        <div className="header-actions">
          <button
            className={`mode-btn ${mode === "picks" ? "active" : ""}`}
            onClick={() => setMode("picks")}
          >
            🗡️ Pick Mode
          </button>
          <button
            className={`mode-btn ${mode === "bans" ? "active" : ""}`}
            onClick={() => setMode("bans")}
          >
            🚫 Ban Mode
          </button>
          <button className="reset-btn" onClick={handleReset}>
            🔄 Reset Draft
          </button>
        </div>
      </header>

      <main className="app-main">
        <section className="draft-section">
          <DraftBoard
            blueTeam={blueTeam}
            redTeam={redTeam}
            blueBans={blueBans}
            redBans={redBans}
            activeSlot={activeSlot}
            onSlotClick={handleSlotClick}
            onBanSlotClick={handleBanSlotClick}
          />
        </section>

        <section className="pool-section">
          <ChampionPool
            onSelect={handleChampionSelect}
            activeSlot={activeSlot}
            usedChampions={usedChampions}
            bannedChampions={bannedChampionIds}
          />
        </section>

        <section className="analysis-section-wrapper">
          <AnalysisPanel blueTeam={blueTeam} redTeam={redTeam} />
        </section>
      </main>

      <footer className="app-footer">
        <p>RunePilot v1.0 MVP — Data for educational purposes. Not affiliated with Riot Games.</p>
      </footer>
    </div>
  );
}
