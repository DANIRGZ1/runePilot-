import React from 'react';

const ROLE_SVG = {

  /* ── JUNGLE ── */
  JUNGLE: (s) => (
    <svg viewBox="0 0 112 125" width={s} height={s} fill="currentColor">
      <path d="M64.5 60C66.9 64.8 68.1667 71.3333 68.5 74L74 61C73.6667 60 73.2 56 74 48C74.8 40 84.6667 13.3333 89.5 1C85.3333 6.66667 76 19.5 72 25.5C68 31.5 61.3333 44 58.5 49.5C59.5 51 62.1 55.2 64.5 60Z"/>
      <path d="M81 97.5C78.2 99.9 74.5 104.167 73 106L72.5 91.5C73 89.5 74.3 84.5 75.5 80.5C76.7 76.5 80 68 86.5 56.5C88.1667 54 92.9 47.7 96.5 44.5C100.1 41.3 106 37.5 111.5 34.5C104 43 105 42 98 54.5C92.302 64.6751 91.3333 80.6667 91.5 90C89.1667 91.5 83.8 95.1 81 97.5Z"/>
      <path d="M61 89C61 108.2 57.6667 121 56 125C43.2 105.8 26.6667 93 20 89C19.5 83 18 69.1 16 61.5C14 53.9 4.5 40.3333 0 34.5C4.5 36.5 15.4 42.2 23 49C30.6 55.8 35.8333 66.5 37.5 71C37.5 66.3333 37.2 54.4 36 44C34.8 33.6 25.8333 10.3333 21.5 0C25.3333 5.83333 33 15 39 25.5C43.1287 32.7252 61 65 61 89Z"/>
    </svg>
  ),

  /* ── ADC ── */
  ADC: (s) => (
    <svg viewBox="0 0 114 112" width={s} height={s}>
      <path fill="currentColor" fillOpacity="0.15" d="M42 41H72V71H42V41Z"/>
      <path fill="currentColor" fillOpacity="0.15" d="M78.4888 21H22V77.4888L0 99.4888V0H99.4888L78.4888 21Z"/>
      <path fill="currentColor" fillOpacity="0.15" d="M12.9448 112H114V10.9448L92 32.9448V91H33.9448L12.9448 112Z"/>
      <path fill="currentColor" d="M12.9448 112H114V10.9448L92 32.9448V91H33.9448L12.9448 112Z"/>
    </svg>
  ),

  /* ── SUPPORT ── */
  SUPPORT: (s) => (
    <svg viewBox="0 0 136 114" width={s} height={s} fill="currentColor">
      <path d="M63 39.5L67.5 45.5L72.5 39.5L84.5 100.5L67.5 114L51.5 100.5L63 39.5Z"/>
      <path d="M87.5 65L78.5 36L92 22.5L136 24C134 26.1667 128.9 30.7 124.5 33.5C120.1 36.3 114 39.5 108.5 40H97L108.5 56.5L87.5 65Z"/>
      <path d="M67.5 32.5L47 9L51.5 0H84.5L88.5 9L67.5 32.5Z"/>
      <path d="M56 36L44 24H0C1.66667 25.3333 3 29.5 13 34.5C20.7398 38.3699 27.1667 40.1667 28.5 40H38.5L27 56.5L48.5 65L56 36Z"/>
    </svg>
  ),

  /* ── MID ── */
  MID: (s) => (
    <svg viewBox="0 0 114 112" width={s} height={s}>
      <path fill="currentColor" fillOpacity="0.15" d="M0 0H84.7495L63.7495 21H22V62.7495L0 84.7495V0Z"/>
      <path fill="currentColor" fillOpacity="0.15" d="M29.312 112H114V27.3118L92 49.3118V91H50.312L29.312 112Z"/>
      <path fill="currentColor" fillRule="evenodd" clipRule="evenodd" d="M114 18.2323L20.2323 112H0V93.8289L93.8289 0H114V18.2323Z"/>
    </svg>
  ),

  /* ── TOP ── */
  TOP: (s) => (
    <svg viewBox="0 0 114 112" width={s} height={s}>
      <path fill="currentColor" fillOpacity="0.15" d="M72 71L42 71L42 41L72 41L72 71Z"/>
      <path fill="currentColor" fillOpacity="0.15" d="M35.5112 91L92 91L92 34.5112L114 12.5112L114 112L14.5112 112L35.5112 91Z"/>
      <path fill="currentColor" fillOpacity="0.15" d="M101.055 0L0 0L0 101.055L22 79.0552L22 21L80.0552 21L101.055 0Z"/>
      <path fill="currentColor" d="M101.055 0L0 0L0 101.055L22 79.0552L22 21L80.0552 21L101.055 0Z"/>
    </svg>
  ),
};

/* Alias */
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
