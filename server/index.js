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

const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log(`[RunePilot] Backend on http://localhost:${PORT}`);
  console.log('[RunePilot] Watching for League Client...');
});
