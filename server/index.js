/**
 * RunePilot Backend Server
 *
 * Acts as a bridge between:
 *  - The League Client (LCU API — wss://127.0.0.1:{port}, requires Node.js for self-signed TLS)
 *  - The in-game Live Client API (http://127.0.0.1:2999 — plain HTTP, no auth)
 *  - The React frontend (ws://localhost:3001 + REST on http://localhost:3001)
 *
 * Why a local backend is required:
 *  - Browsers cannot bypass TLS certificate validation → LCU HTTPS calls must be proxied
 *  - CORS headers on LCU API block browser requests
 *  - fs.watch and lockfile reading require Node.js APIs
 */

const express  = require('express');
const { WebSocketServer, WebSocket } = require('ws');
const http     = require('http');
const cors     = require('cors');
const { LCUClient }    = require('./lcu');
const { LiveClientAPI } = require('./liveClient');

const app    = express();
const server = http.createServer(app);
const wss    = new WebSocketServer({ server });

app.use(cors({ origin: ['http://localhost:3000', 'http://127.0.0.1:3000'] }));
app.use(express.json());

/* ══════════════════════════════════════════════════════════════════════════
   Shared state — sent to every new frontend WS client on connect
══════════════════════════════════════════════════════════════════════════ */

const state = {
  lcuConnected:       false,
  gameflowPhase:      'None',
  champSelectSession: null,  // latest champ-select session (null when not in CS)
  liveGameData:       null,  // latest in-game snapshot (null when not in game)
};

/* ══════════════════════════════════════════════════════════════════════════
   WebSocket broadcast to all connected frontend tabs
══════════════════════════════════════════════════════════════════════════ */

const frontendClients = new Set();

function broadcast(msg) {
  const data = JSON.stringify(msg);
  for (const client of frontendClients) {
    if (client.readyState === WebSocket.OPEN) client.send(data);
  }
}

/* ══════════════════════════════════════════════════════════════════════════
   Live Client API (in-game)
══════════════════════════════════════════════════════════════════════════ */

const liveClient = new LiveClientAPI((event) => {
  if (event.type === 'live_game_start') {
    state.liveGameData = event.gameData;
    console.log('[LiveClient] Game started — data streaming');
  }
  if (event.type === 'live_game_update') {
    state.liveGameData = event.gameData;
  }
  if (event.type === 'live_game_ended') {
    state.liveGameData = null;
  }
  broadcast(event);
});

/* ══════════════════════════════════════════════════════════════════════════
   LCU Client
══════════════════════════════════════════════════════════════════════════ */

const lcu = new LCUClient((event) => {
  // Update shared state
  switch (event.type) {
    case 'lcu_connected':
      state.lcuConnected = true;
      break;
    case 'lcu_disconnected':
      state.lcuConnected = false;
      state.gameflowPhase = 'None';
      state.champSelectSession = null;
      liveClient.stop();
      break;
    case 'gameflow_phase':
      state.gameflowPhase = event.phase || 'None';

      // Clear session when not in champ select
      if (event.phase !== 'ChampSelect') state.champSelectSession = null;

      // Start/stop live game polling based on phase
      if (event.phase === 'InProgress') {
        liveClient.start();
      } else if (['WaitingForStats', 'PreEndOfGame', 'EndOfGame', 'None', 'Lobby'].includes(event.phase)) {
        liveClient.stop();
        state.liveGameData = null;
      }
      break;
    case 'champ_select_update':
      state.champSelectSession = event.session;
      break;
  }

  broadcast(event);
});

lcu.start();

/* ══════════════════════════════════════════════════════════════════════════
   Frontend WebSocket — sends current state on connect
══════════════════════════════════════════════════════════════════════════ */

wss.on('connection', (ws) => {
  frontendClients.add(ws);

  // Hydrate client with current state immediately
  ws.send(JSON.stringify({
    type:               'initial_state',
    lcuConnected:       state.lcuConnected,
    gameflowPhase:      state.gameflowPhase,
    champSelectSession: state.champSelectSession,
    liveGameData:       state.liveGameData,
  }));

  ws.on('close', () => frontendClients.delete(ws));
  ws.on('error', () => frontendClients.delete(ws));
});

/* ══════════════════════════════════════════════════════════════════════════
   REST API
══════════════════════════════════════════════════════════════════════════ */

// ── Health check ────────────────────────────────────────────────────────────
app.get('/health', (_req, res) => {
  res.json({
    ok:           true,
    lcuConnected: state.lcuConnected,
    gameflowPhase: state.gameflowPhase,
    inGame:        !!state.liveGameData,
  });
});

// Guard: all /lcu/* routes require an active LCU connection
function requireLCU(req, res, next) {
  if (!state.lcuConnected || !lcu.credentials) {
    return res.status(503).json({ error: 'LCU not connected' });
  }
  next();
}

// ── Debug ───────────────────────────────────────────────────────────────────
app.get('/lcu/debug', requireLCU, async (_req, res) => {
  try {
    const summoner = await lcu.lcuGet('/lol-summoner/v1/current-summoner');
    res.json({ lcuConnected: true, port: lcu.credentials.port, summoner });
  } catch (e) { res.json({ lcuConnected: true, error: e.message }); }
});

// ── Summoner profile ────────────────────────────────────────────────────────
app.get('/lcu/summoner', requireLCU, async (_req, res) => {
  try {
    const data = await lcu.lcuGet('/lol-summoner/v1/current-summoner');
    if (!data || data.httpStatus >= 400) return res.status(503).json({ error: 'LCU not ready', raw: data });
    if (!data.displayName && data.gameName) data.displayName = data.gameName;
    res.json(data);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// ── Ranked stats ────────────────────────────────────────────────────────────
app.get('/lcu/ranked', requireLCU, async (_req, res) => {
  try {
    const data = await lcu.lcuGet('/lol-ranked/v1/current-ranked-stats');
    res.json(data);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// ── Ranked stats by summonerId ───────────────────────────────────────────────
app.get('/lcu/ranked/by-id', requireLCU, async (req, res) => {
  const { summonerId } = req.query;
  if (!summonerId) return res.status(400).json({ error: 'Missing summonerId' });
  try {
    const data = await lcu.lcuGet(`/lol-ranked/v1/ranked-stats/${summonerId}`);
    res.json(data);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// ── Search summoner ─────────────────────────────────────────────────────────
app.get('/lcu/summoner/search', requireLCU, async (req, res) => {
  const { name } = req.query;
  if (!name) return res.status(400).json({ error: 'Missing name' });
  try {
    const data = await lcu.lcuGet(`/lol-summoner/v1/summoners?name=${encodeURIComponent(name)}`);
    if (!data || data.errorCode) return res.status(404).json({ error: 'Summoner not found' });
    res.json(data);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// ── Match history ───────────────────────────────────────────────────────────
app.get('/lcu/history', requireLCU, async (_req, res) => {
  try {
    const summoner = await lcu.lcuGet('/lol-summoner/v1/current-summoner');
    const puuid    = summoner?.puuid;
    if (!puuid) return res.status(404).json({ error: 'No summoner found' });
    const data = await lcu.lcuGet(`/lol-match-history/v1/products/lol/${puuid}/matches?begIndex=0&endIndex=20`);
    res.json(data);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

app.get('/lcu/history/by-puuid', requireLCU, async (req, res) => {
  const { puuid } = req.query;
  if (!puuid) return res.status(400).json({ error: 'Missing puuid' });
  try {
    const data = await lcu.lcuGet(`/lol-match-history/v1/products/lol/${puuid}/matches?begIndex=0&endIndex=20`);
    res.json(data);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// ── Champ select session ────────────────────────────────────────────────────
app.get('/lcu/champ-select', requireLCU, async (_req, res) => {
  try {
    const data = await lcu.lcuGet('/lol-champ-select/v1/session');
    if (!data || data.httpStatus === 404) return res.status(404).json({ error: 'Not in champ select' });
    res.json(data);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// ── Import rune page ────────────────────────────────────────────────────────
app.post('/lcu/runes', requireLCU, async (req, res) => {
  const { name, primaryId, secondaryId, perks } = req.body;
  if (!primaryId || !secondaryId || !perks) {
    return res.status(400).json({ error: 'Missing rune page data' });
  }
  try {
    const pages = await lcu.lcuGet('/lol-perks/v1/pages');
    if (Array.isArray(pages)) {
      const existing = pages.find((p) => p.name === name && !p.isActive);
      if (existing) await lcu.lcuDelete(`/lol-perks/v1/pages/${existing.id}`);
    }
    const result = await lcu.lcuPost('/lol-perks/v1/pages', {
      name,
      primaryStyleId:   primaryId,
      subStyleId:       secondaryId,
      selectedPerkIds:  perks,
      isEditable:       true,
    });
    console.log(`[LCU] Rune page "${name}" imported`);
    res.json({ ok: true, page: result });
  } catch (e) {
    console.error('[LCU] Rune import failed:', e.message);
    res.status(500).json({ error: e.message });
  }
});

// ── In-game Live Client data ────────────────────────────────────────────────
// Returns the latest cached snapshot, or fetches fresh if the game is active.
app.get('/lcu/live', async (_req, res) => {
  try {
    const data = await LiveClientAPI.fetchSnapshot();
    res.json(data);
  } catch {
    res.status(503).json({ error: 'Live Client API not available (not in game)' });
  }
});

// ── End-of-game stats ────────────────────────────────────────────────────────
app.get('/lcu/eog', requireLCU, async (_req, res) => {
  try {
    const data = await lcu.lcuGet('/lol-end-of-game/v1/eogStatsBlock');
    if (!data || data.httpStatus === 404) {
      return res.status(404).json({ error: 'No end-of-game stats available' });
    }
    res.json(data);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

/* ══════════════════════════════════════════════════════════════════════════
   Start
══════════════════════════════════════════════════════════════════════════ */

const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log(`[RunePilot] Backend → http://localhost:${PORT}`);
  console.log('[RunePilot] Watching for League Client...');
});
