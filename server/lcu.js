/**
 * LCU (League Client Update) API Integration
 *
 * Uses Riot's official local League Client API.
 * Policy: https://www.riotgames.com/en/DevRel/api-policy
 * This is a local-only integration — no external requests, no data collection.
 *
 * Detection strategy (Windows-first, layered):
 *  1. fs.watch on known lockfile parent directories → instant detect on open/close
 *  2. Periodic 5s poll fallback for edge cases (e.g. non-standard install paths)
 *  3. LCU WebSocket subscription for real-time event push (WAMP protocol)
 *  4. HTTP polling for state-on-connect (WS only fires on changes, not current state)
 *
 * Game phase state machine:
 *  None → Lobby → Matchmaking → ReadyCheck → ChampSelect → GameStart
 *       → InProgress → WaitingForStats → PreEndOfGame → EndOfGame → None
 *
 * During InProgress the LCU WebSocket stays connected but provides no game data.
 * Real-time in-game data comes from the separate Live Client Data API (liveClient.js).
 */

const fs   = require('fs');
const path = require('path');
const https = require('https');
const WebSocket = require('ws');

/* ══════════════════════════════════════════════════════════════════════════
   Lockfile paths — ordered by likelihood on a typical Windows install
══════════════════════════════════════════════════════════════════════════ */

const LOCKFILE_PATHS = [
  // Standard Windows installs
  path.join('C:\\Riot Games', 'League of Legends', 'lockfile'),
  path.join(process.env.LOCALAPPDATA  || '', 'Riot Games', 'League of Legends', 'lockfile'),
  path.join(process.env.PROGRAMFILES  || 'C:\\Program Files', 'Riot Games', 'League of Legends', 'lockfile'),
  path.join(process.env.PROGRAMFILES  || 'C:\\Program Files (x86)', 'Riot Games', 'League of Legends', 'lockfile'),
  // macOS
  '/Applications/League of Legends.app/Contents/LoL/lockfile',
  // Linux / Wine
  path.join(process.env.HOME || '', 'Games', 'league-of-legends', 'drive_c', 'Riot Games', 'League of Legends', 'lockfile'),
];

// Unique parent directories to watch for lockfile appearance
const WATCH_DIRS = [
  ...new Set(
    LOCKFILE_PATHS
      .map((p) => { try { return path.dirname(p); } catch { return null; } })
      .filter(Boolean)
  ),
];

/* ══════════════════════════════════════════════════════════════════════════
   LCU WebSocket event subscriptions
══════════════════════════════════════════════════════════════════════════ */

const SUBSCRIPTIONS = [
  'OnJsonApiEvent_lol-gameflow_v1_gameflow-phase',   // phase transitions
  'OnJsonApiEvent_lol-champ-select_v1_session',       // champ select updates
  'OnJsonApiEvent_lol-matchmaking_v1_ready-check',    // match found / accept
  'OnJsonApiEvent_lol-end-of-game_v1_eog-stats-block', // post-game stats
  'OnJsonApiEvent_lol-lobby_v2_lobby',                // lobby changes
];

/* ══════════════════════════════════════════════════════════════════════════
   Helpers
══════════════════════════════════════════════════════════════════════════ */

function findLockfile() {
  for (const p of LOCKFILE_PATHS) {
    try {
      if (p && fs.existsSync(p)) return p;
    } catch {}
  }
  return null;
}

function parseLockfile(content) {
  const [name, pid, port, password, protocol] = content.trim().split(':');
  return { name, pid: parseInt(pid), port: parseInt(port), password, protocol };
}

/* ══════════════════════════════════════════════════════════════════════════
   LCUClient
══════════════════════════════════════════════════════════════════════════ */

class LCUClient {
  constructor(onEvent) {
    this.onEvent     = onEvent;
    this.ws          = null;
    this.credentials = null;
    this.connected   = false;

    // Reconnect / poll timer
    this._pollTimer  = null;

    // fs.watch handles for lockfile parent directories
    this._dirWatchers = [];

    // Cached state sent to newly connected frontend clients
    this.currentPhase   = 'None';
    this.currentSession = null; // latest champ-select session
    this.currentLobby   = null;
  }

  /* ── Public API ────────────────────────────────────────────────────── */

  start() {
    this._watchDirs();   // instant detection via fs.watch
    this._tryConnect();  // initial attempt + poll fallback
  }

  stop() {
    this._clearPollTimer();
    this._stopDirWatchers();
    if (this.ws) { this.ws.terminate(); this.ws = null; }
  }

  lcuGet(endpoint)        { return this._lcuRequest('GET', endpoint); }
  lcuPost(endpoint, body) { return this._lcuRequest('POST', endpoint, body); }
  lcuDelete(endpoint)     { return this._lcuRequest('DELETE', endpoint); }

  /* ── Directory watchers (instant lockfile detection) ───────────────── */

  _watchDirs() {
    for (const dir of WATCH_DIRS) {
      try {
        if (!fs.existsSync(dir)) continue;
        const w = fs.watch(dir, (event, filename) => {
          if (filename === 'lockfile') {
            // Small delay so the lockfile is fully written before we read it
            setTimeout(() => this._tryConnect(), 250);
          }
        });
        w.on('error', () => {}); // suppress EPERM etc.
        this._dirWatchers.push(w);
      } catch {}
    }
  }

  _stopDirWatchers() {
    for (const w of this._dirWatchers) { try { w.close(); } catch {} }
    this._dirWatchers = [];
  }

  /* ── Connection management ─────────────────────────────────────────── */

  _clearPollTimer() {
    if (this._pollTimer) { clearTimeout(this._pollTimer); this._pollTimer = null; }
  }

  _schedulePoll(delay = 5000) {
    this._clearPollTimer();
    this._pollTimer = setTimeout(() => this._tryConnect(), delay);
  }

  _tryConnect() {
    if (this.connected) return; // already connected

    const lockfilePath = findLockfile();
    if (!lockfilePath) {
      this._schedulePoll(5000); // retry in 5s
      return;
    }

    try {
      const content    = fs.readFileSync(lockfilePath, 'utf8');
      this.credentials = parseLockfile(content);
      this._connectWS();
    } catch {
      this._schedulePoll(5000);
    }
  }

  _connectWS() {
    const { port, password } = this.credentials;
    const auth = Buffer.from(`riot:${password}`).toString('base64');

    const ws = new WebSocket(`wss://127.0.0.1:${port}`, {
      headers: { Authorization: `Basic ${auth}` },
      rejectUnauthorized: false, // LCU uses a self-signed TLS certificate
    });

    ws.on('open', () => {
      this.connected = true;
      this._clearPollTimer();
      console.log('[LCU] Connected to League Client');
      this.onEvent({ type: 'lcu_connected' });

      // Subscribe to all relevant events
      for (const event of SUBSCRIPTIONS) {
        ws.send(JSON.stringify([5, event]));
      }

      // Immediately fetch current state (WS only fires on future changes)
      this._pollCurrentState();
    });

    ws.on('message', (data) => {
      try {
        const msg = JSON.parse(data.toString());
        // WAMP push: [8, eventName, eventData]
        if (msg[0] === 8) this._handleLCUEvent(msg[1], msg[2]);
      } catch {}
    });

    ws.on('close', () => {
      this.connected   = false;
      this.credentials = null;
      console.log('[LCU] Disconnected from League Client');
      this.onEvent({ type: 'lcu_disconnected' });
      // Fall back to poll; dir watchers handle instant re-detection
      this._schedulePoll(5000);
    });

    ws.on('error', () => ws.terminate());

    this.ws = ws;
  }

  /* ── HTTP helper ───────────────────────────────────────────────────── */

  _lcuRequest(method, endpoint, body) {
    const { port, password } = this.credentials;
    const auth   = Buffer.from(`riot:${password}`).toString('base64');
    const data   = body ? JSON.stringify(body) : null;

    return new Promise((resolve, reject) => {
      const options = {
        hostname: '127.0.0.1',
        port,
        path: endpoint,
        method,
        headers: {
          Authorization:   `Basic ${auth}`,
          'Content-Type':  'application/json',
          ...(data ? { 'Content-Length': Buffer.byteLength(data) } : {}),
        },
        rejectUnauthorized: false,
      };
      const req = https.request(options, (res) => {
        let b = '';
        res.on('data', (d) => (b += d));
        res.on('end', () => {
          try { resolve(b ? JSON.parse(b) : null); }
          catch { resolve(null); }
        });
      });
      req.on('error', reject);
      if (data) req.write(data);
      req.end();
    });
  }

  /* ── State poll on connect ─────────────────────────────────────────── */

  async _pollCurrentState() {
    try {
      const phase = await this.lcuGet('/lol-gameflow/v1/gameflow-phase');
      if (phase && phase !== 'None') {
        this.currentPhase = phase;
        this.onEvent({ type: 'gameflow_phase', phase });
      }

      if (phase === 'Lobby') {
        const lobby = await this.lcuGet('/lol-lobby/v2/lobby');
        if (lobby) {
          this.currentLobby = lobby;
          this.onEvent({ type: 'lobby_update', lobby });
        }
      }

      if (phase === 'ChampSelect') {
        const session = await this.lcuGet('/lol-champ-select/v1/session');
        if (session) {
          this.currentSession = session;
          this.onEvent({ type: 'champ_select_update', session });
        }
      }
    } catch {}
  }

  /* ── LCU event dispatcher ──────────────────────────────────────────── */

  _handleLCUEvent(eventName, eventData) {
    // ── Gameflow phase ──────────────────────────────────────────────────
    if (eventName.includes('gameflow-phase')) {
      const phase = eventData?.data;
      if (!phase) return;

      this.currentPhase = phase;

      // Clear session cache when leaving champ select
      if (!['ChampSelect'].includes(phase)) {
        this.currentSession = null;
      }

      console.log(`[LCU] Gameflow phase → ${phase}`);
      this.onEvent({ type: 'gameflow_phase', phase });
      return;
    }

    // ── Champion select ─────────────────────────────────────────────────
    if (eventName.includes('champ-select')) {
      const session = eventData?.data;
      if (!session) return;

      this.currentSession = session;
      const subPhase = session.timer?.phase || 'unknown';
      const picksLocked = [...(session.myTeam || []), ...(session.theirTeam || [])]
        .filter((p) => p.championId).length;

      console.log(`[LCU] Champ select — subphase: ${subPhase}, picks: ${picksLocked}`);
      this.onEvent({ type: 'champ_select_update', session });
      return;
    }

    // ── Ready check ─────────────────────────────────────────────────────
    if (eventName.includes('ready-check')) {
      const state = eventData?.data;
      if (!state) return;

      if (state.state === 'InProgress') {
        this.onEvent({
          type:            'match_found',
          timer:           state.timer,
          playerResponse:  state.localPlayerResponse,
        });
      } else if (state.state === 'FinishedOK') {
        this.onEvent({ type: 'match_accepted' });
      } else if (state.state === 'FinishedCancel') {
        this.onEvent({ type: 'match_declined' });
      }
      return;
    }

    // ── End of game stats ───────────────────────────────────────────────
    if (eventName.includes('eog-stats-block')) {
      const eog = eventData?.data;
      if (eog) {
        console.log('[LCU] End-of-game stats received');
        this.onEvent({ type: 'end_of_game', eog });
      }
      return;
    }

    // ── Lobby ───────────────────────────────────────────────────────────
    if (eventName.includes('lol-lobby')) {
      const lobby = eventData?.data;
      if (lobby) {
        this.currentLobby = lobby;
        this.onEvent({ type: 'lobby_update', lobby });
      }
      return;
    }
  }
}

module.exports = { LCUClient };
