import React, { useState, useCallback, useEffect, useRef } from "react";
import { AnimatePresence, motion } from "framer-motion";
import Sidebar from "./components/Sidebar";
import TopBar from "./components/TopBar";
import HomeView from "./components/HomeView";
import DraftBoard from "./components/DraftBoard";
import ChampionPool from "./components/ChampionPool";
import AnalysisPanel from "./components/AnalysisPanel";
import BuildPanel from "./components/BuildPanel";
import MatchAcceptBanner from "./components/MatchAcceptBanner";
import { lcuClient } from "./services/lcuClient";
import { getLatestVersion } from "./services/datadragon";
import { getAllChampions, getChampionByLcuKey } from "./services/championsService";
import { getBuild } from "./data/builds";
import { buildRunePayload } from "./services/runesService";
import "./App.css";

const ROLES = ["TOP", "JUNGLE", "MID", "ADC", "SUPPORT"];
const MAX_BANS = 5;
const POS_MAP = { top: 'TOP', jungle: 'JUNGLE', mid: 'MID', bottom: 'ADC', utility: 'SUPPORT' };

const emptyTeam = () => ({ TOP: null, JUNGLE: null, MID: null, ADC: null, SUPPORT: null });
const emptyBans = () => Array(MAX_BANS).fill(null);

export default function App() {
  const [activeView, setActiveView] = useState('inicio');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeRegion, setActiveRegion] = useState('EUW');

  const [blueTeam, setBlueTeam] = useState(emptyTeam());
  const [redTeam, setRedTeam] = useState(emptyTeam());
  const [blueBans, setBlueBans] = useState(emptyBans());
  const [redBans, setRedBans] = useState(emptyBans());
  const [activeSlot, setActiveSlot] = useState(null);
  const [selectedChampion, setSelectedChampion] = useState(null);
  const [matchEvent, setMatchEvent] = useState(null);
  const [lcuStatus, setLcuStatus] = useState('disconnected');
  const [ddVersion, setDdVersion] = useState(null);
  const [championsList, setChampionsList] = useState([]);
  const [assignedPosition, setAssignedPosition] = useState(null);
  const [localLockedChampId, setLocalLockedChampId] = useState(null);
  const [autoImportEnabled, setAutoImportEnabled] = useState(() => {
    try { return JSON.parse(localStorage.getItem('rp_autoImport') ?? 'true'); }
    catch { return true; }
  });
  const [importToast, setImportToast] = useState(null); // null | 'importing' | 'ok' | 'err'
  const lastAutoImportedRef = useRef(null);
  const matchDismissTimer = useRef(null);
  const importToastTimer = useRef(null);

  useEffect(() => {
    getLatestVersion().then(setDdVersion);
    getAllChampions().then(setChampionsList);
  }, []);

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

    const off9 = lcuClient.on('champ_select_update', async (msg) => {
      const session = msg.session;
      if (!session) return;

      const findChamp = async (championId) => {
        if (!championId) return null;
        return await getChampionByLcuKey(championId);
      };

      const parseTeam = async (players) => {
        const team = { TOP: null, JUNGLE: null, MID: null, ADC: null, SUPPORT: null };
        for (const p of players) {
          const role = POS_MAP[p.assignedPosition];
          const champ = await findChamp(p.championId || p.championPickIntent);
          if (role && champ) team[role] = champ;
        }
        return team;
      };

      const parseBans = async (actions, teamIds) => {
        const bans = Array(5).fill(null);
        let i = 0;
        for (const group of (actions || [])) {
          for (const action of group) {
            if (action.type === 'ban' && action.completed && teamIds.has(action.actorCellId)) {
              const champ = await findChamp(action.championId);
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

      const localCellId = session.localPlayerCellId;
      const localPlayer = [...myTeam].find((p) => p.cellId === localCellId);
      const myPos = localPlayer ? POS_MAP[localPlayer.assignedPosition] : null;
      if (myPos) setAssignedPosition(myPos);
      if (localPlayer?.championId) setLocalLockedChampId(localPlayer.championId);

      const [newBlue, newRed, newBlueBans, newRedBans] = await Promise.all([
        parseTeam(blueList),
        parseTeam(redList),
        parseBans(session.actions, blueIds),
        parseBans(session.actions, redIds),
      ]);

      setBlueTeam(newBlue);
      setRedTeam(newRed);
      setBlueBans(newBlueBans);
      setRedBans(newRedBans);
      setActiveSlot(null);

      // Auto-navigate to draft when champ select is detected
      setActiveView('draft');
    });

    return () => {
      [off1, off2, off3, off4, off5, off6, off7, off8, off9].forEach((off) => off());
      lcuClient.disconnect();
      clearTimeout(matchDismissTimer.current);
    };
  }, []);

  // Auto-import runes when local player locks a champion
  useEffect(() => {
    if (!localLockedChampId || !autoImportEnabled) return;
    if (lastAutoImportedRef.current === localLockedChampId) return;
    lastAutoImportedRef.current = localLockedChampId;

    (async () => {
      const champion = await getChampionByLcuKey(localLockedChampId);
      if (!champion) return;
      const build = getBuild(champion.id);
      if (!build) return;

      clearTimeout(importToastTimer.current);
      setImportToast('importing');
      try {
        const payload = await buildRunePayload(build.runes, champion.name);
        if (!payload) { setImportToast('err'); importToastTimer.current = setTimeout(() => setImportToast(null), 3500); return; }
        const res = await fetch('http://localhost:3001/lcu/runes', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
        setImportToast(res.ok ? 'ok' : 'err');
      } catch {
        setImportToast('err');
      }
      importToastTimer.current = setTimeout(() => setImportToast(null), 4000);
    })();
  }, [localLockedChampId, autoImportEnabled]);

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

  const handleBanSlotClick = useCallback((team) => {
    const bans = team === "blue" ? blueBans : redBans;
    const emptyIndex = bans.findIndex((b) => b === null);
    if (emptyIndex === -1) return;
    setActiveSlot({ team, banIndex: emptyIndex, type: "ban" });
    setSelectedChampion(null);
  }, [blueBans, redBans]);

  const handleChampionSelect = useCallback((champion) => {
    if (!activeSlot) {
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
  }, [activeSlot, blueTeam, redTeam, blueBans, redBans]);

  const handlePickedChampionClick = useCallback((champion) => {
    setSelectedChampion((prev) => (prev?.id === champion.id ? null : champion));
    setActiveSlot(null);
  }, []);

  const handleToggleAutoImport = () => {
    setAutoImportEnabled(prev => {
      const next = !prev;
      localStorage.setItem('rp_autoImport', JSON.stringify(next));
      return next;
    });
  };

  const handleReset = () => {
    setBlueTeam(emptyTeam());
    setRedTeam(emptyTeam());
    setBlueBans(emptyBans());
    setRedBans(emptyBans());
    setActiveSlot(null);
    setSelectedChampion(null);
    setAssignedPosition(null);
    setLocalLockedChampId(null);
    lastAutoImportedRef.current = null;
    setImportToast(null);
  };

  const renderDraftView = () => (
    <div className="draft-layout">
      <div className="draft-main">
        <div className="draft-top-bar">
          <h2 className="draft-view-title">Draft Analyzer</h2>
          {assignedPosition && (
            <span className="assigned-pos-badge">🎯 {assignedPosition}</span>
          )}
          {importToast && (
            <span className={`import-toast import-toast-${importToast}`}>
              {importToast === 'importing' && '⏳ Importando runas…'}
              {importToast === 'ok'        && '✅ Runas importadas'}
              {importToast === 'err'       && '❌ Error al importar'}
            </span>
          )}
          <button
            className={`auto-import-toggle ${autoImportEnabled ? 'enabled' : 'disabled'}`}
            onClick={handleToggleAutoImport}
            title={autoImportEnabled ? 'Auto-importación activada — click para desactivar' : 'Auto-importación desactivada — click para activar'}
          >
            {autoImportEnabled ? '📥 Auto ON' : '📥 Auto OFF'}
          </button>
          <button className="reset-btn-new" onClick={handleReset}>Resetear</button>
        </div>
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
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ type: 'spring', stiffness: 350, damping: 30 }}
              >
                <AnalysisPanel blueTeam={blueTeam} redTeam={redTeam} />
              </motion.div>
            )}
          </AnimatePresence>
        </section>
      </div>
      <aside className="pool-section">
        <ChampionPool
          champions={championsList}
          onSelect={handleChampionSelect}
          activeSlot={activeSlot}
          usedChampions={usedChampions}
          bannedChampions={bannedChampionIds}
          ddVersion={ddVersion}
          assignedPosition={assignedPosition}
        />
      </aside>
    </div>
  );

  const renderContent = () => {
    switch (activeView) {
      case 'inicio':
        return <HomeView ddVersion={ddVersion} />;
      case 'draft':
      case 'importar':
        return renderDraftView();
      default:
        return (
          <div className="placeholder-view">
            <div className="placeholder-icon">🚧</div>
            <h2>Próximamente</h2>
            <p>Esta sección está en desarrollo.</p>
          </div>
        );
    }
  };

  return (
    <div className="app-wrapper">
      {matchEvent && (
        <MatchAcceptBanner
          event={matchEvent}
          onDismiss={() => setMatchEvent(null)}
        />
      )}

      <Sidebar
        activeView={activeView}
        onNavigate={setActiveView}
        lcuStatus={lcuStatus}
        version={ddVersion ? `v${ddVersion.split('.').slice(0,2).join('.')}` : 'v2.3.1'}
      />

      <div className="app-content">
        <TopBar
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          activeRegion={activeRegion}
          onRegionChange={setActiveRegion}
          ddVersion={ddVersion}
        />

        <main className="app-main-content">
          {renderContent()}
        </main>
      </div>
    </div>
  );
}
