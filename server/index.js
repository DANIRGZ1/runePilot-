/**
 * RunePilot Backend Server
 * - Proxies LCU (League Client) events to frontend via WebSocket
 * - Serves as a bridge since browsers can't connect to LCU directly (self-signed cert + CORS)
 */

const express = require('express');
const { WebSocketServer, WebSocket } = require('ws');
const http = require('http');
const cors = require('cors');
const { LCUClient } = require('./lcu');

const app = express();
app.use(cors({ origin: ['http://localhost:3000', 'http://127.0.0.1:3000'] }));
app.use(express.json());

const server = http.createServer(app);
const wss = new WebSocketServer({ server });

const frontendClients = new Set();
let lcuConnected = false;
let lastGameflowPhase = 'None';

function broadcast(msg) {
  const data = JSON.stringify(msg);
  for (const client of frontendClients) {
    if (client.readyState === WebSocket.OPEN) {
      client.send(data);
    }
  }
}

// LCU Integration
const lcu = new LCUClient((event) => {
  if (event.type === 'lcu_connected') lcuConnected = true;
  if (event.type === 'lcu_disconnected') lcuConnected = false;
  if (event.type === 'gameflow_phase') lastGameflowPhase = event.phase || 'None';
  broadcast(event);
});

lcu.start();

// WebSocket — frontend connections
wss.on('connection', (ws) => {
  frontendClients.add(ws);

  // Send current state immediately on connect
  ws.send(JSON.stringify({
    type: 'initial_state',
    lcuConnected,
    gameflowPhase: lastGameflowPhase,
  }));

  ws.on('close', () => frontendClients.delete(ws));
  ws.on('error', () => frontendClients.delete(ws));
});

app.get('/health', (req, res) => {
  res.json({ ok: true, lcuConnected, gameflowPhase: lastGameflowPhase });
});

// Summoner profile
app.get('/lcu/summoner', async (req, res) => {
  if (!lcuConnected || !lcu.credentials) return res.status(503).json({ error: 'LCU not connected' });
  try {
    const data = await lcu.lcuGet('/lol-summoner/v1/current-summoner');
    res.json(data);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// Ranked stats
app.get('/lcu/ranked', async (req, res) => {
  if (!lcuConnected || !lcu.credentials) return res.status(503).json({ error: 'LCU not connected' });
  try {
    const data = await lcu.lcuGet('/lol-ranked/v1/current-ranked-stats');
    res.json(data);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// Search summoner by name
app.get('/lcu/summoner/search', async (req, res) => {
  if (!lcuConnected || !lcu.credentials) return res.status(503).json({ error: 'LCU not connected' });
  const { name } = req.query;
  if (!name) return res.status(400).json({ error: 'Missing name' });
  try {
    const data = await lcu.lcuGet(`/lol-summoner/v1/summoners?name=${encodeURIComponent(name)}`);
    if (!data || data.errorCode) return res.status(404).json({ error: 'Summoner not found' });
    res.json(data);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// Ranked stats by summonerId
app.get('/lcu/ranked/by-id', async (req, res) => {
  if (!lcuConnected || !lcu.credentials) return res.status(503).json({ error: 'LCU not connected' });
  const { summonerId } = req.query;
  if (!summonerId) return res.status(400).json({ error: 'Missing summonerId' });
  try {
    const data = await lcu.lcuGet(`/lol-ranked/v1/ranked-stats/${summonerId}`);
    res.json(data);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// Match history by puuid
app.get('/lcu/history/by-puuid', async (req, res) => {
  if (!lcuConnected || !lcu.credentials) return res.status(503).json({ error: 'LCU not connected' });
  const { puuid } = req.query;
  if (!puuid) return res.status(400).json({ error: 'Missing puuid' });
  try {
    const data = await lcu.lcuGet(`/lol-match-history/v1/products/lol/${puuid}/matches?begIndex=0&endIndex=20`);
    res.json(data);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// Match history (last 20 games)
app.get('/lcu/history', async (req, res) => {
  if (!lcuConnected || !lcu.credentials) return res.status(503).json({ error: 'LCU not connected' });
  try {
    const summoner = await lcu.lcuGet('/lol-summoner/v1/current-summoner');
    const puuid = summoner?.puuid;
    if (!puuid) return res.status(404).json({ error: 'No summoner found' });
    const data = await lcu.lcuGet(`/lol-match-history/v1/products/lol/${puuid}/matches?begIndex=0&endIndex=20`);
    res.json(data);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// Import rune page into League Client
app.post('/lcu/runes', async (req, res) => {
  if (!lcuConnected || !lcu.credentials) {
    return res.status(503).json({ error: 'LCU not connected' });
  }
  const { name, primaryId, secondaryId, perks } = req.body;
  if (!primaryId || !secondaryId || !perks) {
    return res.status(400).json({ error: 'Missing rune page data' });
  }
  try {
    // Delete existing page with same name if it exists
    const pages = await lcu.lcuGet('/lol-perks/v1/pages');
    if (Array.isArray(pages)) {
      const existing = pages.find(p => p.name === name && !p.isActive);
      if (existing) {
        await lcu.lcuDelete(`/lol-perks/v1/pages/${existing.id}`);
      }
    }
    // Create new page
    const result = await lcu.lcuPost('/lol-perks/v1/pages', {
      name,
      primaryStyleId: primaryId,
      subStyleId: secondaryId,
      selectedPerkIds: perks,
      isEditable: true,
    });
    console.log(`[LCU] Rune page "${name}" imported`);
    res.json({ ok: true, page: result });
  } catch (e) {
    console.error('[LCU] Rune import failed:', e.message);
    res.status(500).json({ error: e.message });
  }
});

const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log(`[RunePilot] Backend on http://localhost:${PORT}`);
  console.log('[RunePilot] Watching for League Client...');
});
