import React, { useState } from 'react';

/* Colores por tier para fallback */
export const RANK_COLORS = {
  IRON:         '#7f8c8d',
  BRONZE:       '#cd7f32',
  SILVER:       '#bdc3c7',
  GOLD:         '#f1c40f',
  PLATINUM:     '#00bcd4',
  EMERALD:      '#2ecc71',
  DIAMOND:      '#7ec8e3',
  MASTER:       '#9b59b6',
  GRANDMASTER:  '#e74c3c',
  CHALLENGER:   '#f39c12',
  UNRANKED:     '#64748b',
};

/* Emblemas oficiales desde Community Dragon CDN */
const cdnUrl = tier =>
  `https://raw.communitydragon.org/latest/plugins/rcp-fe-lol-static-assets/global/default/images/ranked-emblem/emblem-${tier.toLowerCase()}.png`;

/**
 * RankIcon — muestra el emblema oficial del tier de LoL.
 * Si la imagen falla, muestra un badge con la primera letra del tier.
 *
 * @param {string}  tier    "IRON" | "BRONZE" | ... | "CHALLENGER" | "UNRANKED"
 * @param {number}  size    tamaño en px (default 36)
 * @param {string}  division  "I" | "II" | "III" | "IV" (opcional, mostrado debajo)
 * @param {boolean} showLabel  mostrar nombre del tier debajo (default false)
 */
export default function RankIcon({ tier = 'UNRANKED', size = 36, division, showLabel = false }) {
  const [imgFailed, setImgFailed] = useState(false);
  const normalized = (tier || 'UNRANKED').toUpperCase();
  const color      = RANK_COLORS[normalized] || RANK_COLORS.UNRANKED;
  const src        = normalized !== 'UNRANKED' && !imgFailed ? cdnUrl(normalized) : null;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2, flexShrink: 0 }}>
      {src ? (
        <img
          src={src}
          alt={normalized}
          width={size}
          height={size}
          style={{ objectFit: 'contain', display: 'block' }}
          onError={() => setImgFailed(true)}
        />
      ) : (
        /* Fallback badge */
        <div style={{
          width: size, height: size, borderRadius: '50%',
          background: color + '22',
          border: `2px solid ${color}`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          flexShrink: 0,
        }}>
          <span style={{ fontSize: size * 0.38, fontWeight: 900, color, lineHeight: 1 }}>
            {normalized === 'UNRANKED' ? '?' : normalized[0]}
          </span>
        </div>
      )}

      {/* División y/o etiqueta opcionales */}
      {(division || showLabel) && (
        <span style={{ fontSize: Math.max(9, size * 0.28), fontWeight: 700, color, lineHeight: 1, whiteSpace: 'nowrap' }}>
          {showLabel ? normalized : ''}{division ? ` ${division}` : ''}
        </span>
      )}
    </div>
  );
}
