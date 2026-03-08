import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

/* ─────────────────────────────────────────────────────────────────
   Base de datos local de cambios por parche.
   Clave = "X.Y"  →  se hace match con ddVersion "X.Y.Z"
   Actualizar cuando salga un parche nuevo.
───────────────────────────────────────────────────────────────── */
const PATCH_DB = {
  '15.6': {
    date: '19 Mar 2025',
    summary: [
      'Ajustes al sistema de objetos: precio de varios míticos reducido.',
      'Cambios en la mecánica de Baron Nashor.',
      'Mejoras de rendimiento y corrección de bugs.',
    ],
    buffed:    ['Ahri', 'Lux', 'Senna', 'Kayle', 'Malphite'],
    nerfed:    ['Zed', 'Darius', 'Caitlyn', 'Hecarim', 'Yone'],
    adjusted:  ['Garen', 'Lee Sin', 'Ezreal', 'Thresh'],
  },
  '15.5': {
    date: '5 Mar 2025',
    summary: [
      'Nuevo ciclo de dragones elementales ajustado.',
      'Cambios en el sistema de visión tardía.',
      'Rebalanceo de campeones de jungla.',
    ],
    buffed:    ['Orianna', 'Viktor', 'Jinx', 'Nami'],
    nerfed:    ['Katarina', 'Syndra', 'Veigar', 'Fizz'],
    adjusted:  ['Yasuo', 'Graves', 'Nidalee'],
  },
  '15.4': {
    date: '19 Feb 2025',
    summary: [
      'Sistema de objetos míticos actualizado para magos.',
      'Reequilibrio global de campeones de jungla.',
      'Baron Nashor otorga más control de oleada.',
      'Mejoras al sistema de visión de mid game.',
    ],
    buffed:    ['Ahri', 'Lux', 'Jinx', 'Thresh', 'Orianna', 'Viktor'],
    nerfed:    ['Zed', 'Katarina', 'Darius', 'Caitlyn', 'Hecarim'],
    adjusted:  ['Garen', 'Yasuo', 'Lee Sin', 'Ezreal'],
  },
};

/* Fallback genérico para parches no incluidos en la DB */
const FALLBACK_PATCH = {
  date: '—',
  summary: ['Consulta las notas oficiales para ver todos los cambios.'],
  buffed: [], nerfed: [], adjusted: [],
};

/* ─────────────────────────────────────────────────────────────────
   Componente de chip de campeón con etiqueta MAIN
───────────────────────────────────────────────────────────────── */
function ChampChip({ name, type, isMain }) {
  const styles = {
    buff:    { color: '#52b788', border: '#52b788', bg: '#52b78814' },
    nerf:    { color: '#ef4444', border: '#ef4444', bg: '#ef444414' },
    adjust:  { color: '#f59e0b', border: '#f59e0b', bg: '#f59e0b14' },
  };
  const s = styles[type] || styles.adjust;
  const symbol = type === 'buff' ? '↑' : type === 'nerf' ? '↓' : '~';

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '4px 8px', borderRadius: 5, background: s.bg, border: `1px solid ${s.border}44`, fontSize: 12, color: s.color, fontWeight: 600 }}>
      <span style={{ fontSize: 13 }}>{symbol}</span>
      <span>{name}</span>
      {isMain && (
        <span style={{ marginLeft: 3, padding: '1px 5px', borderRadius: 3, background: 'var(--rp-gold)', color: '#000', fontSize: 9, fontWeight: 800, letterSpacing: '0.5px' }}>MAIN</span>
      )}
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────
   Sección colapsable de cambios (Buffs / Nerfs / Ajustes)
───────────────────────────────────────────────────────────────── */
function ChangeSection({ title, accent, champs, mains }) {
  if (!champs?.length) return null;
  return (
    <div style={{ background: 'var(--rp-surface)', borderRadius: 10, padding: '14px', border: `1px solid ${accent}44` }}>
      <div style={{ fontSize: 11, fontWeight: 700, color: accent, textTransform: 'uppercase', letterSpacing: '0.8px', marginBottom: 10 }}>{title}</div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
        {champs.map((name, i) => {
          const isMain = mains.some(m => m.toLowerCase() === name.toLowerCase());
          const type = accent === '#52b788' ? 'buff' : accent === '#ef4444' ? 'nerf' : 'adjust';
          return (
            <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '4px 0', borderBottom: i < champs.length - 1 ? '1px solid var(--rp-border)' : 'none' }}>
              <span style={{ fontSize: 13, color: 'var(--rp-text)' }}>{name}</span>
              {isMain && (
                <span style={{ padding: '2px 6px', borderRadius: 3, background: 'var(--rp-gold)', color: '#000', fontSize: 9, fontWeight: 800, letterSpacing: '0.5px' }}>MAIN ⚠️</span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────
   Componente principal MetaPatchView
───────────────────────────────────────────────────────────────── */
export default function MetaPatchView({ ddVersion, playerData }) {
  const [alertDismissed, setAlertDismissed] = useState(false);
  const [showPatchNotes, setShowPatchNotes] = useState(false);

  /* Detectar parche nuevo */
  const patchKey = ddVersion?.split('.').slice(0, 2).join('.') || '15.4';
  const patchInfo = PATCH_DB[patchKey] || FALLBACK_PATCH;

  const [isNewPatch, setIsNewPatch] = useState(false);
  useEffect(() => {
    if (!ddVersion) return;
    const stored = localStorage.getItem('rp_lastSeenPatch');
    if (stored !== ddVersion) setIsNewPatch(true);
  }, [ddVersion]);

  const dismissNewPatch = () => {
    localStorage.setItem('rp_lastSeenPatch', ddVersion);
    setIsNewPatch(false);
    setAlertDismissed(true);
  };

  /* Mains: extraer los campeones más jugados del historial */
  const playerMains = useMemo(() => {
    const history = playerData?.history;
    if (!Array.isArray(history) || !history.length) return [];
    const counts = {};
    history.forEach(m => {
      const n = m.championName || m.champion;
      if (n) counts[n] = (counts[n] || 0) + 1;
    });
    return Object.entries(counts).sort((a, b) => b[1] - a[1]).slice(0, 6).map(([n]) => n);
  }, [playerData]);

  /* Mains afectados por el parche */
  const affectedMains = useMemo(() => {
    if (!playerMains.length) return [];
    const all = [
      ...patchInfo.buffed.map(n  => ({ name: n, type: 'buff'   })),
      ...patchInfo.nerfed.map(n  => ({ name: n, type: 'nerf'   })),
      ...patchInfo.adjusted.map(n => ({ name: n, type: 'adjust' })),
    ];
    return all.filter(c => playerMains.some(m => m.toLowerCase() === c.name.toLowerCase()));
  }, [playerMains, patchInfo]);

  return (
    <div style={{ height: '100%', overflowY: 'auto', padding: '22px 24px' }}>
      <div style={{ maxWidth: 820, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 16 }}>

        {/* ── Alerta de parche nuevo ── */}
        <AnimatePresence>
          {isNewPatch && !alertDismissed && (
            <motion.div
              key="new-patch"
              initial={{ opacity: 0, y: -14 }}
              animate={{ opacity: 1, y: 0 }}
              exit   ={{ opacity: 0, y: -14 }}
              style={{ background: 'var(--rp-gold-dim)', border: '1px solid var(--rp-gold)', borderRadius: 10, padding: '13px 16px', display: 'flex', alignItems: 'center', gap: 12 }}
            >
              <span style={{ fontSize: 24 }}>🆕</span>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 700, color: 'var(--rp-gold)', fontSize: 14 }}>¡Nuevo parche activo — {patchKey}!</div>
                <div style={{ color: 'var(--rp-text-muted)', fontSize: 12, marginTop: 2 }}>
                  El parche {patchKey} ({patchInfo.date}) ya está disponible. Revisa los cambios antes de jugar.
                </div>
              </div>
              <button
                onClick={dismissNewPatch}
                style={{ background: 'none', border: 'none', color: 'var(--rp-text-muted)', cursor: 'pointer', fontSize: 18, padding: '0 4px' }}
              >✕</button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── Alerta de mains afectados ── */}
        <AnimatePresence>
          {affectedMains.length > 0 && (
            <motion.div
              key="mains-alert"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.08 }}
              style={{ background: '#ef444410', border: '1px solid #ef4444', borderRadius: 10, padding: '13px 16px' }}
            >
              <div style={{ fontWeight: 700, color: '#ef4444', fontSize: 14, marginBottom: 10 }}>
                ⚠️ Alerta de parche — tus mains tienen cambios en {patchKey}
              </div>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                {affectedMains.map((c, i) => <ChampChip key={i} name={c.name} type={c.type} isMain />)}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── Cabecera: versión de parche ── */}
        <div style={{ background: 'var(--rp-surface)', borderRadius: 12, padding: '20px 22px', border: '1px solid var(--rp-border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <div style={{ fontSize: 10, color: 'var(--rp-text-muted)', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: 4 }}>Parche activo</div>
            <div style={{ fontSize: 36, fontWeight: 900, color: 'var(--rp-gold)', lineHeight: 1 }}>{patchKey}</div>
            <div style={{ fontSize: 12, color: 'var(--rp-text-muted)', marginTop: 4 }}>{patchInfo.date}</div>
          </div>
          <div style={{ textAlign: 'right', display: 'flex', flexDirection: 'column', gap: 8, alignItems: 'flex-end' }}>
            {isNewPatch && (
              <div style={{ padding: '6px 14px', background: 'var(--rp-gold)', borderRadius: 6, fontSize: 12, fontWeight: 800, color: '#000', letterSpacing: '0.5px' }}>NUEVO</div>
            )}
            <button
              onClick={() => setShowPatchNotes(v => !v)}
              style={{ background: 'none', border: '1px dashed var(--rp-gold)', borderRadius: 6, color: 'var(--rp-gold)', fontSize: 12, cursor: 'pointer', padding: '4px 10px' }}
            >
              {showPatchNotes ? 'Ocultar notas' : 'Notas completas →'}
            </button>
          </div>
        </div>

        {/* ── Resumen del parche ── */}
        <div style={{ background: 'var(--rp-surface)', borderRadius: 12, padding: '18px 20px', border: '1px solid var(--rp-border)' }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--rp-text)', marginBottom: 12 }}>📋 Resumen del parche</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {patchInfo.summary.map((line, i) => (
              <div key={i} style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                <span style={{ color: 'var(--rp-gold)', fontSize: 14, marginTop: 1, flexShrink: 0 }}>•</span>
                <span style={{ fontSize: 13, color: 'var(--rp-text-muted)', lineHeight: 1.6 }}>{line}</span>
              </div>
            ))}
          </div>
        </div>

        {/* ── Tus mains (si están disponibles) ── */}
        {playerMains.length > 0 && (
          <div style={{ background: 'var(--rp-surface)', borderRadius: 12, padding: '16px 20px', border: '1px solid var(--rp-border)' }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--rp-text)', marginBottom: 10 }}>🎮 Tus mains este parche</div>
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
              {playerMains.map((name, i) => {
                const affected = affectedMains.find(c => c.name.toLowerCase() === name.toLowerCase());
                return (
                  <ChampChip key={i} name={name} type={affected?.type || 'adjust'} isMain={!!affected} />
                );
              })}
            </div>
            {affectedMains.length === 0 && (
              <div style={{ marginTop: 8, fontSize: 12, color: '#52b788' }}>✓ Ninguno de tus mains fue tocado en el parche {patchKey}</div>
            )}
          </div>
        )}

        {/* ── Grid de cambios: Buffs / Nerfs / Ajustes ── */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12 }}>
          <ChangeSection title="↑ Buffed"    accent="#52b788" champs={patchInfo.buffed}    mains={playerMains} />
          <ChangeSection title="↓ Nerfed"    accent="#ef4444" champs={patchInfo.nerfed}    mains={playerMains} />
          <ChangeSection title="~ Ajustados" accent="#f59e0b" champs={patchInfo.adjusted}  mains={playerMains} />
        </div>

        {/* ── Notas del parche embebidas ── */}
        <AnimatePresence>
          {showPatchNotes && (
            <motion.div
              key="patch-notes-webview"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 640 }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.25 }}
              style={{ overflow: 'hidden', borderRadius: 12, border: '1px solid var(--rp-border)' }}
            >
              <div style={{ background: 'var(--rp-surface)', padding: '10px 14px', borderBottom: '1px solid var(--rp-border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--rp-text)' }}>
                  📄 Notas del parche {patchKey} — leagueoflegends.com
                </span>
                <button
                  onClick={() => setShowPatchNotes(false)}
                  style={{ background: 'none', border: 'none', color: 'var(--rp-text-muted)', cursor: 'pointer', fontSize: 16, lineHeight: 1, padding: '0 4px' }}
                >✕</button>
              </div>
              <webview
                src={`https://www.leagueoflegends.com/en-us/news/game-updates/patch-${patchKey.replace('.', '-')}-notes/`}
                style={{ width: '100%', height: 590, display: 'block' }}
                partition="persist:patchnotes"
              />
            </motion.div>
          )}
        </AnimatePresence>

      </div>
    </div>
  );
}
