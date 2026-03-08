import React from 'react';
import { motion } from 'framer-motion';

/**
 * RunePilotLogo — Ouroboros + Vegvisir rune compass
 * Transparent background, dark strokes (respects CSS color)
 *
 * Props:
 *   size        number  — width/height in px (default 40)
 *   spin        bool    — continuous rotation (default false)
 *   color       string  — stroke color (default 'currentColor')
 *   spinOuter   bool    — spin only outer ring (default false)
 */
export default function RunePilotLogo({ size = 40, spin = false, color = 'currentColor', spinOuter = false }) {
  const outerVariants = spin || spinOuter
    ? { animate: { rotate: 360 }, transition: { duration: 18, repeat: Infinity, ease: 'linear' } }
    : {};

  const innerVariants = spin
    ? { animate: { rotate: -360 }, transition: { duration: 12, repeat: Infinity, ease: 'linear' } }
    : {};

  const cx = 100, cy = 100, r = 100;

  return (
    <svg
      viewBox="0 0 200 200"
      width={size}
      height={size}
      fill="none"
      style={{ display: 'block', flexShrink: 0 }}
    >
      {/* ── Outer Ouroboros ring ── */}
      <motion.g
        style={{ transformOrigin: '100px 100px' }}
        {...outerVariants}
      >
        {/* Main ring */}
        <circle cx="100" cy="100" r="90" stroke={color} strokeWidth="5" opacity="0.9" />
        <circle cx="100" cy="100" r="83" stroke={color} strokeWidth="1.5" opacity="0.35" />

        {/* Dragon head (top, eating tail) */}
        <path d="M92 12 Q100 6 108 12 Q118 16 116 26 Q110 22 100 21 Q90 22 84 26 Q82 16 92 12Z"
          fill={color} opacity="0.9" />
        {/* Eye */}
        <circle cx="100" cy="17" r="2" fill={color} opacity="1" />
        {/* Teeth */}
        <path d="M93 23 L96 19 L99 23 M101 23 L104 19 L107 23" stroke={color} strokeWidth="1" />

        {/* Dragon body scales — dots around ring */}
        {Array.from({ length: 32 }, (_, i) => {
          const angle = (i / 32) * Math.PI * 2 - Math.PI / 2;
          const rr = 90;
          const x = 100 + rr * Math.cos(angle);
          const y = 100 + rr * Math.sin(angle);
          return <circle key={i} cx={x} cy={y} r={i % 4 === 0 ? 2.5 : 1.2} fill={color} opacity={i % 4 === 0 ? 0.7 : 0.35} />;
        })}

        {/* Rune text ring (24 rune-like marks) */}
        {Array.from({ length: 24 }, (_, i) => {
          const angle = (i / 24) * Math.PI * 2 - Math.PI / 2;
          const rr = 74;
          const x = 100 + rr * Math.cos(angle);
          const y = 100 + rr * Math.sin(angle);
          const rot = (i / 24) * 360;
          // Alternating rune-like strokes
          const runeType = i % 6;
          return (
            <g key={i} transform={`translate(${x},${y}) rotate(${rot})`}>
              {runeType === 0 && <path d="M-3,-4 L3,-4 M0,-4 L0,4" stroke={color} strokeWidth="1.2" opacity="0.8" />}
              {runeType === 1 && <path d="M-3,4 L0,-4 L3,4" stroke={color} strokeWidth="1.2" opacity="0.8" />}
              {runeType === 2 && <path d="M0,-4 L0,4 M-3,-1 L0,-4 M-3,1 L0,4" stroke={color} strokeWidth="1.2" opacity="0.8" />}
              {runeType === 3 && <path d="M0,-4 L0,4 M-3,0 L3,0" stroke={color} strokeWidth="1.2" opacity="0.8" />}
              {runeType === 4 && <path d="M-3,-4 L0,0 L3,-4 M0,0 L0,4" stroke={color} strokeWidth="1.2" opacity="0.8" />}
              {runeType === 5 && <path d="M-3,-4 L3,4 M3,-4 L-3,4" stroke={color} strokeWidth="1.2" opacity="0.8" />}
            </g>
          );
        })}
      </motion.g>

      {/* ── Inner Vegvisir (compass stave) ── */}
      <motion.g
        style={{ transformOrigin: '100px 100px' }}
        {...innerVariants}
      >
        {/* Inner circle */}
        <circle cx="100" cy="100" r="52" stroke={color} strokeWidth="1.5" opacity="0.4" />
        <circle cx="100" cy="100" r="40" stroke={color} strokeWidth="1" opacity="0.3" />

        {/* 8 compass arms */}
        {Array.from({ length: 8 }, (_, i) => {
          const angle = (i / 8) * Math.PI * 2 - Math.PI / 2;
          const x1 = 100 + 10 * Math.cos(angle);
          const y1 = 100 + 10 * Math.sin(angle);
          const x2 = 100 + 48 * Math.cos(angle);
          const y2 = 100 + 48 * Math.sin(angle);
          // Rune tips
          const xt = 100 + 56 * Math.cos(angle);
          const yt = 100 + 56 * Math.sin(angle);
          const perpX = Math.cos(angle + Math.PI / 2);
          const perpY = Math.sin(angle + Math.PI / 2);
          const isDiag = i % 2 === 1;
          return (
            <g key={i}>
              <line x1={x1} y1={y1} x2={x2} y2={y2} stroke={color} strokeWidth={isDiag ? 1.5 : 2} opacity="0.85" />
              {/* Rune tip decoration */}
              {isDiag ? (
                <path
                  d={`M${x2},${y2} L${x2 + perpX * 5},${y2 + perpY * 5} M${x2},${y2} L${x2 - perpX * 5},${y2 - perpY * 5}`}
                  stroke={color} strokeWidth="1.5" opacity="0.8"
                />
              ) : (
                <g>
                  <path
                    d={`M${x2},${y2} L${x2 + perpX * 4},${y2 + perpY * 4} L${xt},${yt} L${x2 - perpX * 4},${y2 - perpY * 4} Z`}
                    fill={color} opacity="0.7"
                  />
                </g>
              )}
              {/* Cross bar on cardinal arms */}
              {!isDiag && (
                <line
                  x1={100 + 30 * Math.cos(angle) - perpX * 6}
                  y1={100 + 30 * Math.sin(angle) - perpY * 6}
                  x2={100 + 30 * Math.cos(angle) + perpX * 6}
                  y2={100 + 30 * Math.sin(angle) + perpY * 6}
                  stroke={color} strokeWidth="1.5" opacity="0.6"
                />
              )}
            </g>
          );
        })}

        {/* Center circle */}
        <circle cx="100" cy="100" r="8" stroke={color} strokeWidth="2" opacity="0.9" />
        <circle cx="100" cy="100" r="3" fill={color} opacity="0.9" />
      </motion.g>
    </svg>
  );
}
