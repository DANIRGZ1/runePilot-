/**
 * LCU Event Client (frontend)
 *
 * Thin WebSocket wrapper that connects to the RunePilot backend (port 3001),
 * which proxies League Client events. The browser cannot talk to the LCU API
 * directly because it uses a self-signed TLS certificate and blocks CORS.
 *
 * Usage:
 *   import { lcuClient, PHASE } from './lcuClient';
 *
 *   lcuClient.connect();
 *   const off = lcuClient.on('gameflow_phase', ({ phase }) => { ... });
 *   off(); // unsubscribe
 *
 * Event reference:
 *   ws_connected          — backend WS connected
 *   ws_disconnected       — backend WS lost
 *   lcu_connected         — League Client detected
 *   lcu_disconnected      — League Client closed / lockfile removed
 *   initial_state         — { lcuConnected, gameflowPhase, champSelectSession, liveGameData }
 *   gameflow_phase        — { phase: PHASE }
 *   champ_select_update   — { session: LCUSession }
 *   match_found           — { timer, playerResponse }
 *   match_accepted        — {}
 *   match_declined        — {}
 *   lobby_update          — { lobby }
 *   end_of_game           — { eog }
 *   live_game_start       — { gameData }
 *   live_game_update      — { gameData }  (every ~3 s while in-game)
 *   live_game_events      — { events[], gameData }  (new game events)
 *   live_game_ended       — {}
 *   *                     — wildcard — receives { event, data } for any event
 */

const BACKEND_WS = 'ws://localhost:3001';

/**
 * All known LCU gameflow phases, in rough chronological order.
 * Use these constants instead of bare strings to avoid typos.
 */
export const PHASE = Object.freeze({
  NONE:             'None',
  LOBBY:            'Lobby',
  MATCHMAKING:      'Matchmaking',
  READY_CHECK:      'ReadyCheck',
  CHAMP_SELECT:     'ChampSelect',
  GAME_START:       'GameStart',
  IN_PROGRESS:      'InProgress',
  WAITING_FOR_STATS:'WaitingForStats',
  PRE_END_OF_GAME:  'PreEndOfGame',
  END_OF_GAME:      'EndOfGame',
});

class LCUEventEmitter {
  constructor() {
    this.listeners = {};
    this.ws        = null;
    this._timer    = null;
    this._enabled  = false;
  }

  /* ── Public API ──────────────────────────────────────────────────── */

  connect() {
    this._enabled = true;
    this._connect();
  }

  disconnect() {
    this._enabled = false;
    clearTimeout(this._timer);
    if (this.ws) this.ws.close();
    this.ws = null;
  }

  /**
   * Subscribe to an event.
   * Returns an unsubscribe function.
   *
   * @param {string}   event    Event name or '*' for all events
   * @param {Function} callback
   * @returns {() => void}
   */
  on(event, callback) {
    if (!this.listeners[event]) this.listeners[event] = [];
    this.listeners[event].push(callback);
    return () => {
      this.listeners[event] = (this.listeners[event] || []).filter((l) => l !== callback);
    };
  }

  /**
   * Subscribe to a specific gameflow phase.
   * Fires immediately if the current phase matches (via initial_state).
   *
   * @param {string}   phase    One of PHASE.*
   * @param {Function} callback
   * @returns {() => void}
   */
  onPhase(phase, callback) {
    return this.on('gameflow_phase', (msg) => {
      if (msg.phase === phase) callback(msg);
    });
  }

  /* ── Internal ────────────────────────────────────────────────────── */

  _connect() {
    if (!this._enabled) return;
    try {
      const ws = new WebSocket(BACKEND_WS);

      ws.onopen = () => {
        clearTimeout(this._timer);
        this._emit('ws_connected', {});
      };

      ws.onmessage = (e) => {
        try {
          const msg = JSON.parse(e.data);
          if (!msg?.type) return;

          // initial_state also fires gameflow_phase so the rest of the app
          // doesn't need to handle it as a special case
          if (msg.type === 'initial_state') {
            this._emit('initial_state', msg);
            if (msg.gameflowPhase && msg.gameflowPhase !== 'None') {
              this._emit('gameflow_phase', { phase: msg.gameflowPhase });
            }
            if (msg.champSelectSession) {
              this._emit('champ_select_update', { session: msg.champSelectSession });
            }
            if (msg.liveGameData) {
              this._emit('live_game_update', { gameData: msg.liveGameData });
            }
            return;
          }

          this._emit(msg.type, msg);
        } catch {}
      };

      ws.onclose = () => {
        this._emit('ws_disconnected', {});
        this._timer = setTimeout(() => this._connect(), 4000);
      };

      ws.onerror = () => {};
      this.ws = ws;
    } catch {
      this._timer = setTimeout(() => this._connect(), 4000);
    }
  }

  _emit(event, data) {
    (this.listeners[event] || []).forEach((cb) => { try { cb(data); } catch {} });
    (this.listeners['*']   || []).forEach((cb) => { try { cb({ event, data }); } catch {} });
  }
}

export const lcuClient = new LCUEventEmitter();
