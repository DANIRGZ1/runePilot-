import React from 'react';

/**
 * Iconos de rol del proyecto — orden en imagen izq→der:
 *   1. JUNGLE  2. ADC  3. SUPPORT  4. MID  5. TOP
 */
const ROLE_SVG = {

  /* ── 1. JUNGLE: tres cuchillas de hierba/hoja afiladas ── */
  JUNGLE: (s) => (
    <svg viewBox="0 0 100 100" width={s} height={s} fill="currentColor">
      {/* Hoja izquierda — arranca desde la base, apunta arriba-izquierda */}
      <path d="M48 94 L6 62 L4 20 L26 4 L36 50 Z"/>
      {/* Espiga central — la más alta y estrecha */}
      <path d="M44 94 L40 58 L50 2 L60 58 L56 94 Z"/>
      {/* Hoja derecha — espejo de la izquierda */}
      <path d="M52 94 L64 50 L74 4 L96 20 L94 62 Z"/>
    </svg>
  ),

  /* ── 2. ADC: marco 3D con profundidad abajo-izquierda + cuadro interior ── */
  ADC: (s) => (
    <svg viewBox="0 0 100 100" width={s} height={s}>
      {/* Paredes gris claro: superior + derecha */}
      <path fill="currentColor" opacity="0.28"
        d="M18 4 L96 4 L96 82 L82 82 L82 18 L18 18 Z"/>
      {/* Paredes oscuras: izquierda + inferior (efecto 3D) */}
      <path fill="currentColor"
        d="M4 4 L18 4 L18 82 L96 82 L96 96 L4 96 Z"/>
      {/* Cuadro interior flotante */}
      <rect fill="currentColor" x="33" y="33" width="28" height="28" rx="2"/>
    </svg>
  ),

  /* ── 3. SUPPORT: pájaro/ángel con alas geométricas y cuerpo-corbata ── */
  SUPPORT: (s) => (
    <svg viewBox="0 0 100 100" width={s} height={s} fill="currentColor">
      {/* Gema / diamante en la cabeza */}
      <path d="M50 6 L63 22 L50 34 L37 22 Z"/>
      {/* Ala izquierda — angular, con corte interior */}
      <path d="M50 28 L2 42 L14 52 L2 62 L36 55 L46 68 L50 50 Z"/>
      {/* Ala derecha — espejo exacto */}
      <path d="M50 28 L98 42 L86 52 L98 62 L64 55 L54 68 L50 50 Z"/>
      {/* Cuerpo / corbata colgante */}
      <path d="M44 64 L50 96 L56 64 L50 52 Z"/>
    </svg>
  ),

  /* ── 4. MID: marco cuadrado con banda diagonal gruesa ── */
  MID: (s) => (
    <svg viewBox="0 0 100 100" width={s} height={s}>
      {/* Anillo / marco gris claro (visible en los 4 lados) */}
      <path fill="currentColor" opacity="0.28" fillRule="evenodd"
        d="M4 4 L96 4 L96 96 L4 96 Z M18 18 L82 18 L82 82 L18 82 Z"/>
      {/* Banda diagonal oscura de esquina a esquina */}
      <path fill="currentColor"
        d="M4 68 L4 96 L32 96 L96 32 L96 4 L68 4 Z"/>
    </svg>
  ),

  /* ── 5. TOP: cuatro corchetes en esquinas + cuadro central ── */
  TOP: (s) => (
    <svg viewBox="0 0 100 100" width={s} height={s} fill="currentColor">
      {/* Corchete esquina superior-izquierda */}
      <path d="M4 4 L4 30 L18 30 L18 18 L30 18 L30 4 Z"/>
      {/* Corchete esquina superior-derecha */}
      <path d="M96 4 L70 4 L70 18 L82 18 L82 30 L96 30 Z"/>
      {/* Corchete esquina inferior-izquierda */}
      <path d="M4 96 L30 96 L30 82 L18 82 L18 70 L4 70 Z"/>
      {/* Corchete esquina inferior-derecha */}
      <path d="M96 96 L96 70 L82 70 L82 82 L70 82 L70 96 Z"/>
      {/* Cuadro central */}
      <rect x="35" y="35" width="30" height="30" rx="2"/>
    </svg>
  ),
};

/* Alias para nombres alternativos del LCU */
ROLE_SVG.BOTTOM  = ROLE_SVG.ADC;
ROLE_SVG.MIDDLE  = ROLE_SVG.MID;
ROLE_SVG.UTILITY = ROLE_SVG.SUPPORT;
ROLE_SVG.FILL    = ROLE_SVG.SUPPORT;

export function RoleIcon({ role, size = 20, style }) {
  const fn = ROLE_SVG[role?.toUpperCase?.()];
  if (!fn) return null;
  return (
    <span style={{ display: 'inline-flex', flexShrink: 0, ...style }} aria-label={role}>
      {fn(size)}
    </span>
  );
}
