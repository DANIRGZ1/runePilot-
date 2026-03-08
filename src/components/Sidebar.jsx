import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

/* ─── LoL Hextech-style SVG icons ──────────────────────────────────────── */

const IconHome = () => (
  <svg viewBox="0 0 24 24" width="18" height="18" fill="none">
    <path d="M3 12L12 3l9 9" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M5 10v9a1 1 0 001 1h4v-5h4v5h4a1 1 0 001-1v-9" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
    <circle cx="12" cy="13" r="1.5" fill="currentColor" opacity="0.6"/>
  </svg>
);

const IconChampions = () => (
  <svg viewBox="0 0 24 24" width="18" height="18" fill="none">
    <path d="M12 2L14.5 7H20l-4 3.5L17.5 16 12 13 6.5 16 8 10.5 4 7h5.5L12 2z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"/>
    <path d="M9 19h6M12 16v5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
  </svg>
);

const IconCounters = () => (
  <svg viewBox="0 0 24 24" width="18" height="18" fill="none">
    <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.5"/>
    <circle cx="12" cy="12" r="4" stroke="currentColor" strokeWidth="1.2" opacity="0.6"/>
    <circle cx="12" cy="12" r="1.5" fill="currentColor"/>
    <line x1="12" y1="3" x2="12" y2="6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
    <line x1="12" y1="18" x2="12" y2="21" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
    <line x1="3" y1="12" x2="6" y2="12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
    <line x1="18" y1="12" x2="21" y2="12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
  </svg>
);

const IconRunes = () => (
  <svg viewBox="0 0 24 24" width="18" height="18" fill="none">
    <polygon points="12,2 20,7 20,17 12,22 4,17 4,7" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"/>
    <polygon points="12,6 17,9 17,15 12,18 7,15 7,9" stroke="currentColor" strokeWidth="1" strokeLinejoin="round" opacity="0.45"/>
    <path d="M12 9v6M9 12h6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" opacity="0.7"/>
  </svg>
);

const IconWinrates = () => (
  <svg viewBox="0 0 24 24" width="18" height="18" fill="none">
    <path d="M8 6H5a1 1 0 00-1 1v8a1 1 0 001 1h3V6zM14.5 3h-5a1 1 0 00-1 1v13a1 1 0 001 1h5a1 1 0 001-1V4a1 1 0 00-1-1zM20 9h-3v8h3a1 1 0 001-1v-6a1 1 0 00-1-1z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"/>
    <path d="M4 20h16" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" opacity="0.6"/>
  </svg>
);

const IconPosition = () => (
  <svg viewBox="0 0 24 24" width="18" height="18" fill="none">
    <rect x="2" y="15" width="4" height="7" rx="1" stroke="currentColor" strokeWidth="1.4"/>
    <rect x="7" y="10" width="4" height="12" rx="1" stroke="currentColor" strokeWidth="1.4"/>
    <rect x="13" y="10" width="4" height="12" rx="1" stroke="currentColor" strokeWidth="1.4"/>
    <rect x="18" y="15" width="4" height="7" rx="1" stroke="currentColor" strokeWidth="1.4"/>
    <path d="M10 4l2-2 2 2" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M12 2v8" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
  </svg>
);

const IconImport = () => (
  <svg viewBox="0 0 24 24" width="18" height="18" fill="none">
    <path d="M12 3v12M8 11l4 4 4-4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M4 17v2a2 2 0 002 2h12a2 2 0 002-2v-2" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/>
    <path d="M7 7H5a2 2 0 00-2 2v2M17 7h2a2 2 0 012 2v2" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" opacity="0.5"/>
  </svg>
);

const IconMeta = () => (
  <svg viewBox="0 0 24 24" width="18" height="18" fill="none">
    <path d="M4 6h16M4 10h10M4 14h12M4 18h8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
    <circle cx="19" cy="17" r="3.5" stroke="currentColor" strokeWidth="1.5"/>
    <path d="M19 15.5v1.5l1 1" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const IconGuides = () => (
  <svg viewBox="0 0 24 24" width="18" height="18" fill="none">
    <path d="M4 19.5A2.5 2.5 0 016.5 17H20" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
    <path d="M6.5 2H20v20H6.5A2.5 2.5 0 014 19.5v-15A2.5 2.5 0 016.5 2z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"/>
    <path d="M9 7h7M9 11h5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" opacity="0.6"/>
  </svg>
);

/* ─── Nav structure ─────────────────────────────────────────────────────── */

const navSections = [
  {
    label: 'Principal',
    items: [
      { id: 'inicio',    label: 'Inicio',            icon: <IconHome /> },
      { id: 'campeones', label: 'Campeones',          icon: <IconChampions /> },
    ],
  },
  {
    label: 'Análisis',
    items: [
      { id: 'counters',  label: 'Counters',           icon: <IconCounters /> },
      { id: 'runas',     label: 'Runas & Hechizos',   icon: <IconRunes /> },
      { id: 'winrates',  label: 'Winrates',           icon: <IconWinrates /> },
      { id: 'posicion',  label: 'Mejores por Lane',   icon: <IconPosition /> },
    ],
  },
  {
    label: 'Herramientas',
    items: [
      { id: 'importar',  label: 'Importar a League',  icon: <IconImport /> },
      { id: 'meta',      label: 'Meta & Parche',      icon: <IconMeta /> },
      { id: 'guias',     label: 'Guías & Builds',     icon: <IconGuides /> },
    ],
  },
];

/* ─── LoL hextech logo SVG ──────────────────────────────────────────────── */
function HextechLogo() {
  return (
    <svg viewBox="0 0 44 44" width="36" height="36">
      {/* Outer hex */}
      <polygon points="22,3 38,12 38,32 22,41 6,32 6,12"
        fill="none" stroke="currentColor" strokeWidth="1.5" opacity="0.9"/>
      {/* Inner hex */}
      <polygon points="22,10 32,16 32,28 22,34 12,28 12,16"
        fill="none" stroke="currentColor" strokeWidth="1" opacity="0.4"/>
      {/* Crystal */}
      <polygon points="22,14 29,19 27,27 17,27 15,19"
        fill="currentColor" opacity="0.15"/>
      <polygon points="22,14 29,19 27,27 17,27 15,19"
        stroke="currentColor" strokeWidth="0.8" opacity="0.7"/>
      {/* Gem center */}
      <circle cx="22" cy="21" r="3" fill="currentColor" opacity="0.9"/>
      {/* Connector lines */}
      <line x1="22" y1="3"  x2="22" y2="10" stroke="currentColor" strokeWidth="1" opacity="0.35"/>
      <line x1="22" y1="34" x2="22" y2="41" stroke="currentColor" strokeWidth="1" opacity="0.35"/>
    </svg>
  );
}

/* ─── NavItem component ─────────────────────────────────────────────────── */
function NavItem({ item, isActive, onClick }) {
  const [hovered, setHovered] = useState(false);

  return (
    <motion.button
      onClick={() => onClick(item.id)}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className={`nav-item ${isActive ? 'active' : ''}`}
      style={{ position: 'relative', overflow: 'hidden' }}
      whileTap={{ scale: 0.97 }}
    >
      {/* Active gold accent bar */}
      <AnimatePresence>
        {isActive && (
          <motion.div
            key="accent"
            initial={{ scaleY: 0, opacity: 0 }}
            animate={{ scaleY: 1, opacity: 1 }}
            exit={{ scaleY: 0, opacity: 0 }}
            transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
            style={{
              position: 'absolute', left: 0, top: '20%', bottom: '20%',
              width: 3, borderRadius: '0 2px 2px 0',
              background: 'var(--rp-gold)',
              transformOrigin: 'center',
            }}
          />
        )}
      </AnimatePresence>

      {/* Hover background shimmer */}
      <AnimatePresence>
        {(hovered || isActive) && (
          <motion.div
            key="bg"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            style={{
              position: 'absolute', inset: 0, borderRadius: 8,
              background: isActive
                ? 'linear-gradient(90deg, var(--rp-gold-dim) 0%, transparent 100%)'
                : 'var(--rp-hover)',
              pointerEvents: 'none',
            }}
          />
        )}
      </AnimatePresence>

      <motion.span
        className="nav-icon"
        animate={{ color: isActive ? 'var(--rp-gold)' : hovered ? 'var(--rp-text)' : 'var(--rp-text-muted)' }}
        transition={{ duration: 0.15 }}
        style={{ zIndex: 1, position: 'relative' }}
      >
        {item.icon}
      </motion.span>

      <motion.span
        className="nav-label"
        animate={{ color: isActive ? 'var(--rp-gold)' : hovered ? 'var(--rp-text)' : 'var(--rp-text-muted)' }}
        transition={{ duration: 0.15 }}
        style={{ zIndex: 1, position: 'relative', fontWeight: isActive ? 600 : 500 }}
      >
        {item.label}
      </motion.span>

      {/* NUEVO badge for meta section */}
      {item.id === 'meta' && (
        <motion.span
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          style={{
            marginLeft: 'auto', fontSize: 9, fontWeight: 800,
            padding: '1px 5px', borderRadius: 4,
            background: 'var(--rp-gold)', color: '#1a1100',
            letterSpacing: '0.5px', zIndex: 1, position: 'relative',
          }}
        >
          NUEVO
        </motion.span>
      )}
    </motion.button>
  );
}

/* ─── Main Sidebar ──────────────────────────────────────────────────────── */
export default function Sidebar({ activeView, onNavigate, lcuStatus, version, darkMode, onToggleDark }) {
  const isConnected = lcuStatus === 'connected';

  return (
    <motion.aside
      className="sidebar"
      initial={{ x: -20, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
    >
      {/* ── Logo ── */}
      <div className="sidebar-logo">
        <motion.div
          className="sidebar-logo-icon"
          style={{ color: 'var(--rp-gold)' }}
          whileHover={{ rotate: 30, scale: 1.1 }}
          transition={{ type: 'spring', stiffness: 300, damping: 20 }}
        >
          <HextechLogo />
        </motion.div>
        <div className="sidebar-logo-text">
          <span className="sidebar-brand">RunePilot</span>
          <span className="sidebar-sub">League Optimizer</span>
        </div>
      </div>

      {/* ── Nav sections ── */}
      <nav className="sidebar-nav" style={{ gap: 0, padding: '10px 10px' }}>
        {navSections.map((section, si) => (
          <div key={section.label} style={{ marginBottom: si < navSections.length - 1 ? 16 : 0 }}>
            {/* Section label */}
            <div style={{
              fontSize: 9.5, fontWeight: 700, letterSpacing: '1.2px', textTransform: 'uppercase',
              color: 'var(--rp-text-sub)', padding: '0 12px', marginBottom: 4,
            }}>
              {section.label}
            </div>

            {/* Items */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              {section.items.map((item, ii) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: si * 0.06 + ii * 0.04, duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                >
                  <NavItem
                    item={item}
                    isActive={activeView === item.id}
                    onClick={onNavigate}
                  />
                </motion.div>
              ))}
            </div>
          </div>
        ))}
      </nav>

      {/* ── Footer ── */}
      <div className="sidebar-footer" style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {/* LCU status */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
          <motion.span
            animate={{
              background: isConnected ? '#52b788' : '#6b7280',
              boxShadow: isConnected ? '0 0 6px #52b78866' : 'none',
            }}
            transition={{ duration: 0.4 }}
            style={{ width: 8, height: 8, borderRadius: '50%', flexShrink: 0 }}
          />
          <span style={{ fontSize: 12, color: 'var(--rp-text-muted)', flex: 1 }}>
            {isConnected ? 'Conectado' : 'Desconectado'}
          </span>

          {/* Dark mode toggle */}
          <motion.button
            onClick={onToggleDark}
            title={darkMode ? 'Modo claro' : 'Modo oscuro'}
            whileHover={{ scale: 1.08 }}
            whileTap={{ scale: 0.92 }}
            style={{
              background: 'none', border: '1px solid var(--rp-border)',
              borderRadius: 7, width: 30, height: 30, cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 14, color: 'var(--rp-text-muted', flexShrink: 0,
            }}
          >
            <AnimatePresence mode="wait">
              <motion.span
                key={darkMode ? 'sun' : 'moon'}
                initial={{ rotate: -90, opacity: 0, scale: 0.5 }}
                animate={{ rotate: 0, opacity: 1, scale: 1 }}
                exit={{ rotate: 90, opacity: 0, scale: 0.5 }}
                transition={{ duration: 0.2 }}
              >
                {darkMode ? '☀️' : '🌙'}
              </motion.span>
            </AnimatePresence>
          </motion.button>
        </div>

        {/* Version */}
        <div style={{ fontSize: 10, color: 'var(--rp-text-sub)', letterSpacing: '0.5px' }}>
          {version || 'v2.3.1'}
        </div>
      </div>
    </motion.aside>
  );
}
