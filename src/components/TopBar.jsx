import React from 'react';

const REGIONS = [
  { code: 'EUW', flag: '🌍' },
  { code: 'NA', flag: '🇺🇸' },
  { code: 'KR', flag: '🇰🇷' },
  { code: 'LAS', flag: '🏳' },
  { code: 'BR', flag: '🇧🇷' },
];

export default function TopBar({ searchQuery, onSearchChange, activeRegion, onRegionChange, ddVersion }) {
  return (
    <header className="topbar">
      <div className="topbar-search">
        <svg className="search-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="16" height="16">
          <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
        </svg>
        <input
          type="text"
          className="topbar-input"
          placeholder="Buscar campeón..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
        />
      </div>

      <div className="topbar-regions">
        <span className="regions-label">Regiones:</span>
        {REGIONS.map((r) => (
          <button
            key={r.code}
            className={`region-btn ${activeRegion === r.code ? 'active' : ''}`}
            onClick={() => onRegionChange(r.code)}
          >
            <span className="region-flag">{r.flag}</span>
            <span>{r.code}</span>
          </button>
        ))}
      </div>

      <div className="topbar-right">
        <button className="topbar-icon-btn notif-btn" title="Notificaciones">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="18" height="18">
            <path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 01-3.46 0"/>
          </svg>
          <span className="notif-dot" />
        </button>

        <button className="topbar-icon-btn" title="Configuración">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="18" height="18">
            <circle cx="12" cy="12" r="3"/>
            <path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z"/>
          </svg>
        </button>

        <div className="topbar-user">
          <div className="user-avatar">P</div>
          <span className="user-name">ProPlayer</span>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="12" height="12">
            <polyline points="6 9 12 15 18 9"/>
          </svg>
        </div>
      </div>
    </header>
  );
}
