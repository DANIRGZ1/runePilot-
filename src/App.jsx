import React, { useState, useCallback, useEffect, useRef } from "react";
import { AnimatePresence, motion } from "framer-motion";
import DraftBoard from "./components/DraftBoard";
import ChampionPool from "./components/ChampionPool";
import AnalysisPanel from "./components/AnalysisPanel";
import BuildPanel from "./components/BuildPanel";
import MatchAcceptBanner from "./components/MatchAcceptBanner";
import { lcuClient } from "./services/lcuClient";
import { getLatestVersion, getChampionKeyMap } from "./services/datadragon";
import { champions as allChampions } from "./data/champions";
import { Button } from "./components/ui/button";
import "./App.css";

const ROLES = ["TOP", "JUNGLE", "MID", "ADC", "SUPPORT"];
const MAX_BANS = 5;

const emptyTeam = () => ({ TOP: null, JUNGLE: null, MID: null, ADC: null, SUPPORT: null });
const emptyBans = () => Array(MAX_BANS).fill(null);

export default function App() {
  const [blueTeam, setBlueTeam] = useState(emptyTeam());
  const [redTeam, setRedTeam] = useState(emptyTeam());
  const [blueBans, setBlueBans] = useState(emptyBans());
  const [redBans, setRedBans] = useState(emptyBans());
  const [activeSlot, setActiveSlot] = useState(null);
  const [selectedChampion, setSelectedChampion] = useState(null); // for build panel
  const [matchEvent, setMatchEvent] = useState(null);
  const [lcuStatus, setLcuStatus] = useState('disconnected'); // 'connected' | 'disconnected' | 'unavailable'
  const [ddVersion, setDdVersion] = useState(null);
  const matchDismissTimer = useRef(null);

  // Load Data Dragon version on mount
  useEffect(() => {
    getLatestVersion().then(setDdVersion);
  }, []);

  // Connect to LCU backend
  useEffect(() => {
    lcuClient.connect();

    const off1 = lcuClient.on('ws_connected', () => {});
    const off2 = lcuClient.on('ws_disconnected', () => setLcuStatus('unavailable'));
    const off3 = lcuClient.on('initial_state', (msg) => {
      setLcuStatus(msg.lcuConnected ? 'connected' : 'disconnected');
    });
    const off4 = lcuClient.on('lcu_connected', () => setLcuStatus('connected'));
    const off5 = lcuClient.on('lcu_disconnected', () => setLcuStatus('disconnected'));
    const off6 = lcuClient.on('match_found', (msg) => {
      setMatchEvent({ type: 'match_found', timer: msg.timer || 12 });
      clearTimeout(matchDismissTimer.current);
      matchDismissTimer.current = setTimeout(() => setMatchEvent(null), 15000);
    });
    const off7 = lcuClient.on('match_accepted', () => {
      setMatchEvent({ type: 'match_accepted' });
      clearTimeout(matchDismissTimer.current);
      matchDismissTimer.current = setTimeout(() => setMatchEvent(null), 3000);
    });
    const off8 = lcuClient.on('match_declined', () => {
      setMatchEvent({ type: 'match_declined' });
      clearTimeout(matchDismissTimer.current);
      matchDismissTimer.current = setTimeout(() => setMatchEvent(null), 3000);
    });

    // LCU position → our role key
    const POS_MAP = { top: 'TOP', jungle: 'JUNGLE', mid: 'MID', bottom: 'ADC', utility: 'SUPPORT' };

    const off9 = lcuClient.on('champ_select_update', async (msg) => {
      const session = msg.session;
      if (!session) return;

      const keyMap = await getChampionKeyMap();

      // Find champion from LCU numeric ID
      const findChamp = (championId) => {
        if (!championId) return null;
        const name = keyMap[championId];
        if (!name) return null;
        return allChampions.find((c) => c.name.toLowerCase() === name) || null;
      };

      // Parse a list of LCU players into team state {TOP, JUNGLE, ...}
      const parseTeam = (players) => {
        const team = { TOP: null, JUNGLE: null, MID: null, ADC: null, SUPPORT: null };
        for (const p of players) {
          const role = POS_MAP[p.assignedPosition];
          const champ = findChamp(p.championId || p.championPickIntent);
          if (role && champ) team[role] = champ;
        }
        return team;
      };

      // Parse completed bans from actions
      const parseBans = (actions, teamIds) => {
        const bans = Array(5).fill(null);
        let i = 0;
        for (const group of (actions || [])) {
          for (const action of group) {
            if (action.type === 'ban' && action.completed && teamIds.has(action.actorCellId)) {
              const champ = findChamp(action.championId);
              if (champ && i < 5) bans[i++] = champ;
            }
          }
        }
        return bans;
      };

      const myTeam = session.myTeam || [];
      const theirTeam = session.theirTeam || [];
      const isBlue = myTeam[0]?.team === 1;

      const blueList = isBlue ? myTeam : theirTeam;
      const redList = isBlue ? theirTeam : myTeam;

      const blueIds = new Set(blueList.map((p) => p.cellId));
      const redIds = new Set(redList.map((p) => p.cellId));

      setBlueTeam(parseTeam(blueList));
      setRedTeam(parseTeam(redList));
      setBlueBans(parseBans(session.actions, blueIds));
      setRedBans(parseBans(session.actions, redIds));
      setActiveSlot(null);
    });

    return () => {
      [off1, off2, off3, off4, off5, off6, off7, off8, off9].forEach((off) => off());
      lcuClient.disconnect();
      clearTimeout(matchDismissTimer.current);
    };
  }, []);

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
    setActiveSlot({ team, role, type: "pick" });
    setSelectedChampion(null);
  }, []);

  const handleBanSlotClick = useCallback(
    (team) => {
      const bans = team === "blue" ? blueBans : redBans;
      const emptyIndex = bans.findIndex((b) => b === null);
      if (emptyIndex === -1) return;
      setActiveSlot({ team, banIndex: emptyIndex, type: "ban" });
      setSelectedChampion(null);
    },
    [blueBans, redBans]
  );

  const handleChampionSelect = useCallback(
    (champion) => {
      if (!activeSlot) {
        // No active slot — show builds for this champion
        setSelectedChampion((prev) => (prev?.id === champion.id ? null : champion));
        return;
      }
      const { team, role, banIndex, type } = activeSlot;

      if (type === "pick") {
        const setTeam = team === "blue" ? setBlueTeam : setRedTeam;
        setTeam((prev) => ({ ...prev, [role]: champion }));
        const currentTeam = team === "blue" ? blueTeam : redTeam;
        const nextRole = ROLES.find((r) => r !== role && !currentTeam[r]);
        setActiveSlot(nextRole ? { team, role: nextRole, type: "pick" } : null);
      } else {
        const setBans = team === "blue" ? setBlueBans : setRedBans;
        setBans((prev) => {
          const next = [...prev];
          next[banIndex] = champion;
          return next;
        });
        const bans = team === "blue" ? blueBans : redBans;
        const nextEmpty = bans.findIndex((b, i) => i !== banIndex && b === null);
        setActiveSlot(nextEmpty !== -1 ? { team, banIndex: nextEmpty, type: "ban" } : null);
      }
    },
    [activeSlot, blueTeam, redTeam, blueBans, redBans]
  );

  const handlePickedChampionClick = useCallback((champion) => {
    setSelectedChampion((prev) => (prev?.id === champion.id ? null : champion));
    setActiveSlot(null);
  }, []);

  const handleReset = () => {
    setBlueTeam(emptyTeam());
    setRedTeam(emptyTeam());
    setBlueBans(emptyBans());
    setRedBans(emptyBans());
    setActiveSlot(null);
    setSelectedChampion(null);
  };

  const lcuDot = {
    connected: { color: '#52b788', label: 'LoL Client Connected' },
    disconnected: { color: '#f59e0b', label: 'Waiting for LoL Client...' },
    unavailable: { color: '#64748b', label: 'Backend offline (run npm run server)' },
  }[lcuStatus];

  return (
    <div className="app">
      {matchEvent && (
        <MatchAcceptBanner
          event={matchEvent}
          onDismiss={() => setMatchEvent(null)}
        />
      )}

      <header className="app-header">
        <div className="header-logo">
          <span className="logo-icon">⚔️</span>
          <span className="logo-text">RunePilot</span>
          <span className="logo-sub">Draft Analyzer</span>
        </div>
        <div className="header-right">
          <div className="lcu-status" title={lcuDot.label}>
            <span className="lcu-dot" style={{ background: lcuDot.color }} />
            <span className="lcu-label">{lcuDot.label}</span>
          </div>
          {ddVersion && (
            <span className="patch-badge">Patch {ddVersion.split('.').slice(0, 2).join('.')}</span>
          )}
          <Button
            variant="outline"
            size="sm"
            onClick={handleReset}
            className="border-[var(--rp-border)] text-[var(--rp-muted)] bg-transparent hover:text-[var(--red)] hover:border-[var(--red)] hover:bg-transparent text-xs h-7"
          >
            Reset
          </Button>
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
            onChampionClick={handlePickedChampionClick}
            ddVersion={ddVersion}
          />
        </section>

        <section className="pool-section">
          <ChampionPool
            onSelect={handleChampionSelect}
            activeSlot={activeSlot}
            usedChampions={usedChampions}
            bannedChampions={bannedChampionIds}
            ddVersion={ddVersion}
          />
        </section>

        <section className="analysis-section-wrapper">
          <AnimatePresence mode="wait">
            {selectedChampion ? (
              <BuildPanel
                key={selectedChampion.id}
                champion={selectedChampion}
                onClose={() => setSelectedChampion(null)}
              />
            ) : (
              <motion.div
                key="analysis"
                initial={{ opacity: 0, x: -30 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -30 }}
                transition={{ type: 'spring', stiffness: 350, damping: 30 }}
              >
                <AnalysisPanel blueTeam={blueTeam} redTeam={redTeam} />
              </motion.div>
            )}
          </AnimatePresence>
        </section>
      </main>
    </div>
  );
}
