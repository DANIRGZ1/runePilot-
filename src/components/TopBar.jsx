import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const REGIONS = [
  { code: 'EUW', flag: '🌍' },
  { code: 'NA',  flag: '🇺🇸' },
  { code: 'KR',  flag: '🇰🇷' },
  { code: 'LAS', flag: '🌎' },
  { code: 'BR',  flag: '🇧🇷' },
];

/* Icono de diales/control — reemplaza al engranaje */
function TuneIcon({ size = 18 }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
      width={size} height={size} strokeLinecap="round" strokeLinejoin="round">
      <line x1="4"  y1="6"  x2="20" y2="6"/>
      <line x1="4"  y1="12" x2="20" y2="12"/>
      <line x1="4"  y1="18" x2="20" y2="18"/>
      <circle cx="8"  cy="6"  r="2" fill="currentColor" stroke="none"/>
      <circle cx="16" cy="12" r="2" fill="currentColor" stroke="none"/>
      <circle cx="10" cy="18" r="2" fill="currentColor" stroke="none"/>
    </svg>
  );
}

export default function TopBar({
  searchQuery, onSearchChange,
  activeRegion, onRegionChange,
  ddVersion,
  darkMode, onToggleDark,
  autoImportEnabled, onToggleAutoImport,
}) {
  const [settingsOpen, setSettingsOpen] = useState(false);
  const panelRef = useRef(null);

  /* Cierra panel al hacer clic fuera */
  useEffect(() => {
    if (!settingsOpen) return;
    function handleClick(e) {
      if (panelRef.current && !panelRef.current.contains(e.target)) {
        setSettingsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [settingsOpen]);

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

        {/* Settings button */}
        <div style={{ position: 'relative' }} ref={panelRef}>
          <button
            className={`topbar-icon-btn settings-btn ${settingsOpen ? 'active' : ''}`}
            title="Configuración"
            onClick={() => setSettingsOpen(o => !o)}
          >
            <motion.div
              animate={{ rotate: settingsOpen ? 180 : 0 }}
              transition={{ duration: 0.4, ease: 'easeInOut' }}
              style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}
            >
              <TuneIcon size={18} />
            </motion.div>
          </button>

          <AnimatePresence>
            {settingsOpen && (
              <motion.div
                className="settings-panel"
                initial={{ opacity: 0, y: -8, scale: 0.96 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -8, scale: 0.96 }}
                transition={{ duration: 0.2, ease: 'easeOut' }}
              >
                <div className="settings-header">
                  <TuneIcon size={14} />
                  <span>Configuración</span>
                </div>

                {/* Auto-import */}
                <div className="settings-section">
                  <div className="settings-section-title">Importación automática</div>
                  <div className="settings-row">
                    <div className="settings-row-info">
                      <span className="settings-row-label">Auto-importar runas</span>
                      <span className="settings-row-desc">Importa runas al bloquear campeón</span>
                    </div>
                    <label className="switch settings-switch">
                      <input type="checkbox" checked={!!autoImportEnabled} onChange={onToggleAutoImport} />
                      <span className="slider" />
                    </label>
                  </div>
                </div>

                {/* Apariencia */}
                <div className="settings-section">
                  <div className="settings-section-title">Apariencia</div>
                  <div className="settings-row">
                    <div className="settings-row-info">
                      <span className="settings-row-label">Modo oscuro</span>
                      <span className="settings-row-desc">Alterna entre tema claro y oscuro</span>
                    </div>
                    <label className="switch settings-switch">
                      <input type="checkbox" checked={!!darkMode} onChange={onToggleDark} />
                      <span className="slider" />
                    </label>
                  </div>
                </div>

                {/* Región */}
                <div className="settings-section">
                  <div className="settings-section-title">Región activa</div>
                  <div className="settings-regions-grid">
                    {REGIONS.map(r => (
                      <button
                        key={r.code}
                        className={`settings-region-chip ${activeRegion === r.code ? 'active' : ''}`}
                        onClick={() => onRegionChange(r.code)}
                      >
                        <span>{r.flag}</span>
                        <span>{r.code}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Atajos de teclado */}
                <div className="settings-section">
                  <div className="settings-section-title">Atajos de teclado</div>
                  <div className="settings-shortcuts">
                    <div className="settings-shortcut-row">
                      <span className="settings-shortcut-label">Limpiar draft</span>
                      <kbd>Ctrl + R</kbd>
                    </div>
                    <div className="settings-shortcut-row">
                      <span className="settings-shortcut-label">Buscar campeón</span>
                      <kbd>Ctrl + F</kbd>
                    </div>
                    <div className="settings-shortcut-row">
                      <span className="settings-shortcut-label">Modo oscuro</span>
                      <kbd>Ctrl + D</kbd>
                    </div>
                  </div>
                </div>

                {/* Info */}
                <div className="settings-footer">
                  <div className="settings-footer-row">
                    <span>Versión</span>
                    <span className="settings-footer-val">v2.3.1</span>
                  </div>
                  {ddVersion && (
                    <div className="settings-footer-row">
                      <span>Parche LoL</span>
                      <span className="settings-footer-val">{ddVersion.split('.').slice(0,2).join('.')}</span>
                    </div>
                  )}
                  <div className="settings-footer-row">
                    <span>Datos</span>
                    <span className="settings-footer-val">Riot Data Dragon</span>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

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
