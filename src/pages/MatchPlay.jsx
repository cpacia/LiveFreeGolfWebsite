import React, { useState, useEffect } from "react";
import "./MatchPlay.css";
import { Link } from "react-router-dom";

export default function MatchPlay() {
  const [activeTab, setActiveTab] = useState("about"); // "about" or "bracket"
  const [registrationOpen, setRegistrationOpen] = useState(false);
  const [shopifyUrl, setShopifyUrl] = useState("");
  const [latestYear, setLatestYear] = useState("");
  const [selectedYear, setSelectedYear] = useState("");
  const [years, setYears] = useState([]); // all available bracket years
  const [matches, setMatches] = useState([]); // array of MatchPlayMatch
  const [playersList, setPlayersList] = useState([]);
  const [playersLoading, setPlayersLoading] = useState(false);
  const [playersError, setPlayersError] = useState(null);

  // ─── 1) Fetch MatchPlayInfo to get latestYear + registration flag ─────────
  useEffect(() => {
    const fetchMatchPlayInfo = async () => {
      try {
        const resp = await fetch("/api/match-play");
        if (!resp.ok) {
          throw new Error(`HTTP ${resp.status}`);
        }
        const data = await resp.json();
        if (Array.isArray(data) && data.length > 0) {
          // Sort purely to identify the “latest” year
          const sorted = data.sort(
            (a, b) => parseInt(b.year, 10) - parseInt(a.year, 10),
          );
          const latest = sorted[0];
          setLatestYear(latest.year);
          setSelectedYear(latest.year);
          setRegistrationOpen(latest.registrationOpen);
          setShopifyUrl(latest.shopifyUrl || "");
        }
      } catch (err) {
        console.error("Failed to fetch match-play info:", err);
      }
    };
    fetchMatchPlayInfo();
  }, []);

  // ─── 2) Whenever “Bracket” is active, fetch that year’s results ────────────
  useEffect(() => {
    const fetchBracketResults = async () => {
      if (activeTab !== "bracket" || !selectedYear) return;

      try {
        const url =
          selectedYear === latestYear
            ? "/api/match-play/results"
            : `/api/match-play/results?year=${selectedYear}`;
        const resp = await fetch(url);
        if (!resp.ok) {
          throw new Error(`HTTP ${resp.status}`);
        }
        const data = await resp.json();

        // Store matches exactly as returned
        setMatches(Array.isArray(data.results) ? data.results : []);

        // Build “years” list for the bottom links
        if (Array.isArray(data.additionalYears)) {
          const filtered = data.additionalYears.filter(
            (y) => y !== selectedYear,
          );
          setYears([selectedYear, ...filtered]);
        }
      } catch (err) {
        console.error("Failed to fetch bracket results:", err);
      }
    };

    fetchBracketResults();
  }, [activeTab, selectedYear, latestYear]);

  // ─── Fetch players when players tab is active ───────────────────────
  useEffect(() => {
    if (activeTab !== "players") return;
    setPlayersLoading(true);
    setPlayersError(null);
    fetch("/api/match-play/players")
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json();
      })
      .then((data) => setPlayersList(Array.isArray(data) ? data : []))
      .catch((err) => setPlayersError(err.message))
      .finally(() => setPlayersLoading(false));
  }, [activeTab]);

  const handleTabClick = (tab) => {
    setActiveTab(tab);
  };

  // ────────────────────────────────────────────────────────────────────────────
  // Extract, in order, each unique Round name exactly as the API returned it
  // (we will use index 0 as the “first round”)
  const extractRoundOrder = () => {
    const seen = [];
    matches.forEach((m) => {
      if (!seen.includes(m.round)) {
        seen.push(m.round);
      }
    });
    return seen; // e.g. ["Round 1 Matches", "Round 2 Matches", "Quarterfinals", …]
  };

  // ────────────────────────────────────────────────────────────────────────────
  // Given the firstRoundName (e.g. "Round 1 Matches") and how many matches are
  // in that first round, return a full array of headings to display. If the
  // bracket size is 16 matches (32 players), we inject "Round 2 Matches", etc.
  const buildFullRoundList = (firstRoundName) => {
    // Count how many matches share exactly the first round name
    const firstCount = matches.filter((m) => m.round === firstRoundName).length;

    // If there is no data or an unexpected count, just show whatever rounds we saw
    if (![8, 16, 32].includes(firstCount)) {
      return extractRoundOrder();
    }

    // We also need to generate "Round 2 Matches" or "Round 3 Matches" by incrementing
    // the numeric portion inside firstRoundName:
    const makeSubsequentRound = (baseName, incrementBy) => {
      // Example baseName: "Round 1 Matches"
      // We look for the first integer in that string, increment it, then replace it:
      const numMatch = baseName.match(/(\d+)/);
      if (numMatch) {
        const currentNum = parseInt(numMatch[1], 10);
        const nextNum = currentNum + incrementBy;
        // Replace only the first occurrence of that number
        return baseName.replace(/\d+/, nextNum.toString());
      }
      // If we can’t parse a number, fall back to a generic string
      return `Round ${incrementBy + 1} Matches`;
    };

    // CASE A) 8 matches in first round → 16 players total
    // Next stage is Quarterfinals (no Round 2)
    if (firstCount === 8) {
      return [
        firstRoundName,
        "Quarterfinals",
        "Semifinals",
        "Finals",
        "Champion",
      ];
    }

    // CASE B) 16 matches in first round → 32 players total
    // Next stage is Round 2 (16 matches → 8 matches → …)
    if (firstCount === 16) {
      const round2Name = makeSubsequentRound(firstRoundName, 1);
      return [
        firstRoundName,
        round2Name,
        "Quarterfinals",
        "Semifinals",
        "Finals",
        "Champion",
      ];
    }

    // CASE C) 32 matches in first round → 64 players total
    // Next stage is Round 2, then Round 3, then Quarterfinals, etc.
    if (firstCount === 32) {
      const round2Name = makeSubsequentRound(firstRoundName, 1);
      const round3Name = makeSubsequentRound(firstRoundName, 2);
      return [
        firstRoundName,
        round2Name,
        round3Name,
        "Quarterfinals",
        "Semifinals",
        "Finals",
        "Champion",
      ];
    }

    // Fallback (shouldn't get here)
    return extractRoundOrder();
  };

  // ────────────────────────────────────────────────────────────────────────────
  // Render bracket columns in the exact order determined above
  // ────────────────────────────────────────────────────────────────────────────
  // Render bracket columns in the exact order determined above, but ALWAYS
  // create “expectedMatches” slots per column (real matches + placeholders).
  const renderBracket = () => {
    // 1) If there are no matches at all:
    if (matches.length === 0) {
      return <p>No bracket data yet.</p>;
    }

    // 2) Determine Round 1’s name and its match count:
    const roundOrder = extractRoundOrder();
    const firstRoundName = roundOrder[0];
    const firstCount = matches.filter((m) => m.round === firstRoundName).length;

    // 3) Build the full list of round headings (e.g. ["Round 1", "Round 2", "Quarterfinals", …])
    const allRoundNames = buildFullRoundList(firstRoundName);

    return (
      <div className="bracket-container">
        {(() => {
          const winnerToScoreMap = new Map(); // winner -> score

          return allRoundNames.map((roundName, c) => {
            const roundMatches = matches.filter((m) => m.round === roundName);

            let expectedMatches = Math.floor(firstCount / Math.pow(2, c));
            if (expectedMatches < 1 && c === allRoundNames.length - 1) {
              expectedMatches = 1;
            }

            return (
              <div key={roundName} className="bracket-column">
                <div className="bracket-header">{roundName}</div>

                {Array.from({ length: expectedMatches }).map((_, j) => {
                  const match = roundMatches[j];
                  let player1Extra = "",
                    player2Extra = "";

                  if (c === 1) {
                    player1Extra = " player1-round2";
                    player2Extra = " player2-round2";
                  } else if (c === 2) {
                    player1Extra = " player1-round3";
                    player2Extra = " player2-round3";
                  } else if (c === 3) {
                    player1Extra = " player1-round4";
                    player2Extra = " player2-round4";
                  } else if (c === 4) {
                    player1Extra = " player1-round5";
                    player2Extra = " player2-round5";
                  } else if (c === 5) {
                    player1Extra = " player1-round6";
                    player2Extra = " player2-round6";
                  }

                  if (match) {
                    // Store winner -> score in map
                    if (match.winner && match.score) {
                      winnerToScoreMap.set(match.winner, match.score);
                    }

                    // Retrieve previous scores if available
                    const p1ScoreFromLastRound = winnerToScoreMap.get(
                      match.player1,
                    );
                    const p2ScoreFromLastRound = winnerToScoreMap.get(
                      match.player2,
                    );

                    return (
                      <div
                        key={match.id || `${match.round}-${match.matchNum}`}
                        className="bracket-match"
                      >
                        <div
                          className={`bracket-player1 bracket-player${player1Extra}`}
                          data-score={p1ScoreFromLastRound || ""}
                        >
                          {match.player1 || "\u200B"}
                        </div>
                        <div
                          className={`bracket-player2 player2 bracket-player${player2Extra}`}
                          data-score={p2ScoreFromLastRound || ""}
                        >
                          {match.player2 || "\u200B"}
                        </div>
                      </div>
                    );
                  } else {
                    return (
                      <div
                        key={`empty-${roundName}-${j}`}
                        className="bracket-match"
                      >
                        <div className={`bracket-player${player1Extra}`}>
                          &#8203;
                        </div>
                        <div
                          className={`player2 bracket-player${player2Extra}`}
                        >
                          &#8203;
                        </div>
                      </div>
                    );
                  }
                })}
              </div>
            );
          });
        })()}
      </div>
    );
  };

  return (
    <div className="matchplay-wrapper">
      <div className="matchplay-content full-bleed">
        <div className="matchplay-content-container">
          {/* ─── TABS + REGISTER BUTTON ───────────────────────────────────────── */}
          <div className="matchplay-tabs-container">
            <div className="matchplay-tabs">
              <button
                className={`tab ${activeTab === "about" ? "tab-active" : ""}`}
                onClick={() => handleTabClick("about")}
              >
                About
              </button>
              <button
                className={`tab ${activeTab === "bracket" ? "tab-active" : ""}`}
                onClick={() => handleTabClick("bracket")}
              >
                Bracket
              </button>
              <button
                className={`tab ${activeTab === "players" ? "tab-active" : ""}`}
                onClick={() => handleTabClick("players")}
              >
                Players
              </button>
            </div>

            {registrationOpen && (
              <Link
                to={shopifyUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-register"
              >
                Register For Match Play ►
              </Link>
            )}
          </div>

          {/* ─── ABOUT TAB ───────────────────────────────────────────────────── */}
          {activeTab === "about" && (
            <div className="matchplay-blurb">
              <h2 className="standings-year-heading">
                LFG Match Play Tournament
              </h2>

              <p>
                In addition to the regular season schedule we also play a season-long match play tournament. The field will include {" "}
                <strong>16, 24, or 32 players</strong>, depending on the number
                of entries. Each match must be scheduled and played within  a{" "}
                <strong>one-month window</strong>, at a time and location agreed
                upon by both players.
              </p>

              <h3>Match Format</h3>
              <ul>
                <li>
                  All matches are <strong>18 holes</strong>.
                </li>
                <li>GHIN Course Handicaps will be used for both players.</li>
                <li>
                  Players can choose one of two handicap formats:
                  <ul>
                    <li>
                      <strong>Option A:</strong> Stroke off the lower handicap.
                      (e.g., a 12 vs. a 6 — the 12 receives strokes on the 6
                      hardest holes.)
                    </li>
                    <li>
                      <strong>Option B:</strong> Each player receives strokes
                      based on their handicap. (e.g., the 12 receives strokes on
                      holes 7–12.)
                    </li>
                  </ul>
                </li>
                <li>
                  All matches are played under <strong>LFG Rules</strong>.
                </li>
                <li>
                  Please be flexible in scheduling — do not offer only one or
                  two limited dates to your opponent.
                </li>
              </ul>

              <h3>Tie Breaker Procedures</h3>
              <ul>
                <li>
                  If extra holes cannot be played, proceed to the putting green
                  for a <strong>putt/chip-off</strong>.
                </li>
                <li>
                  If still tied, the player with the{" "}
                  <strong>biggest lead during the match</strong> is the winner.
                </li>
                <li>
                  If still tied, the <strong>last player to hold a lead</strong>{" "}
                  is the winner.
                </li>
                <li>
                  Players may also agree to any other tie-breaking method, as
                  long as both participants agree.
                </li>
              </ul>

              <h3>Schedule (Based on 32 Players)</h3>
              <ul>
                <li>
                  <strong>Round 1:</strong> May 15 – June 15
                </li>
                <li>
                  <strong>Round 2:</strong> June 16 – July 15
                </li>
                <li>
                  <strong>Quarterfinals:</strong> July 16 – August 15
                </li>
                <li>
                  <strong>Semi-Finals:</strong> August 16 – September 15
                </li>
                <li>
                  <strong>Finals &amp; Consolation Match:</strong> September 15
                  – October 15
                </li>
              </ul>

              <p>
                Note: The tournament may be expedited after Round 2 as fewer
                players remain. Once matchups are set, players may play early if
                both agree.
              </p>

              <h3>Entry &amp; Payouts</h3>
              <ul>
                <li>
                  <strong>Entry Fee:</strong> $25
                </li>
                <li>
                  All green/cart fees are the responsibility of the players.
                </li>
              </ul>

              <h4>Payouts:</h4>
              <ul>
                <li>
                  <strong>Champion:</strong> $225
                </li>
                <li>
                  <strong>Runner-Up:</strong> $125
                </li>
                <li>
                  <strong>3rd Place:</strong> $50
                </li>
                <li>
                  <strong>4th Place:</strong> $50
                </li>
              </ul>
            </div>
          )}

          {/* ─── BRACKET TAB ───────────────────────────────────────────────────── */}
          {activeTab === "bracket" && (
            <div className="matchplay-bracket">
              {matches.length > 0 ? (
                <>
                  {renderBracket()}

                  {/* Links to switch between years’ brackets */}
                  <div className="season-links">
                    {years.map((yr, idx) => (
                      <React.Fragment key={yr}>
                        {idx > 0 && <>|&nbsp;</>}
                        {yr === selectedYear ? (
                          <span className="current-year">{yr}</span>
                        ) : (
                          <Link to={`?year=${yr}`}>{yr}</Link>
                        )}
                      </React.Fragment>
                    ))}
                  </div>
                </>
              ) : (
                <p>Loading bracket…</p>
              )}
            </div>
          )}
          {/* PLAYERS TAB */}
          {activeTab === "players" && (
            <div className="ml-content-container">
              {playersLoading ? (
                <p>Loading players…</p>
              ) : playersError ? (
                <p className="error-text">Error: {playersError}</p>
              ) : playersList.length === 0 ? (
                <p>No players available.</p>
              ) : (
                <table className="disabled-table">
                  <thead>
                    <tr>
                      <th>Player</th>
                      <th>Handicap</th>
                    </tr>
                  </thead>
                  <tbody>
                    {playersList.map((pl) => (
                      <tr key={pl.player}>
                        <td>{pl.player}</td>
                        <td>{pl.handicap}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
