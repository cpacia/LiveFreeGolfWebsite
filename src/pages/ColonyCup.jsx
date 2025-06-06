// src/components/ColonyCup.jsx
import React, { useState, useEffect } from "react";
import "./ColonyCup.css";

export default function ColonyCup() {
  const [infos, setInfos] = useState([]); // Holds up to two items
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchCup = async () => {
      setLoading(true);
      setError(null);

      try {
        const resp = await fetch("/api/colony-cup");
        if (!resp.ok) {
          throw new Error(`HTTP ${resp.status}`);
        }
        const data = await resp.json();

        // data is an array of up to two ColonyCupInfo objects
        if (Array.isArray(data)) {
          // Sort by numeric year ascending (lowest first)
          data.sort((a, b) => Number(a.year) - Number(b.year));
          setInfos(data);
        } else {
          // If API ever returns a single object, wrap it in an array
          setInfos([data]);
        }
      } catch (e) {
        console.error(e);
        setError("Failed to load Colony Cup info.");
      } finally {
        setLoading(false);
      }
    };

    fetchCup();
  }, []);

  /**
   * Given an array of up to 12 names, returns a 4×3 2D array.
   * If fewer than 12 names, pads with empty strings. If more, slices to 12.
   */
  const make4x3Grid = (namesArray = []) => {
    const MAX = 12;
    const names = namesArray.slice(0, MAX);
    // Pad to length 12 with empty strings
    while (names.length < MAX) {
      names.push("");
    }
    // Chunk into 4 rows × 3 columns
    const grid = [];
    for (let i = 0; i < MAX; i += 3) {
      grid.push(names.slice(i, i + 3));
    }
    return grid;
  };

  /**
   * If there are no players in “team”, produce a 4×3 grid where
   * the center cell is "TBD" and every other cell is a zero-width space (U+200B).
   */
  const makeTBDGrid = () => {
    const rows = 4;
    const cols = 3;
    return Array.from({ length: rows }).map((_, r) =>
      Array.from({ length: cols }).map((_, c) =>
        r === 1 && c === 1 ? "TBD" : "\u200B",
      ),
    );
  };

  return (
    <div className="full-bleed colonycup-content">
      <div className="content-container">
        {/* Loading / error states */}
        {loading && <p className="loading-text">Loading…</p>}
        {error && <p className="error-text">{error}</p>}

        {!loading && !error && (
          <>
            {/* Main heading */}
            <h2 className="colonycup-heading">Colony Cup 🏆</h2>

            {/* Static blurb: adjust text as needed */}
            <section className="colonycup-blurb">
              <p>
                Each fall, two 12-player teams from around the State battle it
                out for bragging rights—and the chance to return as defending
                champions next year. Over one action-packed weekend, golfers
                face off in various 9-hole, head-to-head matches, accumulating
                points to push their squad to victory.
              </p>

              <p>
                The prior year’s winning team automatically earns a spot in the
                next Colony Cup. Their captain may choose to drop up to{" "}
                <strong>two</strong> players—at his sole discretion—and replace
                them with the draft picks at positions #6 and #8. If only one
                player is dropped, the captain receives the 8th pick in the
                draft.
              </p>
              <p>
                <em>
                  (Any dropped player who remains eligible to play will be
                  picked up by the opposing team.)
                </em>
              </p>

              <p>
                The captain of this year's team fills out the squad by selecting
                the nine highest-ranked players who are available (i.e. not
                currently on another Colony Cup team), plus two additional
                “captain’s picks” drawn from anyone inside the top-50 season
                rankings.
              </p>
            </section>

            {/* If infos exist, map over up to two items to render two tables */}
            {infos.length === 0 && (
              <p className="no-team-text">No Colony Cup data available.</p>
            )}

            {infos.map((entry) => {
              const year = entry.year;
              // “team” should be an array of names; if missing or empty, show TBD grid
              let players = [];
				if (Array.isArray(entry.team)) {
				  players = entry.team;
				} else if (typeof entry.team === "string") {
				  try {
					const parsed = JSON.parse(entry.team);
					players = Array.isArray(parsed) ? parsed : [];
				  } catch {
					players = [];
				  }
				}
              const grid =
                players.length > 0 ? make4x3Grid(players) : makeTBDGrid();

              return (
                <div key={year} className="colonycup-table-block">
                  {/* Modified heading logic: show "<year> Colony Cup Team" if winningTeam is false */}
                  <h3 className="winning-team-heading">
                    {entry.winningTeam
                      ? `${year} Winning Team`
                      : `${year} Colony Cup Team`}
                  </h3>

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
                </div>
              );
            })}
          </>
        )}
      </div>
    </div>
  );
}
