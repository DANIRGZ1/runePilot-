import React from 'react';

/**
 * Iconos oficiales de rol de LoL (SVG inline, dos tonos).
 * Orden imagen izq→der: JUNGLE · TOP · MID · ADC · SUPPORT
 *
 * Se usan dos capas por icono:
 *  – opacity 0.28 → parte gris clara (fondo del frame)
 *  – opacity 1    → parte oscura/dorada (forma principal)
 */
const ROLE_SVG = {

  /* ── JUNGLE: tres cuchillas de hierba/hoja afiladas ── */
  JUNGLE: (s) => (
    <svg viewBox="0 0 100 100" width={s} height={s}>
      {/* Hoja izquierda */}
      <path fill="currentColor" d="M50 95 L10 68 L5 26 L24 8 L35 54 Z"/>
      {/* Espiga central (la más alta) */}
      <path fill="currentColor" d="M46 95 L40 60 L50 2 L60 60 L54 95 Z"/>
      {/* Hoja derecha (espejo de la izquierda) */}
      <path fill="currentColor" d="M50 95 L65 54 L76 8 L95 26 L90 68 Z"/>
    </svg>
  ),

  /* ── TOP: marco cuadrado 3D, oscuro abajo-izquierda ── */
  TOP: (s) => (
    <svg viewBox="0 0 100 100" width={s} height={s}>
      {/* Frame gris: pared superior + derecha */}
      <path fill="currentColor" opacity="0.28"
        d="M18 4 L96 4 L96 82 L82 82 L82 18 L18 18 Z"/>
      {/* Frame oscuro: pared izquierda + inferior (L invertida) */}
      <path fill="currentColor"
        d="M4 4 L18 4 L18 82 L96 82 L96 96 L4 96 Z"/>
      {/* Cuadro interior oscuro flotante */}
      <rect fill="currentColor" x="33" y="33" width="28" height="28" rx="2"/>
    </svg>
  ),

  /* ── MID: pájaro/mariposa con gema y corbata ── */
  MID: (s) => (
    <svg viewBox="0 0 100 100" width={s} height={s} fill="currentColor">
      {/* Gema / diamante central (cabeza) */}
      <path d="M50 8 L62 24 L50 34 L38 24 Z"/>
      {/* Ala izquierda */}
      <path d="M50 30 L2 44 L14 52 L2 62 L34 56 L44 68 L50 50 Z"/>
      {/* Ala derecha (espejo) */}
      <path d="M50 30 L98 44 L86 52 L98 62 L66 56 L56 68 L50 50 Z"/>
      {/* Cuerpo / corbata colgante */}
      <path d="M44 64 L50 96 L56 64 L50 52 Z"/>
    </svg>
  ),

  /* ── ADC: marco cuadrado con diagonal gruesa ── */
  ADC: (s) => (
    <svg viewBox="0 0 100 100" width={s} height={s}>
      {/* Marco gris completo (anillo) */}
      <path fill="currentColor" opacity="0.28" fillRule="evenodd"
        d="M4 4 L96 4 L96 96 L4 96 Z M18 18 L82 18 L82 82 L18 82 Z"/>
      {/* Banda diagonal oscura de esquina a esquina */}
      <path fill="currentColor"
        d="M4 68 L4 96 L32 96 L96 32 L96 4 L68 4 Z"/>
    </svg>
  ),

  /* ── SUPPORT: marco 3D, oscuro arriba-derecha (rotación de TOP) ── */
  SUPPORT: (s) => (
    <svg viewBox="0 0 100 100" width={s} height={s}>
      {/* Frame gris: pared inferior + izquierda */}
      <path fill="currentColor" opacity="0.28"
        d="M4 18 L18 18 L18 82 L82 82 L82 96 L4 96 Z"/>
      {/* Frame oscuro: pared superior + derecha (L) */}
      <path fill="currentColor"
        d="M4 4 L96 4 L96 96 L82 96 L82 18 L4 18 Z"/>
      {/* Cuadro interior oscuro flotante */}
      <rect fill="currentColor" x="33" y="33" width="28" height="28" rx="2"/>
    </svg>
  ),
};

/* Alias para nombres alternativos del LCU */
ROLE_SVG.MIDDLE  = ROLE_SVG.MID;
ROLE_SVG.BOTTOM  = ROLE_SVG.ADC;
ROLE_SVG.UTILITY = ROLE_SVG.SUPPORT;
ROLE_SVG.FILL    = ROLE_SVG.MID; // fallback razonable

export function RoleIcon({ role, size = 20, style }) {
  const fn = ROLE_SVG[role?.toUpperCase?.()];
  if (!fn) return null;
  return (
    <span style={{ display: 'inline-flex', flexShrink: 0, ...style }} aria-label={role}>
      {fn(size)}
    </span>
  );
}
