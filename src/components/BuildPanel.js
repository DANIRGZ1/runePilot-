import React, { useState } from 'react';
import { getBuild } from '../data/builds';

const RUNE_COLORS = {
  Precision: '#c89b3c',
  Domination: '#c9453a',
  Sorcery: '#4a9eff',
  Resolve: '#52b788',
  Inspiration: '#5bc0de',
};

const TIER_COLORS = {
  S: '#ff4444',
  A: '#ff8c00',
  B: '#4a9eff',
  C: '#64748b',
};

function RunePage({ runes }) {
  const color = RUNE_COLORS[runes.primary] || '#c89b3c';
  return (
    <div className="build-runes">
      <div className="build-rune-header" style={{ color }}>
        <span className="rune-tree">{runes.primary}</span>
        <span className="rune-keystone">{runes.keystone}</span>
      </div>
      <div className="rune-list">
        {runes.page.map((r, i) => (
          <span
            key={i}
            className={`rune-pill ${i < 4 ? 'primary-rune' : 'secondary-rune'}`}
            style={i < 4 ? { borderColor: color + '66', color } : {}}
          >
            {r}
          </span>
        ))}
      </div>
      <div className="rune-secondary-tree">
        <span style={{ color: RUNE_COLORS[runes.secondary] || '#64748b' }}>
          {runes.secondary}
        </span>
      </div>
    </div>
  );
}

function ItemRow({ label, items }) {
  if (!items || items.length === 0) return null;
  return (
    <div className="build-item-row">
      <span className="build-item-label">{label}</span>
      <div className="build-item-list">
        {items.map((item, i) => (
          <span key={i} className="item-pill">{item}</span>
        ))}
      </div>
    </div>
  );
}

export default function BuildPanel({ champion, onClose }) {
  const [tab, setTab] = useState('build');

  if (!champion) return null;
  const build = getBuild(champion.id);

  if (!build) {
    return (
      <div className="build-panel">
        <div className="build-panel-header">
          <span className="build-champ-name">{champion.name}</span>
          <button className="build-close-btn" onClick={onClose}>✕</button>
        </div>
        <p className="build-no-data">No build data yet for this champion.</p>
      </div>
    );
  }

  const tierColor = TIER_COLORS[build.tier] || '#c89b3c';

  return (
    <div className="build-panel">
      <div className="build-panel-header">
        <div className="build-champ-info">
          <span className="build-champ-icon">{champion.icon}</span>
          <div>
            <span className="build-champ-name">{champion.name}</span>
            <div className="build-meta">
              <span className="build-tier" style={{ color: tierColor, borderColor: tierColor + '55' }}>
                Tier {build.tier}
              </span>
              <span className="build-patch">Patch {build.patch}</span>
              <span className="build-source">{build.source}</span>
            </div>
          </div>
        </div>
        <button className="build-close-btn" onClick={onClose}>✕</button>
      </div>

      <div className="build-tabs">
        {['build', 'runes', 'tips'].map((t) => (
          <button
            key={t}
            className={`build-tab ${tab === t ? 'active' : ''}`}
            onClick={() => setTab(t)}
          >
            {t === 'build' ? '🛡️ Items' : t === 'runes' ? '🔮 Runes' : '💡 Tips'}
          </button>
        ))}
      </div>

      {tab === 'build' && (
        <div className="build-items-section">
          <div className="build-spells">
            <span className="build-item-label">Summoner Spells</span>
            <div className="build-item-list">
              {build.summonerSpells.map((s, i) => (
                <span key={i} className="spell-pill">{s}</span>
              ))}
            </div>
          </div>
          <ItemRow label="Mythic" items={[build.items.mythic]} />
          <ItemRow label="Boots" items={[build.items.boots]} />
          <ItemRow label="Core" items={build.items.core} />
          <ItemRow label="Situational" items={build.items.situational} />
          <div className="build-skill-order">
            <span className="build-item-label">Skill Order</span>
            <div className="skill-order-display">
              <span className="skill-order-text">{build.skillOrder.order}</span>
              <div className="skill-maxes">
                <span className="skill-pill skill-1">Max 1st: {build.skillOrder.maxFirst}</span>
                <span className="skill-pill skill-2">Max 2nd: {build.skillOrder.maxSecond}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {tab === 'runes' && <RunePage runes={build.runes} />}

      {tab === 'tips' && (
        <div className="build-tips">
          {build.tips.map((tip, i) => (
            <div key={i} className="build-tip">
              <span className="tip-num">{i + 1}</span>
              <span className="tip-text">{tip}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
