import React from "react";
import { analyzeTeamComp } from "../data/champions";

function TeamAnalysis({ label, team, color }) {
  const picks = Object.values(team).filter(Boolean);
  const analysis = analyzeTeamComp(picks);

  if (!analysis) {
    return (
      <div className={`analysis-section ${color}`}>
        <h3 className="analysis-title">{label}</h3>
        <p className="analysis-empty">Add champions to see analysis</p>
      </div>
    );
  }

  return (
    <div className={`analysis-section ${color}`}>
      <h3 className="analysis-title">{label}</h3>

      <div className="damage-dist">
        <span className="dist-label">Damage</span>
        <div className="dist-bars">
          <div className="dist-bar ad" style={{ width: `${(analysis.adCount / picks.length) * 100}%` }}>
            {analysis.adCount > 0 && `AD×${analysis.adCount}`}
          </div>
          <div className="dist-bar ap" style={{ width: `${(analysis.apCount / picks.length) * 100}%` }}>
            {analysis.apCount > 0 && `AP×${analysis.apCount}`}
          </div>
          {analysis.mixedCount > 0 && (
            <div className="dist-bar mixed" style={{ width: `${(analysis.mixedCount / picks.length) * 100}%` }}>
              Mixed×{analysis.mixedCount}
            </div>
          )}
        </div>
      </div>

      <div className="avg-wr">
        Avg. Win Rate: <strong>{analysis.avgWinRate}%</strong>
      </div>

      {analysis.strengths.length > 0 && (
        <div className="analysis-block">
          <div className="block-title strength-title">✅ Strengths</div>
          <ul className="block-list">
            {analysis.strengths.map((s, i) => (
              <li key={i}>{s}</li>
            ))}
          </ul>
        </div>
      )}

      {analysis.weaknesses.length > 0 && (
        <div className="analysis-block">
          <div className="block-title weakness-title">⚠️ Weaknesses</div>
          <ul className="block-list">
            {analysis.weaknesses.map((w, i) => (
              <li key={i}>{w}</li>
            ))}
          </ul>
        </div>
      )}

      {analysis.winConditions.length > 0 && (
        <div className="analysis-block">
          <div className="block-title wincond-title">🏆 Win Conditions</div>
          <ul className="block-list">
            {analysis.winConditions.map((wc, i) => (
              <li key={i}>{wc}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

export default function AnalysisPanel({ blueTeam, redTeam }) {
  const bluePicks = Object.values(blueTeam).filter(Boolean);
  const redPicks = Object.values(redTeam).filter(Boolean);

  const blueAnalysis = analyzeTeamComp(bluePicks);
  const redAnalysis = analyzeTeamComp(redPicks);

  const hasBothTeams = bluePicks.length > 0 && redPicks.length > 0;

  return (
    <div className="analysis-panel">
      <h2 className="analysis-header">📊 Draft Analysis</h2>

      <div className="analysis-teams">
        <TeamAnalysis label="🔵 Blue Team" team={blueTeam} color="blue-analysis" />
        <TeamAnalysis label="🔴 Red Team" team={redTeam} color="red-analysis" />
      </div>

      {hasBothTeams && blueAnalysis && redAnalysis && (
        <div className="matchup-summary">
          <h3 className="matchup-title">⚔️ Matchup Summary</h3>
          <div className="wr-comparison">
            <div className="wr-bar-wrapper">
              <span className="wr-label blue-label">Blue {blueAnalysis.avgWinRate}%</span>
              <div className="wr-track">
                <div
                  className="wr-fill blue-fill"
                  style={{
                    width: `${
                      (parseFloat(blueAnalysis.avgWinRate) /
                        (parseFloat(blueAnalysis.avgWinRate) +
                          parseFloat(redAnalysis.avgWinRate))) *
                      100
                    }%`,
                  }}
                />
              </div>
              <span className="wr-label red-label">Red {redAnalysis.avgWinRate}%</span>
            </div>
          </div>
          <p className="matchup-note">
            {parseFloat(blueAnalysis.avgWinRate) > parseFloat(redAnalysis.avgWinRate)
              ? "🔵 Blue side has a slight statistical edge based on champion win rates."
              : parseFloat(redAnalysis.avgWinRate) > parseFloat(blueAnalysis.avgWinRate)
              ? "🔴 Red side has a slight statistical edge based on champion win rates."
              : "⚖️ Teams are statistically even — execution will decide the game."}
          </p>
        </div>
      )}
    </div>
  );
}
