import React, { useState, useMemo, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { getChampionImageUrl, getChampionSplashUrl, getItemImageUrl, loadItemsData } from '../services/datadragon';
import { RoleIcon } from './RoleIcons';
import { getBuild } from '../data/builds';

/* ─── Shared primitives ─────────────────────────────────────────────────── */

function ChampAvatar({ champion, ddVersion, size = 40, round = false, splash = false }) {
  const [failed, setFailed] = useState(false);
  const src = champion?.ddKey && ddVersion && !failed
    ? (splash ? getChampionSplashUrl(champion.ddKey) : getChampionImageUrl(champion.ddKey, ddVersion))
    : null;
  const style = {
    width: size, height: size, flexShrink: 0, objectFit: 'cover', objectPosition: splash ? 'top center' : 'top',
    borderRadius: round ? '50%' : 6, display: 'block',
  };
  if (src) return <img src={src} alt={champion.name} style={style} onError={() => setFailed(true)} />;
  return (
    <div style={{ ...style, background: 'var(--rp-border)', display: 'flex', alignItems: 'center',
      justifyContent: 'center', fontSize: size * 0.4, color: 'var(--rp-text-muted)' }}>
      {champion?.icon || '⚔️'}
    </div>
  );
}

function getTier(wr) {
  if (!wr) return 'C';
  if (wr >= 54) return 'S';
  if (wr >= 52) return 'A';
  if (wr >= 50) return 'B';
  return 'C';
}

const TIER_COLOR = { S: '#c89b3c', A: '#52b788', B: '#5b8dee', C: '#9ca3af' };
const ROLE_LABEL = { TOP: 'Top', JUNGLE: 'Jungla', MID: 'Mid', ADC: 'ADC', SUPPORT: 'Sup' };
const ROLES = ['TOP', 'JUNGLE', 'MID', 'ADC', 'SUPPORT'];

function TierBadge({ tier }) {
  const color = TIER_COLOR[tier] || '#9ca3af';
  return (
    <span style={{
      fontSize: 11, fontWeight: 800, padding: '1px 6px', borderRadius: 4,
      background: color + '22', border: `1px solid ${color}55`, color, letterSpacing: '0.3px',
    }}>{tier}</span>
  );
}

function WrBadge({ wr }) {
  if (!wr) return null;
  const color = wr >= 53 ? '#52b788' : wr >= 50 ? '#c89b3c' : '#e84057';
  return <span style={{ fontSize: 12, fontWeight: 700, color }}>{wr.toFixed(1)}%</span>;
}

function PageHeader({ title, subtitle }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
      style={{ marginBottom: 20 }}
    >
      <h1 style={{ fontSize: 22, fontWeight: 800, color: 'var(--rp-text)', margin: 0, letterSpacing: '-0.3px' }}>{title}</h1>
      {subtitle && <p style={{ fontSize: 13, color: 'var(--rp-text-muted)', margin: '4px 0 0' }}>{subtitle}</p>}
    </motion.div>
  );
}

function SearchInput({ value, onChange, placeholder = 'Buscar campeón...' }) {
  return (
    <div style={{ position: 'relative' }}>
      <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="var(--rp-text-muted)" strokeWidth="2"
        style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }}>
        <circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/>
      </svg>
      <input
        value={value} onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        style={{
          width: '100%', padding: '8px 10px 8px 30px',
          background: 'var(--rp-surface)', border: '1px solid var(--rp-border)',
          borderRadius: 8, color: 'var(--rp-text)', fontSize: 13, outline: 'none', fontFamily: 'inherit',
          transition: 'border-color 0.15s',
        }}
        onFocus={e => e.target.style.borderColor = 'var(--rp-gold)'}
        onBlur={e => e.target.style.borderColor = 'var(--rp-border)'}
      />
    </div>
  );
}

/* ════════════════════════════════════════════════════════
   1. CHAMPIONS VIEW
════════════════════════════════════════════════════════ */
export function ChampionsView({ champions = [], ddVersion, playerData }) {
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('ALL');
  const [sort, setSort] = useState('wr');

  const filtered = useMemo(() => {
    let list = champions;
    if (roleFilter !== 'ALL') list = list.filter(c => c.role === roleFilter);
    if (search.trim()) list = list.filter(c => c.name.toLowerCase().includes(search.toLowerCase()));
    if (sort === 'wr') list = [...list].sort((a, b) => (b.winRate || 0) - (a.winRate || 0));
    else if (sort === 'tier') list = [...list].sort((a, b) => {
      const order = { S: 0, A: 1, B: 2, C: 3 };
      return order[getTier(a.winRate)] - order[getTier(b.winRate)];
    });
    else list = [...list].sort((a, b) => a.name.localeCompare(b.name));
    return list;
  }, [champions, roleFilter, search, sort]);

  const roleFilters = [['ALL', 'Todos'], ['TOP', 'Top'], ['JUNGLE', 'Jungla'], ['MID', 'Mid'], ['ADC', 'ADC'], ['SUPPORT', 'Soporte']];

  return (
    <div style={{ padding: '0 0 24px' }}>
      <PageHeader title="Campeones" subtitle={`${filtered.length} campeones — Parche ${ddVersion?.split('.').slice(0,2).join('.') || '15.x'}`} />

      {/* Controls */}
      <div style={{ display: 'flex', gap: 10, marginBottom: 16, flexWrap: 'wrap', alignItems: 'center' }}>
        <div style={{ flex: '0 0 220px' }}>
          <SearchInput value={search} onChange={setSearch} />
        </div>
        <div style={{ display: 'flex', gap: 4, flex: 1, flexWrap: 'wrap' }}>
          {roleFilters.map(([val, lbl]) => (
            <button key={val} onClick={() => setRoleFilter(val)}
              style={{
                padding: '6px 12px', borderRadius: 20, fontSize: 12, fontWeight: 600, cursor: 'pointer',
                fontFamily: 'inherit', border: '1px solid',
                borderColor: roleFilter === val ? 'var(--rp-gold)' : 'var(--rp-border)',
                background: roleFilter === val ? 'var(--rp-gold-dim)' : 'var(--rp-surface)',
                color: roleFilter === val ? 'var(--rp-gold)' : 'var(--rp-text-muted)',
                transition: 'all 0.15s',
              }}>
              {lbl}
            </button>
          ))}
        </div>
        <select value={sort} onChange={e => setSort(e.target.value)}
          style={{
            padding: '6px 10px', borderRadius: 8, fontSize: 12, fontFamily: 'inherit',
            background: 'var(--rp-surface)', border: '1px solid var(--rp-border)',
            color: 'var(--rp-text-muted)', cursor: 'pointer', outline: 'none',
          }}>
          <option value="wr">Win Rate</option>
          <option value="tier">Tier</option>
          <option value="name">Nombre</option>
        </select>
      </div>

      {/* Grid */}
      {filtered.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--rp-text-muted)' }}>
          Sin resultados para "{search}"
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: 10 }}>
          {filtered.map((champ, i) => {
            const tier = getTier(champ.winRate);
            const tierColor = TIER_COLOR[tier];
            return (
              <motion.div
                key={champ.id}
                initial={{ opacity: 0, y: 16, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ delay: Math.min(i, 30) * 0.025, duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                whileHover={{ y: -3, scale: 1.02 }}
                style={{
                  background: 'var(--rp-card)', border: `1px solid var(--rp-border)`,
                  borderRadius: 10, overflow: 'hidden', cursor: 'default',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                  transition: 'box-shadow 0.2s',
                }}
              >
                {/* Splash */}
                <div style={{ height: 90, overflow: 'hidden', position: 'relative', background: 'var(--rp-surface)' }}>
                  <SplashImg champ={champ} ddVersion={ddVersion} />
                  <div style={{
                    position: 'absolute', inset: 0,
                    background: 'linear-gradient(to top, rgba(0,0,0,0.7) 0%, rgba(0,0,0,0.1) 50%, transparent 100%)',
                  }} />
                  <div style={{ position: 'absolute', top: 6, right: 6 }}>
                    <TierBadge tier={tier} />
                  </div>
                  <div style={{ position: 'absolute', top: 6, left: 6, background: 'rgba(0,0,0,0.6)', borderRadius: 4, padding: '2px 4px' }}>
                    <RoleIcon role={champ.role} size={12} />
                  </div>
                </div>
                {/* Body */}
                <div style={{ padding: '8px 10px 10px' }}>
                  <div style={{ fontWeight: 700, fontSize: 13, color: 'var(--rp-text)', marginBottom: 4,
                    overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {champ.name}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <span style={{ fontSize: 11, color: 'var(--rp-text-muted)' }}>{ROLE_LABEL[champ.role]}</span>
                    <WrBadge wr={champ.winRate} />
                  </div>
                  <div style={{ marginTop: 6, display: 'flex', gap: 4 }}>
                    <span style={{
                      fontSize: 10, fontWeight: 700, padding: '1px 5px', borderRadius: 3,
                      background: champ.damage === 'AP' ? 'rgba(139,92,246,0.15)' : 'rgba(249,115,22,0.15)',
                      color: champ.damage === 'AP' ? '#8b5cf6' : '#f97316',
                    }}>{champ.damage}</span>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function SplashImg({ champ, ddVersion }) {
  const [failed, setFailed] = useState(false);
  if (!champ?.ddKey || failed) return null;
  return (
    <img src={getChampionSplashUrl(champ.ddKey)} alt=""
      style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'top center' }}
      onError={() => setFailed(true)} />
  );
}


/* ════════════════════════════════════════════════════════
   2. COUNTERS VIEW
════════════════════════════════════════════════════════ */
export function CountersView({ champions = [], ddVersion, playerData }) {
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState(null);

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return champions.filter(c => c.name.toLowerCase().includes(q)).slice(0, 60);
  }, [champions, search]);

  const build = selected ? getBuild(selected.id) : null;

  const countersVs = useMemo(() => {
    if (!selected) return [];
    return champions
      .filter(c => c.role === selected.role && c.id !== selected.id && c.winRate)
      .sort((a, b) => b.winRate - a.winRate)
      .slice(0, 3);
  }, [selected, champions]);

  const beatenBy = useMemo(() => {
    if (!selected) return [];
    return champions
      .filter(c => c.role === selected.role && c.id !== selected.id && c.winRate)
      .sort((a, b) => a.winRate - b.winRate)
      .slice(0, 3);
  }, [selected, champions]);

  const genericTips = selected ? [
    selected.damage === 'AD'
      ? `Considera objetos de armadura como Thornmail o Randuins contra ${selected.name}.`
      : `La resistencia mágica es clave. Fuerza de la Naturaleza o Manto de la Muerte Negra son esenciales.`,
    `Controla el visiónamiento alrededor del carril de ${selected.name} para evitar flancos y roams.`,
    `${selected.difficulty >= 3 ? `${selected.name} es difícil de manejar — pide ganks cuando el campeón enemigo haya usado sus habilidades clave.` : `Aprovecha los CD largos de ${selected.name} para presionar la ventaja.`}`,
  ] : [];

  const tips = build?.tips || genericTips;

  return (
    <div style={{ display: 'flex', height: 'calc(100vh - 130px)', overflow: 'hidden', gap: 0 }}>
      {/* Left: champion list */}
      <div style={{
        width: 220, flexShrink: 0, borderRight: '1px solid var(--rp-border)',
        display: 'flex', flexDirection: 'column', gap: 0,
      }}>
        <div style={{ padding: '0 12px 10px', borderBottom: '1px solid var(--rp-border)', paddingTop: 2 }}>
          <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.8px',
            color: 'var(--rp-text-muted)', marginBottom: 8 }}>Seleccionar campeón</div>
          <SearchInput value={search} onChange={setSearch} placeholder="Buscar..." />
        </div>
        <div style={{ flex: 1, overflowY: 'auto', padding: '4px 6px' }}>
          {filtered.map((champ, i) => (
            <motion.button
              key={champ.id}
              onClick={() => setSelected(champ)}
              initial={{ opacity: 0, x: -6 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.012 }}
              whileTap={{ scale: 0.97 }}
              style={{
                width: '100%', display: 'flex', alignItems: 'center', gap: 8, padding: '6px 8px',
                background: selected?.id === champ.id ? 'var(--rp-gold-dim)' : 'transparent',
                border: selected?.id === champ.id ? '1px solid var(--rp-gold)' : '1px solid transparent',
                borderRadius: 7, cursor: 'pointer', fontFamily: 'inherit', marginBottom: 1, textAlign: 'left',
                transition: 'all 0.12s',
              }}
              onMouseEnter={e => { if (selected?.id !== champ.id) e.currentTarget.style.background = 'var(--rp-hover)'; }}
              onMouseLeave={e => { if (selected?.id !== champ.id) e.currentTarget.style.background = 'transparent'; }}
            >
              <ChampAvatar champion={champ} ddVersion={ddVersion} size={32} round />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 12, fontWeight: 600, color: selected?.id === champ.id ? 'var(--rp-gold)' : 'var(--rp-text)',
                  overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{champ.name}</div>
                <div style={{ fontSize: 10, color: 'var(--rp-text-muted)' }}>{ROLE_LABEL[champ.role]}</div>
              </div>
              <WrBadge wr={champ.winRate} />
            </motion.button>
          ))}
        </div>
      </div>

      {/* Right: counter analysis */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '0 0 24px 20px' }}>
        <AnimatePresence mode="wait">
          {!selected ? (
            <motion.div
              key="empty"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                height: '100%', gap: 16, color: 'var(--rp-text-muted)' }}
            >
              <svg viewBox="0 0 80 80" width="64" height="64" fill="none">
                <circle cx="40" cy="40" r="34" stroke="var(--rp-border)" strokeWidth="2"/>
                <circle cx="40" cy="40" r="18" stroke="var(--rp-border)" strokeWidth="1.5" opacity="0.5"/>
                <circle cx="40" cy="40" r="4" fill="var(--rp-border)"/>
                <line x1="40" y1="6" x2="40" y2="18" stroke="var(--rp-border)" strokeWidth="2" strokeLinecap="round"/>
                <line x1="40" y1="62" x2="40" y2="74" stroke="var(--rp-border)" strokeWidth="2" strokeLinecap="round"/>
                <line x1="6" y1="40" x2="18" y2="40" stroke="var(--rp-border)" strokeWidth="2" strokeLinecap="round"/>
                <line x1="62" y1="40" x2="74" y2="40" stroke="var(--rp-border)" strokeWidth="2" strokeLinecap="round"/>
              </svg>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--rp-text)', marginBottom: 4 }}>Selecciona un campeón</div>
                <div style={{ fontSize: 13 }}>Analiza counters y estrategias de matchup</div>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key={selected.id}
              initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
            >
              {/* Header */}
              <div style={{ position: 'relative', height: 120, borderRadius: 12, overflow: 'hidden', marginBottom: 20,
                background: 'var(--rp-surface)', border: '1px solid var(--rp-border)' }}>
                <SplashImg champ={selected} ddVersion={ddVersion} />
                <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(90deg, rgba(0,0,0,0.85) 30%, rgba(0,0,0,0.2) 100%)' }} />
                <div style={{ position: 'absolute', inset: 0, padding: '16px 20px', display: 'flex', alignItems: 'center', gap: 14 }}>
                  <ChampAvatar champion={selected} ddVersion={ddVersion} size={70} round />
                  <div>
                    <div style={{ fontSize: 26, fontWeight: 900, color: '#fff', letterSpacing: '-0.5px' }}>{selected.name}</div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 4 }}>
                      <RoleIcon role={selected.role} size={14} />
                      <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.7)' }}>{ROLE_LABEL[selected.role]}</span>
                      <TierBadge tier={getTier(selected.winRate)} />
                      <WrBadge wr={selected.winRate} />
                    </div>
                  </div>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
                {/* Counter vs */}
                <div style={{ background: 'var(--rp-card)', border: '1px solid rgba(82,183,136,0.3)', borderRadius: 10, padding: '14px 16px' }}>
                  <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.8px',
                    color: '#52b788', marginBottom: 12 }}>⬆ Fuerte contra</div>
                  {countersVs.map((c, i) => (
                    <motion.div key={c.id} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.08 }}
                      style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                      <ChampAvatar champion={c} ddVersion={ddVersion} size={36} round />
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--rp-text)' }}>{c.name}</div>
                        <div style={{ fontSize: 10, color: 'var(--rp-text-muted)' }}>{ROLE_LABEL[c.role]}</div>
                      </div>
                      <WrBadge wr={c.winRate} />
                    </motion.div>
                  ))}
                </div>

                {/* Beaten by */}
                <div style={{ background: 'var(--rp-card)', border: '1px solid rgba(232,64,87,0.3)', borderRadius: 10, padding: '14px 16px' }}>
                  <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.8px',
                    color: '#e84057', marginBottom: 12 }}>⬇ Débil contra</div>
                  {beatenBy.map((c, i) => (
                    <motion.div key={c.id} initial={{ opacity: 0, x: 8 }} animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.08 }}
                      style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                      <ChampAvatar champion={c} ddVersion={ddVersion} size={36} round />
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--rp-text)' }}>{c.name}</div>
                        <div style={{ fontSize: 10, color: 'var(--rp-text-muted)' }}>{ROLE_LABEL[c.role]}</div>
                      </div>
                      <WrBadge wr={c.winRate} />
                    </motion.div>
                  ))}
                </div>
              </div>

              {/* Tips */}
              {tips.length > 0 && (
                <div style={{ background: 'var(--rp-card)', border: '1px solid var(--rp-border)', borderRadius: 10, padding: '14px 16px' }}>
                  <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.8px',
                    color: 'var(--rp-text-muted)', marginBottom: 12 }}>💡 Tips del matchup</div>
                  {tips.map((tip, i) => (
                    <motion.div key={i} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.06 }}
                      style={{ display: 'flex', gap: 10, marginBottom: 8, alignItems: 'flex-start' }}>
                      <span style={{ color: 'var(--rp-gold)', fontSize: 14, flexShrink: 0, marginTop: 1 }}>•</span>
                      <span style={{ fontSize: 13, color: 'var(--rp-text-muted)', lineHeight: 1.6 }}>{tip}</span>
                    </motion.div>
                  ))}
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}


/* ════════════════════════════════════════════════════════
   3. RUNAS VIEW
════════════════════════════════════════════════════════ */

const RUNE_PATHS = {
  Precision: {
    color: '#c89b3c', icon: '⚔️',
    desc: 'Mejora tus ataques y habilidades para conquistar el largo plazo.',
    keystones: ['Conqueror', 'Lethal Tempo', 'Fleet Footwork', 'Press the Attack'],
    runes: [
      ['Presence of Mind', 'Triumph', 'Overheal'],
      ['Legend: Alacrity', 'Legend: Tenacity', 'Legend: Bloodline'],
      ['Last Stand', 'Cut Down', 'Coup de Grace'],
    ],
  },
  Domination: {
    color: '#e84057', icon: '🗡️',
    desc: 'Destruye el escudo y acumula daño verdadero sobre tus objetivos.',
    keystones: ['Electrocute', 'Dark Harvest', 'Predator', 'Hail of Blades'],
    runes: [
      ['Cheap Shot', 'Taste of Blood', 'Sudden Impact'],
      ['Zombie Ward', "Ghost Poro", 'Eyeball Collection'],
      ['Treasure Hunter', 'Relentless Hunter', 'Ultimate Hunter'],
    ],
  },
  Sorcery: {
    color: '#8b5cf6', icon: '✨',
    desc: 'Empodérate con hechizos aumentados y dominio arcano.',
    keystones: ['Arcane Comet', 'Phase Rush', 'Summon Aery'],
    runes: [
      ['Manaflow Band', 'Nimbus Cloak', 'Nullifying Orb'],
      ['Transcendence', 'Celerity', 'Absolute Focus'],
      ['Scorch', 'Waterwalking', 'Gathering Storm'],
    ],
  },
  Resolve: {
    color: '#52b788', icon: '🛡️',
    desc: 'Aguanta más y defiende a tus aliados con resistencia indomable.',
    keystones: ['Grasp of the Undying', 'Aftershock', 'Guardian', 'Demolish'],
    runes: [
      ['Font of Life', 'Shield Bash', 'Demolish'],
      ['Second Wind', 'Bone Plating', 'Conditioning'],
      ['Unflinching', 'Revitalize', 'Overgrowth'],
    ],
  },
  Inspiration: {
    color: '#22d3ee', icon: '🌀',
    desc: 'Rompe las reglas del juego con trucos creativos e items modificados.',
    keystones: ['Glacial Augment', 'First Strike', 'Unsealed Spellbook'],
    runes: [
      ["Hextech Flashtraption", "Magical Footwear", "Perfect Timing"],
      ['Future's Market', 'Minion Dematerializer', 'Biscuit Delivery'],
      ['Cosmic Insight', 'Approach Velocity', 'Time Warp Tonic'],
    ],
  },
};

const SUMMONER_SPELLS = [
  { name: 'Flash', desc: 'Teleporta al campeón hasta una distancia corta.', emoji: '⚡' },
  { name: 'Ignite', desc: 'Inflama al objetivo causando daño verídico.', emoji: '🔥' },
  { name: 'Teleport', desc: 'Teleporta a estructuras aliadas.', emoji: '🌀' },
  { name: 'Smite', desc: 'Inflige daño a monstruos y minions.', emoji: '🗡️' },
  { name: 'Exhaust', desc: 'Ralentiza y reduce el daño del objetivo.', emoji: '🌫️' },
  { name: 'Heal', desc: 'Restaura vida a ti y a un aliado.', emoji: '💚' },
  { name: 'Barrier', desc: 'Te otorga un escudo temporal.', emoji: '🛡️' },
  { name: 'Ghost', desc: 'Aumenta la velocidad de movimiento temporalmente.', emoji: '👻' },
  { name: 'Cleanse', desc: 'Elimina todos los efectos de control de masas.', emoji: '✨' },
];

export function RunasView({ champions = [], ddVersion, playerData }) {
  const [activePath, setActivePath] = useState('Precision');
  const path = RUNE_PATHS[activePath];

  return (
    <div style={{ padding: '0 0 24px' }}>
      <PageHeader title="Runas & Hechizos" subtitle="Referencia completa de árboles de runas y hechizos de invocador" />

      <div style={{ display: 'flex', gap: 16, height: 'calc(100vh - 200px)', overflow: 'hidden' }}>
        {/* Left: path selector */}
        <div style={{ width: 180, flexShrink: 0, display: 'flex', flexDirection: 'column', gap: 3 }}>
          <div style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px',
            color: 'var(--rp-text-sub)', marginBottom: 8 }}>Árbol de runas</div>
          {Object.entries(RUNE_PATHS).map(([name, data]) => (
            <motion.button key={name} onClick={() => setActivePath(name)}
              whileHover={{ x: 3 }} whileTap={{ scale: 0.97 }}
              style={{
                width: '100%', padding: '10px 12px', borderRadius: 8, cursor: 'pointer',
                fontFamily: 'inherit', textAlign: 'left', border: '1px solid',
                borderColor: activePath === name ? data.color : 'var(--rp-border)',
                background: activePath === name ? data.color + '18' : 'var(--rp-surface)',
                transition: 'all 0.15s',
              }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ fontSize: 16 }}>{data.icon}</span>
                <span style={{ fontSize: 13, fontWeight: activePath === name ? 700 : 500,
                  color: activePath === name ? data.color : 'var(--rp-text-muted)' }}>{name}</span>
              </div>
            </motion.button>
          ))}
        </div>

        {/* Center: rune tree */}
        <AnimatePresence mode="wait">
          <motion.div key={activePath}
            initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
            style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 16 }}
          >
            {/* Path header */}
            <div style={{
              background: 'var(--rp-card)', border: `1px solid ${path.color}44`,
              borderRadius: 12, padding: '14px 18px',
              borderLeft: `4px solid ${path.color}`,
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
                <span style={{ fontSize: 24 }}>{path.icon}</span>
                <div>
                  <div style={{ fontSize: 18, fontWeight: 800, color: path.color }}>{activePath}</div>
                  <div style={{ fontSize: 12, color: 'var(--rp-text-muted)', marginTop: 2 }}>{path.desc}</div>
                </div>
              </div>
            </div>

            {/* Keystones */}
            <div>
              <div style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.8px',
                color: 'var(--rp-text-muted)', marginBottom: 8 }}>Keystones</div>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                {path.keystones.map((k, i) => (
                  <motion.div key={k}
                    initial={{ opacity: 0, scale: 0.85 }} animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: i * 0.06 }}
                    style={{
                      padding: '8px 14px', borderRadius: 8,
                      background: path.color + '18', border: `1px solid ${path.color}55`,
                      fontSize: 13, fontWeight: 700, color: path.color,
                    }}>{k}</motion.div>
                ))}
              </div>
            </div>

            {/* Rune rows */}
            {path.runes.map((row, ri) => (
              <div key={ri}>
                <div style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.8px',
                  color: 'var(--rp-text-muted)', marginBottom: 8 }}>Fila {ri + 1}</div>
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                  {row.map((rune, i) => (
                    <motion.div key={rune}
                      initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: ri * 0.05 + i * 0.04 }}
                      style={{
                        padding: '6px 12px', borderRadius: 6,
                        background: 'var(--rp-surface)', border: '1px solid var(--rp-border)',
                        fontSize: 12, fontWeight: 500, color: 'var(--rp-text)',
                        transition: 'all 0.15s', cursor: 'default',
                      }}>{rune}</motion.div>
                  ))}
                </div>
              </div>
            ))}
          </motion.div>
        </AnimatePresence>

        {/* Right: summoner spells */}
        <div style={{ width: 220, flexShrink: 0, overflowY: 'auto' }}>
          <div style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px',
            color: 'var(--rp-text-sub)', marginBottom: 10 }}>Hechizos de invocador</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {SUMMONER_SPELLS.map((s, i) => (
              <motion.div key={s.name}
                initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.05 }}
                style={{
                  display: 'flex', alignItems: 'center', gap: 10, padding: '8px 10px',
                  background: 'var(--rp-card)', border: '1px solid var(--rp-border)',
                  borderRadius: 8, cursor: 'default',
                }}>
                <div style={{ width: 36, height: 36, borderRadius: 8, background: 'var(--rp-surface)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, flexShrink: 0 }}>
                  {s.emoji}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--rp-text)' }}>{s.name}</div>
                  <div style={{ fontSize: 10, color: 'var(--rp-text-muted)', lineHeight: 1.4 }}>{s.desc}</div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}


/* ════════════════════════════════════════════════════════
   4. WINRATES VIEW
════════════════════════════════════════════════════════ */
export function WinratesView({ champions = [], ddVersion, playerData }) {
  const [roleFilter, setRoleFilter] = useState('ALL');

  const filtered = useMemo(() => {
    let list = roleFilter === 'ALL' ? champions : champions.filter(c => c.role === roleFilter);
    return list.filter(c => c.winRate).sort((a, b) => b.winRate - a.winRate);
  }, [champions, roleFilter]);

  const byTier = useMemo(() => {
    const groups = { S: [], A: [], B: [], C: [] };
    for (const c of filtered) {
      const t = getTier(c.winRate);
      groups[t].push(c);
    }
    return groups;
  }, [filtered]);

  const topWr = filtered[0];
  const topPick = [...filtered].sort((a, b) => (b.pickRate || 0) - (a.pickRate || 0))[0];
  const topBan = [...filtered].sort((a, b) => (b.banRate || 0) - (a.banRate || 0))[0];

  const TIER_BG = {
    S: 'linear-gradient(90deg, rgba(200,155,60,0.12) 0%, transparent 100%)',
    A: 'linear-gradient(90deg, rgba(82,183,136,0.08) 0%, transparent 100%)',
    B: 'linear-gradient(90deg, rgba(91,141,238,0.08) 0%, transparent 100%)',
    C: 'linear-gradient(90deg, rgba(156,163,175,0.06) 0%, transparent 100%)',
  };

  return (
    <div style={{ padding: '0 0 32px' }}>
      <PageHeader title="Winrates & Tier List" subtitle={`Clasificación actualizada — ${filtered.length} campeones`} />

      {/* Highlight cards */}
      {(topWr || topPick || topBan) && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12, marginBottom: 24 }}>
          {[
            { champ: topWr, label: 'Mayor Winrate', stat: topWr ? `${topWr.winRate?.toFixed(1)}%` : '—', color: '#52b788' },
            { champ: topPick, label: 'Más Elegido', stat: topPick?.name || '—', color: 'var(--rp-gold)' },
            { champ: topBan, label: 'Más Baneado', stat: topBan?.name || '—', color: '#e84057' },
          ].map(({ champ, label, stat, color }, i) => (
            <motion.div key={label}
              initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1, ease: [0.22, 1, 0.36, 1] }}
              style={{
                background: 'var(--rp-card)', border: `1px solid ${color}44`, borderRadius: 12,
                padding: '14px 16px', display: 'flex', alignItems: 'center', gap: 12,
                borderLeft: `4px solid ${color}`,
              }}>
              {champ && <ChampAvatar champion={champ} ddVersion={ddVersion} size={48} round />}
              <div>
                <div style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.8px', color: color, marginBottom: 4 }}>{label}</div>
                <div style={{ fontSize: 20, fontWeight: 800, color: 'var(--rp-text)' }}>{champ?.name || '—'}</div>
                <div style={{ fontSize: 13, color }}>{stat}</div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Role filter */}
      <div style={{ display: 'flex', gap: 6, marginBottom: 18 }}>
        {[['ALL', 'Todos'], ['TOP', 'Top'], ['JUNGLE', 'Jungla'], ['MID', 'Mid'], ['ADC', 'ADC'], ['SUPPORT', 'Soporte']].map(([val, lbl]) => (
          <button key={val} onClick={() => setRoleFilter(val)}
            style={{
              padding: '5px 12px', borderRadius: 20, fontSize: 12, fontWeight: 600, cursor: 'pointer',
              fontFamily: 'inherit', border: '1px solid',
              borderColor: roleFilter === val ? 'var(--rp-gold)' : 'var(--rp-border)',
              background: roleFilter === val ? 'var(--rp-gold-dim)' : 'var(--rp-surface)',
              color: roleFilter === val ? 'var(--rp-gold)' : 'var(--rp-text-muted)',
              transition: 'all 0.15s',
            }}>{lbl}</button>
        ))}
      </div>

      {/* Tier rows */}
      {['S', 'A', 'B', 'C'].map((tier, ti) => {
        const champs = byTier[tier];
        if (champs.length === 0) return null;
        const color = TIER_COLOR[tier];
        return (
          <motion.div key={tier}
            initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}
            transition={{ delay: ti * 0.12, ease: [0.22, 1, 0.36, 1] }}
            style={{ marginBottom: 10, background: TIER_BG[tier], borderRadius: 10,
              border: `1px solid ${color}33`, overflow: 'hidden' }}>
            <div style={{ display: 'flex', alignItems: 'stretch' }}>
              {/* Tier label */}
              <div style={{
                width: 46, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 22, fontWeight: 900, color, letterSpacing: '-1px',
                borderRight: `1px solid ${color}33`,
              }}>{tier}</div>
              {/* Champions */}
              <div style={{ flex: 1, display: 'flex', gap: 6, padding: '10px 12px', overflowX: 'auto', flexWrap: 'wrap' }}>
                {champs.map((c, ci) => (
                  <motion.div key={c.id}
                    initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: ti * 0.1 + ci * 0.02 }}
                    whileHover={{ y: -2, scale: 1.05 }}
                    style={{
                      display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4,
                      width: 62, flexShrink: 0, cursor: 'default',
                    }}>
                    <div style={{ position: 'relative' }}>
                      <ChampAvatar champion={c} ddVersion={ddVersion} size={48} round />
                      {ci === 0 && <div style={{ position: 'absolute', top: -4, right: -4, width: 16, height: 16,
                        borderRadius: '50%', background: color, display: 'flex', alignItems: 'center',
                        justifyContent: 'center', fontSize: 9, fontWeight: 800, color: '#000' }}>1</div>}
                    </div>
                    <div style={{ fontSize: 10, fontWeight: 600, color: 'var(--rp-text)', textAlign: 'center',
                      overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', width: '100%' }}>
                      {c.name}
                    </div>
                    <WrBadge wr={c.winRate} />
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}

/* ════════════════════════════════════════════════════════
   5. POSICION VIEW
════════════════════════════════════════════════════════ */
export function PosicionView({ champions = [], ddVersion, playerData }) {
  const byRole = useMemo(() => {
    const result = {};
    for (const role of ROLES) {
      result[role] = champions
        .filter(c => c.role === role && c.winRate)
        .sort((a, b) => b.winRate - a.winRate)
        .slice(0, 5);
    }
    return result;
  }, [champions]);

  const ROLE_COLORS = {
    TOP: '#f97316', JUNGLE: '#52b788', MID: '#5b8dee', ADC: '#e84057', SUPPORT: '#c89b3c',
  };
  const ROLE_NAMES = {
    TOP: 'Top Lane', JUNGLE: 'Jungla', MID: 'Mid Lane', ADC: 'Bot Lane', SUPPORT: 'Support',
  };

  return (
    <div style={{ padding: '0 0 24px' }}>
      <PageHeader title="Mejores por Lane" subtitle="Top 5 campeones por posición en el meta actual" />

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 10 }}>
        {ROLES.map((role, ri) => {
          const champs = byRole[role] || [];
          const color = ROLE_COLORS[role];
          const best = champs[0];
          return (
            <motion.div key={role}
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
              transition={{ delay: ri * 0.1, ease: [0.22, 1, 0.36, 1] }}
              style={{ background: 'var(--rp-card)', border: `1px solid ${color}44`, borderRadius: 12, overflow: 'hidden' }}
            >
              {/* Column header with splash */}
              <div style={{ position: 'relative', height: 80, background: 'var(--rp-surface)', overflow: 'hidden' }}>
                {best && <SplashImg champ={best} ddVersion={ddVersion} />}
                <div style={{ position: 'absolute', inset: 0, background: `linear-gradient(to top, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0.3) 100%)` }} />
                <div style={{ position: 'absolute', bottom: 8, left: 0, right: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
                  <RoleIcon role={role} size={20} />
                  <div style={{ fontSize: 11, fontWeight: 700, color, letterSpacing: '0.5px' }}>{ROLE_NAMES[role]}</div>
                </div>
              </div>

              {/* Champion list */}
              <div style={{ padding: '10px 8px', display: 'flex', flexDirection: 'column', gap: 4 }}>
                {champs.map((c, ci) => (
                  <motion.div key={c.id}
                    initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: ri * 0.08 + ci * 0.06 }}
                    style={{
                      display: 'flex', alignItems: 'center', gap: 6, padding: '5px 6px',
                      borderRadius: 7,
                      background: ci === 0 ? color + '18' : 'transparent',
                      border: ci === 0 ? `1px solid ${color}44` : '1px solid transparent',
                    }}>
                    <div style={{
                      width: 18, height: 18, borderRadius: 4, flexShrink: 0,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: 11, fontWeight: 800,
                      color: ci === 0 ? color : 'var(--rp-text-sub)',
                      background: ci === 0 ? color + '22' : 'transparent',
                    }}>{ci + 1}</div>
                    <ChampAvatar champion={c} ddVersion={ddVersion} size={28} round />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 11, fontWeight: ci === 0 ? 700 : 500,
                        color: ci === 0 ? 'var(--rp-text)' : 'var(--rp-text-muted)',
                        overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{c.name}</div>
                    </div>
                    <span style={{ fontSize: 10, fontWeight: 700,
                      color: c.winRate >= 53 ? '#52b788' : c.winRate >= 50 ? '#c89b3c' : '#e84057' }}>
                      {c.winRate?.toFixed(1)}%
                    </span>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}


/* ════════════════════════════════════════════════════════
   6. GUIAS VIEW
════════════════════════════════════════════════════════ */
export function GuiasView({ champions = [], ddVersion, playerData }) {
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState(null);
  const [itemsMap, setItemsMap] = useState(null);

  useEffect(() => {
    if (!ddVersion) return;
    loadItemsData(ddVersion).then(setItemsMap).catch(() => {});
  }, [ddVersion]);

  const championsWithBuild = useMemo(() =>
    champions.filter(c => getBuild(c.id) !== null), [champions]
  );

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return championsWithBuild.filter(c => c.name.toLowerCase().includes(q));
  }, [championsWithBuild, search]);

  const build = selected ? getBuild(selected.id) : null;

  const SKILL_COLOR = { Q: '#4a9eff', W: '#52b788', E: '#ff8855', R: '#e84057' };
  const PATH_COLOR = { Precision: '#c89b3c', Domination: '#e84057', Sorcery: '#8b5cf6', Resolve: '#52b788', Inspiration: '#22d3ee' };

  function ItemChip({ name }) {
    if (!name) return null;
    return (
      <span style={{
        display: 'inline-flex', alignItems: 'center', gap: 4, padding: '4px 10px',
        background: 'var(--rp-surface)', border: '1px solid var(--rp-border)',
        borderRadius: 6, fontSize: 12, fontWeight: 600, color: 'var(--rp-text)', whiteSpace: 'nowrap',
      }}>{name}</span>
    );
  }

  return (
    <div style={{ display: 'flex', height: 'calc(100vh - 130px)', overflow: 'hidden', gap: 0 }}>
      {/* Sidebar: champion list */}
      <div style={{ width: 220, flexShrink: 0, borderRight: '1px solid var(--rp-border)', display: 'flex', flexDirection: 'column' }}>
        <div style={{ padding: '0 12px 10px', borderBottom: '1px solid var(--rp-border)', paddingTop: 2 }}>
          <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.8px',
            color: 'var(--rp-text-muted)', marginBottom: 8 }}>
            Guías disponibles <span style={{ color: 'var(--rp-gold)', fontWeight: 800 }}>{championsWithBuild.length}</span>
          </div>
          <SearchInput value={search} onChange={setSearch} placeholder="Buscar..." />
        </div>
        <div style={{ flex: 1, overflowY: 'auto', padding: '4px 6px' }}>
          {filtered.map((champ, i) => {
            const b = getBuild(champ.id);
            const tierColor = TIER_COLOR[b?.tier] || 'var(--rp-text-muted)';
            return (
              <motion.button key={champ.id} onClick={() => setSelected(champ)}
                initial={{ opacity: 0, x: -6 }} animate={{ opacity: 1, x: 0 }}
                transition={{ delay: Math.min(i, 20) * 0.015 }}
                whileTap={{ scale: 0.97 }}
                style={{
                  width: '100%', display: 'flex', alignItems: 'center', gap: 8, padding: '6px 8px',
                  background: selected?.id === champ.id ? 'var(--rp-gold-dim)' : 'transparent',
                  border: selected?.id === champ.id ? '1px solid var(--rp-gold)' : '1px solid transparent',
                  borderRadius: 7, cursor: 'pointer', fontFamily: 'inherit', marginBottom: 1, textAlign: 'left',
                  transition: 'all 0.12s',
                }}
                onMouseEnter={e => { if (selected?.id !== champ.id) e.currentTarget.style.background = 'var(--rp-hover)'; }}
                onMouseLeave={e => { if (selected?.id !== champ.id) e.currentTarget.style.background = 'transparent'; }}
              >
                <ChampAvatar champion={champ} ddVersion={ddVersion} size={34} round />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 12, fontWeight: 600, color: selected?.id === champ.id ? 'var(--rp-gold)' : 'var(--rp-text)',
                    overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{champ.name}</div>
                  <div style={{ fontSize: 10, color: 'var(--rp-text-muted)' }}>{ROLE_LABEL[champ.role]}</div>
                </div>
                {b?.tier && <TierBadge tier={b.tier} />}
              </motion.button>
            );
          })}
        </div>
      </div>

      {/* Right: guide content */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '0 0 24px 20px' }}>
        <AnimatePresence mode="wait">
          {!selected || !build ? (
            <motion.div key="empty"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                height: '100%', gap: 16, color: 'var(--rp-text-muted)' }}
            >
              <svg viewBox="0 0 80 80" width="64" height="64" fill="none">
                <rect x="12" y="8" width="48" height="60" rx="4" stroke="var(--rp-border)" strokeWidth="2"/>
                <path d="M22 24h28M22 34h20M22 44h24M22 54h16" stroke="var(--rp-border)" strokeWidth="1.5" strokeLinecap="round"/>
                <path d="M8 18v44a6 6 0 006 6h2" stroke="var(--rp-border)" strokeWidth="1.5" strokeLinecap="round"/>
              </svg>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--rp-text)', marginBottom: 4 }}>Selecciona un campeón</div>
                <div style={{ fontSize: 13 }}>Guías detalladas con runas, build e items</div>
              </div>
            </motion.div>
          ) : (
            <motion.div key={selected.id}
              initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
              style={{ display: 'flex', flexDirection: 'column', gap: 14 }}
            >
              {/* Header */}
              <div style={{ position: 'relative', height: 130, borderRadius: 12, overflow: 'hidden',
                background: 'var(--rp-surface)', border: '1px solid var(--rp-border)' }}>
                <SplashImg champ={selected} ddVersion={ddVersion} />
                <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(90deg, rgba(0,0,0,0.88) 35%, rgba(0,0,0,0.15) 100%)' }} />
                <div style={{ position: 'absolute', inset: 0, padding: '16px 20px', display: 'flex', alignItems: 'center', gap: 14 }}>
                  <ChampAvatar champion={selected} ddVersion={ddVersion} size={80} round />
                  <div>
                    <div style={{ fontSize: 28, fontWeight: 900, color: '#fff', letterSpacing: '-0.5px' }}>{selected.name}</div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 6 }}>
                      <RoleIcon role={selected.role} size={14} />
                      <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.7)' }}>{ROLE_LABEL[selected.role]}</span>
                      <TierBadge tier={build.tier || 'A'} />
                      <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.5)' }}>Patch {build.patch}</span>
                    </div>
                    <div style={{ marginTop: 4, fontSize: 11, color: 'rgba(255,255,255,0.5)' }}>{build.source}</div>
                  </div>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                {/* Runes */}
                <div style={{ background: 'var(--rp-card)', border: '1px solid var(--rp-border)', borderRadius: 10, padding: '14px 16px' }}>
                  <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.8px',
                    color: 'var(--rp-text-muted)', marginBottom: 12 }}>🔮 Runas</div>
                  <div style={{ marginBottom: 10 }}>
                    <div style={{ fontSize: 16, fontWeight: 800, color: PATH_COLOR[build.runes?.primary] || 'var(--rp-gold)', marginBottom: 4 }}>
                      {build.runes?.keystone}
                    </div>
                    <div style={{ fontSize: 12, color: 'var(--rp-text-muted)' }}>
                      {build.runes?.primary} + {build.runes?.secondary}
                    </div>
                  </div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                    {(build.runes?.page || []).map((r, i) => (
                      <motion.span key={r} initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: i * 0.04 }}
                        style={{
                          padding: '3px 8px', borderRadius: 5, fontSize: 11, fontWeight: 600,
                          background: i === 0 ? PATH_COLOR[build.runes?.primary] + '22' : 'var(--rp-surface)',
                          border: `1px solid ${i === 0 ? PATH_COLOR[build.runes?.primary] + '55' : 'var(--rp-border)'}`,
                          color: i === 0 ? (PATH_COLOR[build.runes?.primary] || 'var(--rp-gold)') : 'var(--rp-text)',
                        }}>{r}</motion.span>
                    ))}
                  </div>
                </div>

                {/* Summoner spells + Skill order */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  <div style={{ background: 'var(--rp-card)', border: '1px solid var(--rp-border)', borderRadius: 10, padding: '14px 16px' }}>
                    <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.8px',
                      color: 'var(--rp-text-muted)', marginBottom: 10 }}>⚡ Hechizos</div>
                    <div style={{ display: 'flex', gap: 8 }}>
                      {(build.summonerSpells || []).map(s => (
                        <div key={s} style={{ padding: '5px 12px', borderRadius: 6, background: 'var(--rp-gold-dim)',
                          border: '1px solid var(--rp-gold)', fontSize: 12, fontWeight: 700, color: 'var(--rp-gold)' }}>{s}</div>
                      ))}
                    </div>
                  </div>
                  <div style={{ background: 'var(--rp-card)', border: '1px solid var(--rp-border)', borderRadius: 10, padding: '14px 16px' }}>
                    <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.8px',
                      color: 'var(--rp-text-muted)', marginBottom: 10 }}>🎯 Orden de habilidades</div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      {(build.skillOrder?.order || 'R > Q > E > W').split('>').map((s, i, arr) => (
                        <React.Fragment key={i}>
                          <span style={{
                            padding: '4px 10px', borderRadius: 6, fontWeight: 800, fontSize: 14,
                            background: SKILL_COLOR[s.trim()] + '22', color: SKILL_COLOR[s.trim()] || '#fff',
                            border: `1px solid ${SKILL_COLOR[s.trim()] || '#fff'}44`,
                          }}>{s.trim()}</span>
                          {i < arr.length - 1 && <span style={{ color: 'var(--rp-text-sub)' }}>›</span>}
                        </React.Fragment>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Items */}
              <div style={{ background: 'var(--rp-card)', border: '1px solid var(--rp-border)', borderRadius: 10, padding: '14px 16px' }}>
                <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.8px',
                  color: 'var(--rp-text-muted)', marginBottom: 12 }}>⚔️ Build de Items</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {[
                    { label: 'Mítico', items: [build.items?.mythic], accent: 'var(--rp-gold)' },
                    { label: 'Botas', items: [build.items?.boots], accent: 'var(--rp-text-muted)' },
                    { label: 'Core', items: build.items?.core || [], accent: 'var(--rp-blue)' },
                    { label: 'Situacional', items: build.items?.situational || [], accent: '#52b788' },
                  ].filter(g => g.items?.some(Boolean)).map(({ label, items, accent }) => (
                    <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <div style={{ width: 70, fontSize: 10, fontWeight: 700, color: accent, textTransform: 'uppercase',
                        letterSpacing: '0.5px', flexShrink: 0 }}>{label}</div>
                      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                        {items.filter(Boolean).map((name, i) => <ItemChip key={i} name={name} />)}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Tips */}
              {build.tips?.length > 0 && (
                <div style={{ background: 'var(--rp-card)', border: '1px solid var(--rp-border)', borderRadius: 10, padding: '14px 16px' }}>
                  <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.8px',
                    color: 'var(--rp-text-muted)', marginBottom: 12 }}>💡 Consejos Pro</div>
                  {build.tips.map((tip, i) => (
                    <motion.div key={i}
                      initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.08 }}
                      style={{ display: 'flex', gap: 10, marginBottom: i < build.tips.length - 1 ? 10 : 0, alignItems: 'flex-start' }}>
                      <div style={{ width: 22, height: 22, borderRadius: 6, background: 'var(--rp-gold-dim)',
                        border: '1px solid var(--rp-gold)', display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: 11, fontWeight: 800, color: 'var(--rp-gold)', flexShrink: 0, marginTop: 1 }}>{i + 1}</div>
                      <p style={{ margin: 0, fontSize: 13, color: 'var(--rp-text-muted)', lineHeight: 1.6 }}>{tip}</p>
                    </motion.div>
                  ))}
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

