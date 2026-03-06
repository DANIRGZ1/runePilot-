/**
 * LCU WebSocket Client (frontend)
 * Connects to the RunePilot backend which proxies League Client events.
 */

const BACKEND_WS = 'ws://localhost:3001';

class LCUEventEmitter {
  constructor() {
    this.listeners = {};
    this.ws = null;
    this.reconnectTimer = null;
    this.enabled = false;
  }

  connect() {
    this.enabled = true;
    this._connect();
  }

  _connect() {
    if (!this.enabled) return;
    try {
      const ws = new WebSocket(BACKEND_WS);

      ws.onopen = () => {
        clearTimeout(this.reconnectTimer);
        this._emit('ws_connected', {});
      };

      ws.onmessage = (e) => {
        try {
          const msg = JSON.parse(e.data);
          this._emit(msg.type, msg);
        } catch {}
      };

      ws.onclose = () => {
        this._emit('ws_disconnected', {});
        this.reconnectTimer = setTimeout(() => this._connect(), 4000);
      };

      ws.onerror = () => {};
      this.ws = ws;
    } catch {
      this.reconnectTimer = setTimeout(() => this._connect(), 4000);
    }
  }

  on(event, callback) {
    if (!this.listeners[event]) this.listeners[event] = [];
    this.listeners[event].push(callback);
    return () => {
      this.listeners[event] = (this.listeners[event] || []).filter((l) => l !== callback);
    };
  }

  _emit(event, data) {
    (this.listeners[event] || []).forEach((cb) => cb(data));
    (this.listeners['*'] || []).forEach((cb) => cb({ event, data }));
  }

  disconnect() {
    this.enabled = false;
    clearTimeout(this.reconnectTimer);
    if (this.ws) this.ws.close();
  }
}

export const lcuClient = new LCUEventEmitter();
