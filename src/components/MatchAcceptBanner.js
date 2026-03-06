import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

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

  const isMatchFound = event?.type === 'match_found';
  const isAccepted  = event?.type === 'match_accepted';
  const isDeclined  = event?.type === 'match_declined';

  return (
    <AnimatePresence>
      {event && (
        <motion.div
          className={`match-banner ${isAccepted ? 'accepted' : isDeclined ? 'declined' : 'found'}`}
          initial={{ y: -100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -100, opacity: 0 }}
          transition={{ type: 'spring', stiffness: 400, damping: 30 }}
        >
          <div className="match-banner-inner">
            <motion.div
              className="match-banner-icon"
              initial={{ scale: 0.5, rotate: -15 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: 'spring', stiffness: 500, damping: 20, delay: 0.1 }}
            >
              {isAccepted ? '✅' : isDeclined ? '❌' : '⚔️'}
            </motion.div>
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
                  <motion.div
                    className="match-banner-bar"
                    animate={{ width: `${progress}%` }}
                    transition={{ duration: 0.1, ease: 'linear' }}
                  />
                </div>
              )}
            </div>
            <button className="match-banner-close" onClick={onDismiss}>✕</button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
