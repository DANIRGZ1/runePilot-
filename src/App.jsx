import React, { useState, useCallback, useEffect, useRef, useMemo } from "react";
import { AnimatePresence, motion } from "framer-motion";
import RunePilotLogo from "./components/RunePilotLogo";
import Sidebar from "./components/Sidebar";
import TopBar from "./components/TopBar";
import HomeView from "./components/HomeView";
import DraftBoard from "./components/DraftBoard";
import ChampionPool from "./components/ChampionPool";
import AnalysisPanel from "./components/AnalysisPanel";
import BuildPanel from "./components/BuildPanel";
import MatchAcceptBanner from "./components/MatchAcceptBanner";
import OverlayView from "./components/OverlayView";
import PostGameView from "./components/PostGameView";
import LiveGameView from "./components/LiveGameView";
import WelcomeBanner from "./components/WelcomeBanner";
import MetaPatchView from "./components/MetaPatchView";
import { ChampionsView, CountersView, RunasView, WinratesView, PosicionView, GuiasView } from "./components/SectionViews";
import { lcuClient, PHASE } from "./services/lcuClient";
import { getLatestVersion } from "./services/datadragon";
import { getAllChampions, getChampionByLcuKey } from "./services/championsService";
import { getBuild } from "./data/builds";
import { buildRunePayload } from "./services/runesService";
import "./App.css";

const ROLES = ["TOP", "JUNGLE", "MID", "ADC", "SUPPORT"];
const MAX_BANS = 5;
const POS_MAP = { top: 'TOP', jungle: 'JUNGLE', mid: 'MID', middle: 'MID', bottom: 'ADC', utility: 'SUPPORT' };

const emptyTeam = () => ({ TOP: null, JUNGLE: null, MID: null, ADC: null, SUPPORT: null });
const emptyBans = () => Array(MAX_BANS).fill(null);

/* ── Startup Splash Screen ── */
function StartupSplash({ onDone }) {
  const [phase, setPhase] = useState(0); // 0=loading, 1=fading out
  useEffect(() => {
    const t1 = setTimeout(() => setPhase(1), 2200);
    const t2 = setTimeout(() => onDone(), 2900);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, [onDone]);

  return (
    <motion.div
      initial={{ opacity: 1 }}
      animate={{ opacity: phase === 1 ? 0 : 1 }}
      transition={{ duration: 0.7, ease: 'easeInOut' }}
      style={{
        position: 'fixed', inset: 0, zIndex: 9999,
        background: 'var(--rp-bg)',
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center', gap: 40,
      }}
    >
      {/* Logo */}
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
        style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 18 }}
      >
        <RunePilotLogo size={120} spin color="var(--rp-gold)" />
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 28, fontWeight: 800, color: 'var(--rp-text)', letterSpacing: '-0.5px' }}>
            RunePilot
          </div>
          <div style={{ fontSize: 11, color: 'var(--rp-gold)', letterSpacing: 3, textTransform: 'uppercase', marginTop: 4, fontWeight: 600 }}>
            Tu guía definitiva en el Rift
          </div>
        </div>
      </motion.div>

      {/* Loading bar */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3, duration: 0.4 }}
        style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}
      >
        <div style={{ width: 0, height: 0 }} />

        <div style={{ width: 104, height: 2, background: 'var(--rp-border)', borderRadius: 1, overflow: 'hidden' }}>
          <motion.div
            animate={{ x: ['-100%', '100%'] }}
            transition={{ duration: 1.4, repeat: Infinity, ease: 'easeInOut' }}
            style={{ width: '60%', height: '100%', background: 'var(--rp-gold)', borderRadius: 1 }}
          />
        </div>

        <motion.p
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 2, repeat: Infinity }}
          style={{ fontSize: 13, color: 'var(--rp-text-muted)', margin: 0, letterSpacing: 0.5 }}
        >
          Iniciando RunePilot...
        </motion.p>
      </motion.div>

      {/* Version */}
      <div style={{ position: 'absolute', bottom: 24, fontSize: 11, color: 'var(--rp-text-sub)', letterSpacing: 1 }}>
        v2.3.1
      </div>
    </motion.div>
  );
}

export default function App() {
  const [splashDone, setSplashDone] = useState(false);
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
  const [champSelectActive, setChampSelectActive] = useState(false);
  const [playerData, setPlayerData] = useState(null); // { summoner, ranked, history }
  const [darkMode, setDarkMode] = useState(() => {
    try { return JSON.parse(localStorage.getItem('rp_darkMode') ?? 'false'); }
    catch { return false; }
  });
  const [welcomeShown, setWelcomeShown] = useState(false);
  const [gameflowPhase, setGameflowPhase] = useState(PHASE.NONE);
  const [liveGameData, setLiveGameData] = useState(null);
  const [isLocalBlue, setIsLocalBlue] = useState(true); // tracks which side is mine
  const [eogData, setEogData] = useState(null);         // raw EOG stats block
  const [liveEvents, setLiveEvents] = useState([]);     // accumulated game events
  const [showPostGame, setShowPostGame] = useState(false);
  const lastAutoImportedRef = useRef(null);
  const matchDismissTimer  = useRef(null);

  // Champion object del jugador local (derivado de localLockedChampId)
  const localChamp = useMemo(() => {
    if (!localLockedChampId || !championsList.length) return null;
    return championsList.find(c => c.lcuKey === localLockedChampId) || null;
  }, [localLockedChampId, championsList]);
  const importToastTimer = useRef(null);

  const retryTimerRef = useRef(null);

  const fetchPlayerData = useCallback(async (attempt = 0) => {
    try {
      const [sumRes, rankRes, histRes] = await Promise.allSettled([
        fetch('http://localhost:3001/lcu/summoner').then(r => r.json()),
        fetch('http://localhost:3001/lcu/ranked').then(r => r.json()),
        fetch('http://localhost:3001/lcu/history').then(r => r.json()),
      ]);

      const summoner = sumRes.status === 'fulfilled' ? sumRes.value : null;

      // If no displayName, the LCU API returned an error — retry up to 5 times
      if (!summoner?.displayName) {
        if (attempt < 5) {
          retryTimerRef.current = setTimeout(() => fetchPlayerData(attempt + 1), 2000);
        }
        return;
      }

      setPlayerData({
        summoner,
        ranked:  rankRes.status === 'fulfilled' ? rankRes.value : null,
        history: histRes.status === 'fulfilled' ? histRes.value : null,
      });
      // Mostrar bienvenida solo la primera vez por sesión
      setWelcomeShown(prev => !prev ? true : prev);
    } catch {
      if (attempt < 5) {
        retryTimerRef.current = setTimeout(() => fetchPlayerData(attempt + 1), 2000);
      }
    }
  }, []);

  useEffect(() => {
    getLatestVersion().then(setDdVersion);
    getAllChampions().then(setChampionsList);
  }, []);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', darkMode ? 'dark' : 'light');
    localStorage.setItem('rp_darkMode', JSON.stringify(darkMode));
  }, [darkMode]);

  useEffect(() => {
    lcuClient.connect();

    const off1 = lcuClient.on('ws_connected', () => {});
    const off2 = lcuClient.on('ws_disconnected', () => setLcuStatus('unavailable'));
    const off3 = lcuClient.on('initial_state', (msg) => {
      setLcuStatus(msg.lcuConnected ? 'connected' : 'disconnected');
      if (msg.lcuConnected) fetchPlayerData();
    });
    const off4 = lcuClient.on('lcu_connected', () => { setLcuStatus('connected'); fetchPlayerData(); });
    const off5 = lcuClient.on('lcu_disconnected', () => { setLcuStatus('disconnected'); setChampSelectActive(false); });
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

    const offPhase = lcuClient.on('gameflow_phase', (msg) => {
      const phase = msg.phase || PHASE.NONE;
      setGameflowPhase(phase);
      // Clear champ select when leaving it
      if (![PHASE.CHAMP_SELECT, PHASE.GAME_START, PHASE.IN_PROGRESS].includes(phase)) {
        setChampSelectActive(false);
      }
      // Auto-navigate to live view when game starts
      if (phase === PHASE.IN_PROGRESS) {
        setActiveView('draft');
      }
      // Auto-show post-game overlay on end phases
      if ([PHASE.WAITING_FOR_STATS, PHASE.PRE_END_OF_GAME, PHASE.END_OF_GAME].includes(phase)) {
        setShowPostGame(true);
      }
      // Reset post-game when going back to lobby
      if (phase === PHASE.NONE || phase === PHASE.LOBBY) {
        setShowPostGame(false);
        setEogData(null);
        setLiveEvents([]);
      }
    });

    const offLiveStart  = lcuClient.on('live_game_start',  (msg) => { setLiveGameData(msg.gameData); setLiveEvents([]); });
    const offLiveUpdate = lcuClient.on('live_game_update',  (msg) => setLiveGameData(msg.gameData));
    const offLiveEnd    = lcuClient.on('live_game_ended',   ()    => setLiveGameData(null));
    const offLiveEvts   = lcuClient.on('live_game_events',  (msg) => setLiveEvents(prev => [...prev, ...(msg.events || [])]));
    const offEOG        = lcuClient.on('end_of_game',       (msg) => {
      setEogData(msg.eog);
      setShowPostGame(true);
    });

    const off9 = lcuClient.on('champ_select_update', async (msg) => {
      const session = msg.session;
      if (!session) return;
      setChampSelectActive(true);

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
      setIsLocalBlue(isBlue);

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
      [off1, off2, off3, off4, off5, off6, off7, off8, off9,
       offPhase, offLiveStart, offLiveUpdate, offLiveEnd, offLiveEvts, offEOG].forEach((off) => off());
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

  const renderDraftView = () => {
    // During active game → show live scoreboard
    if (gameflowPhase === PHASE.IN_PROGRESS) {
      return (
        <LiveGameView
          liveGameData={liveGameData}
          liveEvents={liveEvents}
          playerData={playerData}
          ddVersion={ddVersion}
        />
      );
    }

    if (!champSelectActive) return (
      <div className="draft-waiting">
        <div className="draft-waiting-inner">
          <svg viewBox="0 0 80 80" width="72" height="72" fill="none">
            {/* Escudo LoL */}
            <path d="M40 8 L68 20 L68 44 Q68 62 40 74 Q12 62 12 44 L12 20 Z"
              stroke="var(--rp-gold)" strokeWidth="1.5" fill="var(--rp-surface)" opacity="0.9"/>
            <path d="M40 18 L58 27 L58 43 Q58 56 40 64 Q22 56 22 43 L22 27 Z"
              stroke="var(--rp-gold)" strokeWidth="1" fill="none" opacity="0.4"/>
            <circle cx="40" cy="41" r="7" fill="var(--rp-gold)" opacity="0.85"/>
            <line x1="40" y1="18" x2="40" y2="34" stroke="var(--rp-gold)" strokeWidth="1.2" opacity="0.5"/>
            <line x1="58" y1="27" x2="47" y2="37" stroke="var(--rp-gold)" strokeWidth="1.2" opacity="0.5"/>
            <line x1="58" y1="43" x2="46" y2="44" stroke="var(--rp-gold)" strokeWidth="1.2" opacity="0.5"/>
            <line x1="22" y1="43" x2="34" y2="44" stroke="var(--rp-gold)" strokeWidth="1.2" opacity="0.5"/>
            <line x1="22" y1="27" x2="33" y2="37" stroke="var(--rp-gold)" strokeWidth="1.2" opacity="0.5"/>
          </svg>
          <div className="draft-waiting-title">Esperando selección de campeón</div>
          <div className="draft-waiting-sub">
            El tablero de draft aparecerá automáticamente<br/>cuando comience la selección de campeones en el cliente de League.
          </div>
          <div className="draft-waiting-status">
            {lcuStatus === 'connected'
              ? <><span className="dw-dot connected"/>Conectado al cliente — en espera de partida</>
              : <><span className="dw-dot"/>Cliente de League no detectado</>
            }
          </div>
        </div>
      </div>
    );
    return (
      <OverlayView
        champions={championsList}
        assignedPosition={assignedPosition}
        localChamp={localChamp}
        blueTeam={blueTeam}
        redTeam={redTeam}
        myTeam={isLocalBlue ? blueTeam : redTeam}
        enemyTeam={isLocalBlue ? redTeam : blueTeam}
        ddVersion={ddVersion}
        onSelectChampion={handleChampionSelect}
        onReset={handleReset}
        importToast={importToast}
        onImportToast={setImportToast}
        darkMode={darkMode}
        onToggleDark={() => setDarkMode(d => !d)}
      />
    );
  };

  const viewProps = { champions: championsList, ddVersion, playerData };

  const renderContent = () => {
    switch (activeView) {
      case 'inicio':
        return <HomeView ddVersion={ddVersion} playerData={playerData} lcuStatus={lcuStatus} onRetry={() => fetchPlayerData(0)} />;
      case 'draft':
      case 'importar':
        return renderDraftView();
      case 'meta':
        return <MetaPatchView ddVersion={ddVersion} playerData={playerData} />;
      case 'campeones':
        return <ChampionsView {...viewProps} />;
      case 'counters':
        return <CountersView {...viewProps} />;
      case 'runas':
        return <RunasView {...viewProps} />;
      case 'winrates':
        return <WinratesView {...viewProps} />;
      case 'posicion':
        return <PosicionView {...viewProps} />;
      case 'guias':
        return <GuiasView {...viewProps} />;
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
      <AnimatePresence>
        {!splashDone && <StartupSplash key="splash" onDone={() => setSplashDone(true)} />}
      </AnimatePresence>

      {/* Bienvenida al invocador cuando el LCU conecta y carga datos */}
      {welcomeShown && playerData?.summoner && (
        <WelcomeBanner
          playerData={playerData}
          onDismiss={() => setWelcomeShown(false)}
        />
      )}

      {matchEvent && (
        <MatchAcceptBanner
          event={matchEvent}
          onDismiss={() => setMatchEvent(null)}
        />
      )}

      {/* Post-game analysis overlay */}
      <AnimatePresence>
        {showPostGame && eogData && (
          <motion.div
            key="postgame"
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 24 }}
            transition={{ duration: 0.25 }}
            style={{
              position: 'fixed', inset: 0, zIndex: 200,
              background: 'var(--rp-bg)',
              display: 'flex', flexDirection: 'column',
            }}
          >
            <PostGameView
              eogData={eogData}
              liveEvents={liveEvents}
              playerData={playerData}
              ddVersion={ddVersion}
              role={assignedPosition}
              onClose={() => setShowPostGame(false)}
            />
          </motion.div>
        )}
      </AnimatePresence>

      <Sidebar
        activeView={activeView}
        onNavigate={setActiveView}
        lcuStatus={lcuStatus}
        version={ddVersion ? `v${ddVersion.split('.').slice(0,2).join('.')}` : 'v2.3.1'}
        darkMode={darkMode}
        onToggleDark={() => setDarkMode(d => !d)}
        gameflowPhase={gameflowPhase}
      />

      <div className="app-content">
        <TopBar
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          activeRegion={activeRegion}
          onRegionChange={setActiveRegion}
          ddVersion={ddVersion}
          darkMode={darkMode}
          onToggleDark={() => setDarkMode(d => !d)}
          autoImportEnabled={autoImportEnabled}
          onToggleAutoImport={() => {
            setAutoImportEnabled(v => {
              const next = !v;
              localStorage.setItem('rp_autoImport', JSON.stringify(next));
              return next;
            });
          }}
        />

        <main className="app-main-content">
          {renderContent()}
        </main>
      </div>
    </div>
  );
}
