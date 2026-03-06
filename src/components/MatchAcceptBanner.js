import React, { useEffect, useState } from 'react';

export default function MatchAcceptBanner({ event, onDismiss }) {
  const [progress, setProgress] = useState(100);

  useEffect(() => {
    if (!event) return;
    setProgress(100);
    const total = event.timer || 12;
    const start = Date.now();

    const interval = setInterval(() => {
      const elapsed = (Date.now() - start) / 1000;
      const pct = Math.max(0, 100 - (elapsed / total) * 100);
      setProgress(pct);
      if (pct <= 0) {
        clearInterval(interval);
        onDismiss();
      }
    }, 100);

    return () => clearInterval(interval);
  }, [event, onDismiss]);

  if (!event) return null;

  const isMatchFound = event.type === 'match_found';
  const isAccepted  = event.type === 'match_accepted';
  const isDeclined  = event.type === 'match_declined';

  return (
    <div className={`match-banner ${isAccepted ? 'accepted' : isDeclined ? 'declined' : 'found'}`}>
      <div className="match-banner-inner">
        <div className="match-banner-icon">
          {isAccepted ? '✅' : isDeclined ? '❌' : '⚔️'}
        </div>
        <div className="match-banner-content">
          <div className="match-banner-title">
            {isAccepted ? 'Match Accepted!' : isDeclined ? 'Match Cancelled' : 'Match Found!'}
          </div>
          <div className="match-banner-sub">
            {isMatchFound
              ? 'A game has been found. Accept in the League client.'
              : isAccepted
              ? 'All players accepted — heading to champion select'
              : 'A player declined. Re-queuing...'}
          </div>
          {isMatchFound && (
            <div className="match-banner-bar-wrap">
              <div className="match-banner-bar" style={{ width: `${progress}%` }} />
            </div>
          )}
        </div>
        <button className="match-banner-close" onClick={onDismiss}>✕</button>
      </div>
    </div>
  );
}
