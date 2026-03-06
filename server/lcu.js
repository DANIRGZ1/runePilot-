/**
 * LCU (League Client Update) API Integration
 *
 * Uses Riot's official local League Client API.
 * Policy: https://www.riotgames.com/en/DevRel/api-policy
 * This is a local-only integration — no external requests, no data collection.
 */

const fs = require('fs');
const path = require('path');
const WebSocket = require('ws');

const LOCKFILE_PATHS = [
  'C:\\Riot Games\\League of Legends\\lockfile',
  path.join(process.env.LOCALAPPDATA || '', 'Riot Games', 'League of Legends', 'lockfile'),
  path.join(process.env.PROGRAMFILES || 'C:\\Program Files', 'Riot Games', 'League of Legends', 'lockfile'),
  '/Applications/League of Legends.app/Contents/LoL/lockfile',
  path.join(process.env.HOME || '', 'Games', 'league-of-legends', 'drive_c', 'Riot Games', 'League of Legends', 'lockfile'),
];

// LCU events we care about
const SUBSCRIPTIONS = [
  'OnJsonApiEvent_lol-matchmaking_v1_ready-check',
  'OnJsonApiEvent_lol-champ-select_v1_session',
  'OnJsonApiEvent_lol-gameflow_v1_gameflow-phase',
  'OnJsonApiEvent_lol-summoner_v1_current-summoner',
];

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
  return { name, pid, port: parseInt(port), password, protocol };
}

class LCUClient {
  constructor(onEvent) {
    this.onEvent = onEvent;
    this.ws = null;
    this.credentials = null;
    this.connected = false;
    this.reconnectTimer = null;
    this.lockfileWatcher = null;
  }

  start() {
    this.tryConnect();
  }

  tryConnect() {
    const lockfilePath = findLockfile();
    if (!lockfilePath) {
      this.reconnectTimer = setTimeout(() => this.tryConnect(), 5000);
      return;
    }

    try {
      const content = fs.readFileSync(lockfilePath, 'utf8');
      this.credentials = parseLockfile(content);
      this.connectWS();
    } catch {
      this.reconnectTimer = setTimeout(() => this.tryConnect(), 5000);
    }
  }

  connectWS() {
    const { port, password } = this.credentials;
    const auth = Buffer.from(`riot:${password}`).toString('base64');

    const ws = new WebSocket(`wss://127.0.0.1:${port}`, {
      headers: { Authorization: `Basic ${auth}` },
      rejectUnauthorized: false, // LCU uses self-signed cert
    });

    ws.on('open', () => {
      this.connected = true;
      console.log('[LCU] Connected to League Client');
      this.onEvent({ type: 'lcu_connected' });

      // Subscribe to relevant events
      for (const event of SUBSCRIPTIONS) {
        ws.send(JSON.stringify([5, event]));
      }
    });

    ws.on('message', (data) => {
      try {
        const msg = JSON.parse(data.toString());
        if (msg[0] === 8) {
          // WAMP push event: [8, eventName, eventData]
          this.handleLCUEvent(msg[1], msg[2]);
        }
      } catch {}
    });

    ws.on('close', () => {
      this.connected = false;
      console.log('[LCU] Disconnected from League Client');
      this.onEvent({ type: 'lcu_disconnected' });
      this.reconnectTimer = setTimeout(() => this.tryConnect(), 5000);
    });

    ws.on('error', () => {
      ws.terminate();
    });

    this.ws = ws;
  }

  handleLCUEvent(eventName, eventData) {
    if (eventName.includes('ready-check')) {
      const state = eventData?.data;
      if (state?.state === 'InProgress') {
        this.onEvent({
          type: 'match_found',
          timer: state.timer,
          playerResponse: state.localPlayerResponse,
        });
      } else if (state?.state === 'FinishedOK') {
        this.onEvent({ type: 'match_accepted' });
      } else if (state?.state === 'FinishedCancel') {
        this.onEvent({ type: 'match_declined' });
      }
    } else if (eventName.includes('champ-select')) {
      const session = eventData?.data;
      if (session) {
        this.onEvent({ type: 'champ_select_update', session });
      }
    } else if (eventName.includes('gameflow-phase')) {
      const phase = eventData?.data;
      this.onEvent({ type: 'gameflow_phase', phase });
    }
  }

  stop() {
    if (this.reconnectTimer) clearTimeout(this.reconnectTimer);
    if (this.ws) this.ws.terminate();
  }
}

module.exports = { LCUClient };
