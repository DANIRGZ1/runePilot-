import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import RankIcon, { RANK_COLORS } from './RankIcon';

const GREETINGS = [
  '¡Bienvenido de vuelta',
  '¡Listo para rankear',
  '¡Todo preparado',
  '¡A por esa LP',
];

/**
 * WelcomeBanner
 * Aparece al conectar el cliente con LCU y carga los datos del invocador.
 * Se cierra automáticamente a los 6 segundos o con el botón ✕.
 */
export default function WelcomeBanner({ playerData, onDismiss }) {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const t = setTimeout(() => {
      setVisible(false);
      setTimeout(onDismiss, 350);
    }, 6000);
    return () => clearTimeout(t);
  }, [onDismiss]);

  const dismiss = () => {
    setVisible(false);
    setTimeout(onDismiss, 350);
  };

  const summoner = playerData?.summoner;
  const ranked   = playerData?.ranked;
  const name     = summoner?.displayName || summoner?.gameName || summoner?.name || 'Invocador';
  const tier     = (ranked?.tier || 'UNRANKED').toUpperCase();
  const division = ranked?.rank || '';
  const lp       = ranked?.leaguePoints ?? null;
  const wins     = ranked?.wins ?? 0;
  const losses   = ranked?.losses ?? 0;
  const wr       = wins + losses > 0 ? ((wins / (wins + losses)) * 100).toFixed(0) : null;
  const color    = RANK_COLORS[tier] || RANK_COLORS.UNRANKED;

  const greetingText = GREETINGS[Math.floor(Date.now() / 86400000) % GREETINGS.length];
  const rankLabel    = tier !== 'UNRANKED'
    ? `${tier} ${division}${lp !== null ? ` — ${lp} LP` : ''}${wr ? ` — ${wr}% WR (${wins}V/${losses}D)` : ''}`
    : 'Sin clasificar';

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0, y: -70, scale: 0.96 }}
          animate={{ opacity: 1, y: 0,   scale: 1     }}
          exit   ={{ opacity: 0, y: -50, scale: 0.96  }}
          transition={{ type: 'spring', stiffness: 320, damping: 28 }}
          style={{
            position: 'fixed', top: 16, left: '50%', translateX: '-50%',
            transform: 'translateX(-50%)',
            zIndex: 10000,
          }}
        >
          <div style={{
            background: 'var(--rp-surface)',
            border: `1px solid ${color}`,
            borderRadius: 14,
            padding: '14px 18px 14px 14px',
            display: 'flex', alignItems: 'center', gap: 14,
            boxShadow: `0 8px 40px rgba(0,0,0,0.45), 0 0 0 1px ${color}44`,
            minWidth: 340, maxWidth: 480,
            backdropFilter: 'blur(8px)',
          }}>
            {/* Emblema de rango */}
            <RankIcon tier={tier} size={52} division={division} />

            {/* Info */}
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 11, color, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.9px', marginBottom: 3 }}>
                {greetingText}, {name}!
              </div>
              <div style={{ fontSize: 16, fontWeight: 800, color: 'var(--rp-text)', marginBottom: 4, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {name}
              </div>
              <div style={{ fontSize: 12, color: 'var(--rp-text-muted)' }}>{rankLabel}</div>
            </div>

            {/* Barra de progreso (cuenta regresiva 6 s) */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
              <button
                onClick={dismiss}
                style={{ background: 'none', border: 'none', color: 'var(--rp-text-muted)', cursor: 'pointer', fontSize: 16, lineHeight: 1, padding: 2 }}
              >✕</button>
            </div>
          </div>

          {/* Barra de progreso que se vacía en 6s */}
          <motion.div
            initial={{ scaleX: 1 }}
            animate={{ scaleX: 0 }}
            transition={{ duration: 6, ease: 'linear' }}
            style={{
              height: 3, background: color, borderRadius: '0 0 8px 8px',
              transformOrigin: 'left',
              marginTop: -1,
            }}
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
}
