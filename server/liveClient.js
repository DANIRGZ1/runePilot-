/**
 * Live Client Data API Integration
 *
 * Riot's in-game API runs at http://127.0.0.1:2999 while a League game is active.
 * Unlike the LCU (which uses WebSocket + HTTPS with a self-signed cert), the Live
 * Client API is plain HTTP and requires no authentication.
 *
 * Key characteristics:
 *  - Only available during an active game (not in champ select or menus)
 *  - Returns 404 during loading screen; becomes available once the game loads
 *  - Provides real-time stats: gold, kills, deaths, CS, items, events, game time
 *
 * Endpoints used:
 *  GET /liveclientdata/allgamedata      — full snapshot (players + stats + events)
 *  GET /liveclientdata/eventdata        — game events (kills, objectives, etc.)
 *  GET /liveclientdata/gamestats        — game time + mode
 */

const http = require('http');

const LIVE_HOST = '127.0.0.1';
const LIVE_PORT = 2999;
const POLL_INTERVAL_MS = 3000;      // poll every 3s during game
const LOAD_CHECK_INTERVAL_MS = 1000; // faster check during loading screen

/**
 * Minimal HTTP GET for the Live Client API (no auth, no TLS).
 */
function liveGet(endpoint) {
  return new Promise((resolve, reject) => {
    const req = http.get(
      { hostname: LIVE_HOST, port: LIVE_PORT, path: endpoint, timeout: 2000 },
      (res) => {
        let body = '';
        res.on('data', (d) => (body += d));
        res.on('end', () => {
          if (res.statusCode === 404) return reject(new Error('404'));
          try { resolve(JSON.parse(body)); }
          catch { reject(new Error('parse_error')); }
        });
      }
    );
    req.on('error', reject);
    req.on('timeout', () => { req.destroy(); reject(new Error('timeout')); });
  });
}

/**
 * Detects sub-phases that the LCU gameflow doesn't expose with enough granularity:
 *  - 'loading'  — game process started but map hasn't loaded yet
 *  - 'in_game'  — live match is playable
 *  - 'ended'    — game just finished (API stops responding)
 */
class LiveClientAPI {
  constructor(onEvent) {
    this.onEvent = onEvent;
    this.timer   = null;
    this.running = false;
    this.phase   = 'idle'; // 'idle' | 'loading' | 'in_game'
    this._lastEventCount = 0;
  }

  /**
   * Start polling. Called by the backend when the LCU reports InProgress phase.
   */
  start() {
    if (this.running) return;
    this.running = true;
    this.phase   = 'loading';
    this._lastEventCount = 0;
    console.log('[LiveClient] Watching for in-game API...');
    this._schedule(LOAD_CHECK_INTERVAL_MS);
  }

  stop() {
    this.running = false;
    this.phase   = 'idle';
    if (this.timer) { clearTimeout(this.timer); this.timer = null; }
    console.log('[LiveClient] Stopped.');
  }

  _schedule(delay = POLL_INTERVAL_MS) {
    if (!this.running) return;
    this.timer = setTimeout(() => this._tick(), delay);
  }

  async _tick() {
    if (!this.running) return;

    try {
      const data = await liveGet('/liveclientdata/allgamedata');

      // First successful response → game loaded
      if (this.phase === 'loading') {
        this.phase = 'in_game';
        console.log('[LiveClient] Game loaded — live data available');
        this.onEvent({ type: 'live_game_start', gameData: data });
      }

      // Detect new game events (kills, objectives, etc.)
      const events = data?.events?.Events || [];
      if (events.length > this._lastEventCount) {
        const newEvents = events.slice(this._lastEventCount);
        this._lastEventCount = events.length;
        this.onEvent({ type: 'live_game_events', events: newEvents, gameData: data });
      }

      // Periodic full snapshot
      this.onEvent({ type: 'live_game_update', gameData: data });

      this._schedule(POLL_INTERVAL_MS);

    } catch (err) {
      if (this.phase === 'in_game') {
        // Was in game, now API gone → game ended
        console.log('[LiveClient] API unreachable — game ended');
        this.onEvent({ type: 'live_game_ended' });
        this.stop();
      } else {
        // Still on loading screen — keep checking fast
        this._schedule(LOAD_CHECK_INTERVAL_MS);
      }
    }
  }

  /**
   * One-shot fetch for current game data (used by REST endpoint).
   */
  static fetchSnapshot() {
    return liveGet('/liveclientdata/allgamedata');
  }
}

module.exports = { LiveClientAPI };
