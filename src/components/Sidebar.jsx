import React from 'react';

const navItems = [
  { id: 'inicio', label: 'Inicio', icon: (
    <svg viewBox="0 0 24 24" fill="currentColor" width="18" height="18">
      <path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z"/>
    </svg>
  )},
  { id: 'campeones', label: 'Campeones', icon: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="18" height="18">
      <circle cx="12" cy="8" r="4"/><path d="M12 14c-5 0-8 2-8 4v1h16v-1c0-2-3-4-8-4z"/>
    </svg>
  )},
  { id: 'counters', label: 'Counters', icon: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="18" height="18">
      <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
    </svg>
  )},
  { id: 'runas', label: 'Runas & Hechizos', icon: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="18" height="18">
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
    </svg>
  )},
  { id: 'winrates', label: 'Winrates', icon: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="18" height="18">
      <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>
    </svg>
  )},
  { id: 'posicion', label: 'Mejores por Posición', icon: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="18" height="18">
      <path d="M12 15l-2 5L7 17l-5 2 2-5L1 9l5 1 3-5 3 5 5-1-3 5z"/><path d="M20 4l-1.5 4.5L22 10l-4 1-1 4-2-3-4 1 2-3-2-3 4 1z"/>
    </svg>
  )},
  { id: 'importar', label: 'Importar a League', icon: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="18" height="18">
      <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/>
    </svg>
  )},
  { id: 'meta', label: 'Meta & Parche', icon: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="18" height="18">
      <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/>
    </svg>
  )},
  { id: 'guias', label: 'Guías & Builds', icon: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="18" height="18">
      <path d="M2 3h6a4 4 0 014 4v14a3 3 0 00-3-3H2z"/><path d="M22 3h-6a4 4 0 00-4 4v14a3 3 0 013-3h7z"/>
    </svg>
  )},
];

function MoonIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="16" height="16">
      <path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z"/>
    </svg>
  );
}

function SunIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="16" height="16">
      <circle cx="12" cy="12" r="5"/>
      <line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/>
      <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/>
      <line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/>
      <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>
    </svg>
  );
}

export default function Sidebar({ activeView, onNavigate, lcuStatus, version, darkMode, onToggleDark }) {
  const isConnected = lcuStatus === 'connected';

  return (
    <aside className="sidebar">
      <div className="sidebar-logo">
        <div className="sidebar-logo-icon">
          <svg viewBox="0 0 40 40" width="36" height="36">
            <circle cx="20" cy="20" r="18" fill="#e8edf5" stroke="#c5cede" strokeWidth="1.5"/>
            <path d="M20 8 L28 14 L26 24 L20 28 L14 24 L12 14 Z" fill="none" stroke="#7b8fa8" strokeWidth="1.5"/>
            <circle cx="20" cy="20" r="4" fill="#8b9fc0"/>
            <path d="M20 8 L20 16 M28 14 L22 18 M26 24 L21 21 M14 24 L19 21 M12 14 L18 18" stroke="#7b8fa8" strokeWidth="1.2"/>
          </svg>
        </div>
        <div className="sidebar-logo-text">
          <span className="sidebar-brand">RunePilot</span>
          <span className="sidebar-sub">League Optimizer</span>
        </div>
      </div>

      <nav className="sidebar-nav">
        {navItems.map((item) => (
          <button
            key={item.id}
            className={`nav-item ${activeView === item.id ? 'active' : ''}`}
            onClick={() => onNavigate(item.id)}
          >
            <span className="nav-icon">{item.icon}</span>
            <span className="nav-label">{item.label}</span>
          </button>
        ))}
      </nav>

      <div className="sidebar-footer">
        <div className="lcu-indicator">
          <span className="lcu-dot-small" style={{ background: isConnected ? '#52b788' : '#9ca3af' }} />
          <span className="lcu-text">{isConnected ? 'Conectado' : 'Desconectado'}</span>
        </div>

        <button
          className="dark-mode-toggle"
          onClick={onToggleDark}
          title={darkMode ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'}
        >
          {darkMode ? <SunIcon /> : <MoonIcon />}
          <span>{darkMode ? 'Modo claro' : 'Modo oscuro'}</span>
        </button>

        <div className="sidebar-version">{version || 'v2.3.1'}</div>
      </div>
    </aside>
  );
}
