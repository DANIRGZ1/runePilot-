import React, { useState } from 'react';
import { getChampionSplashUrl, getChampionUrl, DD_KEYS } from '../services/datadragon';

// Rune colors/names for visual display
const RUNE_TREES = {
  Precision:    { color: '#c8aa6e', bg: 'rgba(200,170,110,0.15)' },
  Domination:   { color: '#e84057', bg: 'rgba(232,64,87,0.12)'  },
  Sorcery:      { color: '#9faaee', bg: 'rgba(159,170,238,0.12)' },
  Resolve:      { color: '#54a84b', bg: 'rgba(84,168,75,0.12)'  },
  Inspiration:  { color: '#49aab9', bg: 'rgba(73,170,185,0.12)' },
};

// Simulated home data based on existing champion data
const FEATURED_CHAMPION = {
  id: 'ahri', name: 'AHRI', subtitle: 'Mago · Mid',
  winRate: 51.8, tier: 'A',
};

const COUNTERS = [
  { id: 'zed',       name: 'Zed',       winRate: 56.2 },
  { id: 'malzahar',  name: 'Malzahar',  winRate: 54.8 },
  { id: 'fizz',      name: 'Fizz',      winRate: 53.9 },
  { id: 'galio',     name: 'Galio',     winRate: 52.7 },
  { id: 'yasuo',     name: 'Yasuo',     winRate: 52.1 },
];

const RUNE_PRESETS = [
  { id: 'dom-insp', label: 'Dominación + Inspiración' },
  { id: 'sorc-prec', label: 'Hechicería + Precisión' },
  { id: 'prec-insp', label: 'Precisión + Inspiración' },
];

const RUNES_DOMINATION = [
  { name: 'Electrocute', tree: 'Domination' },
  { name: 'Sudden Impact', tree: 'Domination' },
  { name: 'Eyeball Collection', tree: 'Domination' },
  { name: 'Relentless Hunter', tree: 'Domination' },
  { name: 'Magical Footwear', tree: 'Inspiration' },
  { name: 'Biscuit Delivery', tree: 'Inspiration' },
  { name: 'Cosmic Insight', tree: 'Inspiration' },
];

const SPELLS = [
  { name: 'Flash', icon: '⚡' },
  { name: 'Ignite', icon: '🔥' },
];

const REGION_STATS = [
  { code: 'EUW', flag: '🌍', winRate: 52.3 },
  { code: 'NA',  flag: '🇺🇸', winRate: 51.8 },
  { code: 'KR',  flag: '🇰🇷', winRate: 52.9 },
  { code: 'LAS', flag: '🏳', winRate: 51.2 },
  { code: 'BR',  flag: '🇧🇷', winRate: 52.7 },
];

const BEST_BY_POSITION = [
  { role: 'TOP',    roleIcon: '🗡', id: 'aatrox',   name: 'Aatrox',   winRate: 53.2 },
  { role: 'JUNGLE', roleIcon: '🌿', id: 'amumu',    name: "Bel'Veth",  winRate: 54.7 },
  { role: 'MID',   roleIcon: '⭐', id: 'ahri',     name: 'Ahri',     winRate: 51.8 },
  { role: 'ADC',   roleIcon: '🏹', id: 'jinx',     name: 'Jinx',     winRate: 52.5 },
  { role: 'SUP',   roleIcon: '🛡', id: 'nautilus', name: 'Nautilus', winRate: 52.9 },
];

const TOP_GLOBAL = [
  { id: 'garen',    name: "K'Sante",  winRate: 54.3, tag: '' },
  { id: 'orianna',  name: 'Azir',     winRate: 53.9, tag: 'Faker ②' },
  { id: 'ekko',     name: 'Ekko',     winRate: 53.1, tag: '' },
  { id: 'fiora',    name: 'Riven',    winRate: 52.8, tag: '' },
  { id: 'ahri',     name: 'Kai Sa',   winRate: 52.6, tag: '' },
];

// Rune circle component
function RuneCircle({ rune, size = 40 }) {
  const tree = RUNE_TREES[rune.tree] || RUNE_TREES.Domination;
  const initials = rune.name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();
  return (
    <div
      className="rune-circle"
      title={rune.name}
      style={{
        width: size, height: size,
        background: tree.bg,
        borderColor: tree.color,
        color: tree.color,
      }}
    >
      <span style={{ fontSize: Math.floor(size * 0.3) }}>{initials}</span>
    </div>
  );
}

// Spell icon component
function SpellIcon({ spell, size = 52 }) {
  return (
    <div
      className="spell-icon"
      title={spell.name}
      style={{ width: size, height: size }}
    >
      <span style={{ fontSize: size * 0.5 }}>{spell.icon}</span>
      <span className="spell-name">{spell.name}</span>
    </div>
  );
}

// Champion card for counters row
function CounterCard({ champion, ddVersion }) {
  const ddKey = DD_KEYS[champion.id];
  const imgUrl = ddKey && ddVersion ? getChampionUrl(champion.id, ddVersion) : null;
  const wrColor = champion.winRate >= 54 ? '#e84057' : champion.winRate >= 52 ? '#c89b3c' : '#64748b';

  return (
    <div className="counter-card">
      <div className="counter-img-wrap">
        {imgUrl ? (
          <img src={imgUrl} alt={champion.name} className="counter-img" />
        ) : (
          <div className="counter-img-fallback">{champion.name[0]}</div>
        )}
      </div>
      <div className="counter-name">{champion.name}</div>
      <div className="counter-wr" style={{ color: wrColor }}>
        <span className="counter-wr-dot" style={{ background: wrColor }} />
        {champion.winRate}%
      </div>
    </div>
  );
}

// Champion card for top global section
function GlobalChampCard({ champ, ddVersion }) {
  const ddKey = DD_KEYS[champ.id];
  const splashUrl = ddKey ? getChampionSplashUrl(ddKey) : null;

  return (
    <div className="global-champ-card">
      {splashUrl ? (
        <img src={splashUrl} alt={champ.name} className="global-champ-img" />
      ) : (
        <div className="global-champ-fallback">{champ.name[0]}</div>
      )}
      <div className="global-champ-overlay">
        {champ.tag && <span className="global-champ-tag">{champ.tag}</span>}
        <span className="global-champ-name">{champ.name}</span>
        <span className="global-champ-wr">{champ.winRate}%</span>
      </div>
    </div>
  );
}

// Circular winrate gauge
function WinrateGauge({ value }) {
  const radius = 60;
  const circumference = 2 * Math.PI * radius;
  const pct = Math.max(0, Math.min(100, value));
  const offset = circumference - (pct / 100) * circumference;

  return (
    <div className="wr-gauge">
      <div className="wr-gauge-label">WINRATE GLOBAL</div>
      <div className="wr-gauge-circle">
        <svg width="160" height="160" viewBox="0 0 160 160">
          <circle cx="80" cy="80" r={radius} fill="none" stroke="#e5e7eb" strokeWidth="10"/>
          <circle
            cx="80" cy="80" r={radius}
            fill="none"
            stroke="#bfcce0"
            strokeWidth="10"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            strokeLinecap="round"
            transform="rotate(-90 80 80)"
            style={{ transition: 'stroke-dashoffset 0.8s ease' }}
          />
        </svg>
        <div className="wr-gauge-value">{value.toFixed(1)}%</div>
      </div>
    </div>
  );
}

export default function HomeView({ ddVersion, onImportRunes }) {
  const [selectedPreset, setSelectedPreset] = useState(RUNE_PRESETS[0].id);
  const [importing, setImporting] = useState(false);

  const handleImport = async () => {
    setImporting(true);
    if (onImportRunes) await onImportRunes('ahri');
    setTimeout(() => setImporting(false), 1500);
  };

  return (
    <div className="home-view">
      {/* ── Row 1: Featured + Counters ── */}
      <div className="home-row home-row-top">
        <div className="home-center">
          {/* Featured champion splash */}
          <div className="featured-champion">
            <img
              src={getChampionSplashUrl('Ahri')}
              alt="Ahri"
              className="featured-splash"
            />
            <div className="featured-overlay">
              <span className="featured-name">{FEATURED_CHAMPION.name}</span>
              <span className="featured-sub">{FEATURED_CHAMPION.subtitle}</span>
            </div>
          </div>

          {/* Counters section */}
          <div className="counters-section">
            <div className="section-title">
              <span className="section-title-icon">⚡</span>
              COUNTERS RECOMENDADOS
            </div>
            <div className="counters-grid">
              {COUNTERS.map((c) => (
                <CounterCard key={c.id} champion={c} ddVersion={ddVersion} />
              ))}
            </div>
          </div>
        </div>

        {/* Right panel: Winrate gauge */}
        <div className="home-right">
          <WinrateGauge value={FEATURED_CHAMPION.winRate} />
        </div>
      </div>

      {/* ── Row 2: Runas + Hechizos + Best by position ── */}
      <div className="home-row home-row-mid">
        <div className="home-center">
          {/* Runas section */}
          <div className="runas-section">
            <div className="section-title">RUNAS RECOMENDADAS</div>
            <div className="runas-controls">
              <div className="rune-preset-select">
                <select
                  value={selectedPreset}
                  onChange={(e) => setSelectedPreset(e.target.value)}
                  className="rune-select"
                >
                  {RUNE_PRESETS.map((p) => (
                    <option key={p.id} value={p.id}>{p.label}</option>
                  ))}
                </select>
              </div>
              <button className="rune-import-btn">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="14" height="14">
                  <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/>
                  <polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/>
                </svg>
                Importar Runas
              </button>
            </div>
            <div className="runes-grid">
              {RUNES_DOMINATION.map((r, i) => (
                <RuneCircle key={i} rune={r} size={42} />
              ))}
            </div>
          </div>

          {/* Hechizos section */}
          <div className="spells-section">
            <div className="section-title">HECHIZOS</div>
            <div className="spells-row">
              {SPELLS.map((s, i) => (
                <SpellIcon key={i} spell={s} size={56} />
              ))}
            </div>
            <button className="import-all-btn" onClick={handleImport} disabled={importing}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="14" height="14">
                <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/>
                <polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/>
              </svg>
              {importing ? 'Importando...' : 'Importar Todo'}
            </button>
          </div>
        </div>

        {/* Right panel: Best by position */}
        <div className="home-right">
          <div className="best-by-pos-section">
            <div className="section-title section-title-sm">
              MEJORES CAMPEONES POR POSICIÓN — PARCHE 14.8
            </div>
            <div className="best-by-pos-list">
              {BEST_BY_POSITION.map((p) => {
                const imgUrl = DD_KEYS[p.id] && ddVersion
                  ? getChampionUrl(p.id, ddVersion) : null;
                return (
                  <div key={p.role} className="best-pos-row">
                    <span className="best-pos-role">{p.role}</span>
                    <div className="best-pos-champ">
                      {imgUrl ? (
                        <img src={imgUrl} alt={p.name} className="best-pos-img" />
                      ) : (
                        <div className="best-pos-img-fallback">{p.name[0]}</div>
                      )}
                      <span className="best-pos-name">{p.name}</span>
                    </div>
                    <span className="best-pos-wr">{p.winRate}%</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* ── Row 3: Regions + Top global ── */}
      <div className="home-row home-row-bot">
        <div className="home-center home-center-full">
          {/* Region winrates */}
          <div className="regions-section">
            <div className="section-title">MEJOR WINRATE – REGIONES</div>
            <div className="regions-row">
              {REGION_STATS.map((r) => (
                <div key={r.code} className="region-stat">
                  <span className="region-stat-flag">{r.flag}</span>
                  <span className="region-stat-code">{r.code}</span>
                  <span className="region-stat-wr">{r.winRate}%</span>
                </div>
              ))}
            </div>
          </div>

          {/* Top global champions */}
          <div className="top-global-section">
            <div className="section-title">TOP CAMPEONES (GLOBAL)</div>
            <div className="top-global-wrap">
              <div className="world-map-bg">
                <svg viewBox="0 0 400 200" className="world-map-svg" opacity="0.15">
                  <path fill="#94a3b8" d="M50,80 Q80,60 110,70 Q140,80 130,100 Q120,120 100,115 Q70,110 50,95 Z"/>
                  <path fill="#94a3b8" d="M160,50 Q200,35 240,45 Q270,55 280,80 Q285,100 270,110 Q250,120 230,115 Q200,120 180,105 Q155,90 160,70 Z"/>
                  <path fill="#94a3b8" d="M290,60 Q320,50 345,65 Q360,80 355,100 Q345,115 325,110 Q305,105 295,90 Q285,75 290,60 Z"/>
                  <path fill="#94a3b8" d="M200,130 Q225,120 250,135 Q265,150 255,165 Q235,175 215,165 Q198,150 200,130 Z"/>
                  <path fill="#94a3b8" d="M80,130 Q105,120 120,140 Q125,160 110,170 Q90,175 75,160 Q65,145 80,130 Z"/>
                </svg>
              </div>
              <div className="top-global-cards">
                {TOP_GLOBAL.map((c, i) => (
                  <GlobalChampCard key={i} champ={c} ddVersion={ddVersion} />
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Right panel: Import buttons */}
        <div className="home-right home-right-bot">
          <button className="import-league-btn">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="20" height="20">
              <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/>
              <polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/>
            </svg>
            IMPORTAR A LEAGUE
          </button>
          <button className="import-runes-btn">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="16" height="16">
              <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
            </svg>
            RUNAS + HECHIZOS
          </button>
        </div>
      </div>
    </div>
  );
}
