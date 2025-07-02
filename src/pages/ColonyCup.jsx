import React, { useState, useEffect } from "react";
import "./ColonyCup.css";

export default function ColonyCup() {
  const [infos, setInfos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [standings, setStandings] = useState(null);
  const [standingsError, setStandingsError] = useState(null);

  // Fetch Colony Cup info
  useEffect(() => {
    async function fetchCup() {
      setLoading(true);
      setError(null);
      try {
        const resp = await fetch("/api/colony-cup");
        if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
        const data = await resp.json();
        if (Array.isArray(data)) {
          data.sort((a, b) => Number(a.year) - Number(b.year));
          setInfos(data);
        } else {
          setInfos([data]);
        }
      } catch (e) {
        console.error(e);
        setError("Failed to load Colony Cup info.");
      } finally {
        setLoading(false);
      }
    }
    fetchCup();
  }, []);

  // Fallback: if this year's team is empty, fetch standings
  useEffect(() => {
    if (!loading && !error) {
      const currentYear = new Date().getFullYear().toString();
      const thisEntry = infos.find((e) => e.year === currentYear);
      let team = [];
      if (thisEntry) {
        if (Array.isArray(thisEntry.team)) team = thisEntry.team;
        else if (typeof thisEntry.team === "string") {
          try {
            const parsed = JSON.parse(thisEntry.team);
            if (Array.isArray(parsed)) team = parsed;
          } catch {}
        }
      }
      if (thisEntry && team.length === 0) {
        async function fetchStandings() {
          try {
            const resp = await fetch("/api/standings");
            if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
            const data = await resp.json();
            setStandings(data);
          } catch (e) {
            console.error(e);
            setStandingsError("Failed to load season standings.");
          }
        }
        fetchStandings();
      }
    }
  }, [loading, error, infos]);

  // Helpers for grid
  const make4x3Grid = (namesArray = []) => {
    const MAX = 12;
    const names = namesArray.slice(0, MAX);
    while (names.length < MAX) names.push("");
    const grid = [];
    for (let i = 0; i < MAX; i += 3) {
      grid.push(names.slice(i, i + 3));
    }
    return grid;
  };

  const makeTBDGrid = () => {
    const ROWS = 4;
    const COLS = 3;
    return Array.from({ length: ROWS }).map((_, r) =>
      Array.from({ length: COLS }).map((_, c) => (r === 1 && c === 1 ? "TBD" : "\u200B"))
    );
  };

  if (loading) return <p className="loading-text">Loading…</p>;
  if (error) return <p className="error-text">{error}</p>;

  return (
    <div className="full-bleed colonycup-content">
      <div className="content-container">
        {/* Heading & Blurb */}
        <h2 className="colonycup-heading">Colony Cup 🏆</h2>
        <section className="colonycup-blurb">
          <p>
            Each fall, two 12-player teams from around the State battle it out for bragging
            rights—and the chance to return as defending champions next year. Over one
            action-packed weekend, golfers face off in various 9-hole, head-to-head matches,
            accumulating points to push their squad to victory.
          </p>
          <p>
            The prior year’s winning team automatically earns a spot in the next Colony Cup.
            Their captain may choose to drop up to <strong>two</strong> players and replace
            them with the draft picks at positions #6 and #8. If only one player is dropped,
            the captain receives the 8th pick.
          </p>
          <p><em>(Any dropped player who remains eligible will be picked up by the opposing team.)</em></p>
          <p>
            This year's captain fills out the squad by selecting the nine highest-ranked
            available players, plus two additional “captain’s picks” from the top-50 season
            rankings.
          </p>
        </section>

        {infos.length === 0 && <p className="no-team-text">No Colony Cup data available.</p>}

        {infos.map((entry) => {
          const year = entry.year;
          const isCurrent = year === new Date().getFullYear().toString();
          let players = [];
          if (Array.isArray(entry.team)) players = entry.team;
          else if (typeof entry.team === 'string') {
            try { const parsed = JSON.parse(entry.team); if (Array.isArray(parsed)) players = parsed; } catch {}
          }
          const grid = players.length > 0 ? make4x3Grid(players) : makeTBDGrid();

          return (
            <div key={year} className="colonycup-table-block">
              <h3 className="winning-team-heading">
                {entry.winningTeam ? `${year} Winning Team` : `${year} Colony Cup Team`}
              </h3>

              {isCurrent && players.length === 0 ? (
                <table className="standings-table">
                  <thead>
                    <tr>
                      <th>
                        <span className="full-header">Rank</span>
                        <span className="abbr-header">Rk</span>
                      </th>
                      <th>Player</th>
                      <th>Points</th>
                    </tr>
                  </thead>
                  <tbody>
                    {standingsError && (
                      <tr>
                        <td colSpan="3" className="error-text">
                          {standingsError}
                        </td>
                      </tr>
                    )}
                    {!standings && !standingsError && (
                      <tr>
                        <td colSpan="3">Loading standings…</td>
                      </tr>
                    )}
                    {standings &&
                      standings.season
                        .filter((p) => {
                          const lastYear = (Number(year) - 1).toString();
                          const lastEntry = infos.find((e) => e.year === lastYear);
                          let lastTeam = [];
                          if (lastEntry) {
                            if (Array.isArray(lastEntry.team)) lastTeam = lastEntry.team;
                            else if (typeof lastEntry.team === 'string') {
                              try { const parsed = JSON.parse(lastEntry.team); if (Array.isArray(parsed)) lastTeam = parsed;} catch{}
                            }
                          }
                          return !lastTeam.includes(p.player);
                        })
                        .sort((a, b) => Number(a.rank) - Number(b.rank))
                        .slice(0, 20)
                        .map((p, i) => (
                          <tr key={p.ID}>
                            <td>{i + 1}</td>
                            <td>{p.player}</td>
                            <td>{p.points}</td>
                          </tr>
                        ))}
                  </tbody>
                </table>
              ) : (
                <table className="winning-team-table">
                  <tbody>
                    {grid.map((row, rowIndex) => (
                      <tr key={rowIndex}>
                        {row.map((name, colIndex) => (
                          <td key={colIndex}>{name}</td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

