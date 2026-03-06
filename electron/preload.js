// Preload script — runs in a sandboxed context before the renderer.
// Expose only what is needed from Node/Electron to the renderer.
const { contextBridge } = require('electron');

contextBridge.exposeInMainWorld('runepilot', {
  platform: process.platform,
  version: process.env.npm_package_version || '1.1.0',
});
