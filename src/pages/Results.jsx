import React, { useState, useEffect, useMemo } from "react";
import { getImageUrl } from "../lib/api";
import "./Results.css";
import "./Schedule.css"; // <-- pull in the same Schedule‐page styles for the header

export default function Results() {
  // 1) Get eventID from the query string
  const params = new URLSearchParams(window.location.search);
  const eventID = params.get("eventID") || "";

  // 2) State for event metadata
  const [eventData, setEventData] = useState(null);
  const [loadingEvent, setLoadingEvent] = useState(true);
  const [errorEvent, setErrorEvent] = useState(null);

  // 3) Classic tables state (non–Colony Cup)
  const [selectedTable, setSelectedTable] = useState("net");
  const [tableData, setTableData] = useState(null);
  const [loadingTable, setLoadingTable] = useState(false);
  const [errorTable, setErrorTable] = useState(null);

  // 4) Colony Cup state
  const [isColonyCup, setIsColonyCup] = useState(false);
  const [colonyData, setColonyData] = useState(null); // full JSON from /api/results/colonycup/{eventID}
  const [loadingColony, setLoadingColony] = useState(false);
  const [errorColony, setErrorColony] = useState(null);
  const [selectedCupEvent, setSelectedCupEvent] = useState(""); // e.g., "Scramble", "Best Ball", etc.

  // ─── Helper: format "2025-05-26" as "May 26" ─────────────────────────────────
  function formatDateWithoutYear(isoDateString) {
    if (!isoDateString) return "";
    const dt = new Date(isoDateString);
    return dt.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });
  }

  // ─── Detect "Colony Cup" robustly ────────────────────────────────────────────
  function detectColonyCup(evt) {
    // Prefer event name when available; fall back to eventID
    const str = `${evt?.name || ""} ${eventID}`.toLowerCase();
    return str.includes("colony") && str.includes("cup");
  }

  // ─── Fetch event metadata ────────────────────────────────────────────────────
  useEffect(() => {
    if (!eventID) {
      setErrorEvent("No eventID provided.");
      setLoadingEvent(false);
      return;
    }

    const fetchEvent = async () => {
      setLoadingEvent(true);
      setErrorEvent(null);
      try {
        const resp = await fetch(`/api/events/${eventID}`);
        if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
        const data = await resp.json();
        setEventData(data);
        const colony = detectColonyCup(data);
        setIsColonyCup(colony);
      } catch (err) {
        console.error(err);
        setErrorEvent("Failed to load event information.");
      } finally {
        setLoadingEvent(false);
      }
    };

    fetchEvent();
  }, [eventID]);

  // ─── Classic results fetching (only when NOT Colony Cup) ─────────────────────
  useEffect(() => {
    if (!eventID || isColonyCup) return; // skip when Colony Cup

    const fetchTable = async () => {
      let url = "";
      switch (selectedTable) {
        case "net":
          url = `/api/results/net/${eventID}`;
          break;
        case "gross":
          url = `/api/results/gross/${eventID}`;
          break;
        case "skins":
          url = `/api/results/skins/${eventID}`;
          break;
        case "teams":
          url = `/api/results/teams/${eventID}`;
          break;
        case "wgr":
          url = `/api/results/wgr/${eventID}`;
          break;
        default:
          setErrorTable("Unknown table selection.");
          setLoadingTable(false);
          return;
      }

      setLoadingTable(true);
      setErrorTable(null);
      setTableData(null);

      try {
        const resp = await fetch(url);
        if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
        const data = await resp.json();
        if (selectedTable === "skins") {
          setTableData({
            players: Array.isArray(data.players) ? data.players : [],
            holes: Array.isArray(data.holes) ? data.holes : [],
          });
        } else {
          let arr = [];
          if (Array.isArray(data)) {
            arr = data;
          } else {
            const candidates = Object.keys(data || {}).filter((k) =>
              Array.isArray(data[k])
            );
            arr = candidates.length > 0 ? data[candidates[0]] : [];
          }
          setTableData(arr);
        }
      } catch (err) {
        console.error(err);
        setErrorTable("Failed to load results.");
      } finally {
        setLoadingTable(false);
      }
    };

    fetchTable();
  }, [selectedTable, eventID, isColonyCup]);

  // ─── Colony Cup data fetching ────────────────────────────────────────────────
  useEffect(() => {
    if (!eventID || !isColonyCup) return; // only when Colony Cup

    const fetchColony = async () => {
      setLoadingColony(true);
      setErrorColony(null);
      setColonyData(null);
      try {
        const resp = await fetch(`/api/results/colony-cup/${eventID}`);
        if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
        const data = await resp.json();
        setColonyData(data);

        // Choose a sensible default event tab
        const ordered = [
          "Scramble",
          "Best Ball",
          "Champman",
          "Match Play",
        ];
        const keys = Object.keys(data || {}).filter((k) => k !== "Colony Cup");
        const first = ordered.find((k) => keys.includes(k)) || keys[0] || "";
        setSelectedCupEvent(first);
      } catch (err) {
        console.error(err);
        setErrorColony("Failed to load Colony Cup results.");
      } finally {
        setLoadingColony(false);
      }
    };

    fetchColony();
  }, [eventID, isColonyCup]);

  // ─── UI helpers for Colony Cup ───────────────────────────────────────────────
  const colonyOverview = useMemo(() => {
    if (!colonyData || !colonyData["Colony Cup"]) return null;
    const cc = colonyData["Colony Cup"];
    // score like "14-16"
    const [s1, s2] = String(cc.score || "-").split("-").map((s) => s.trim());
    return {
      team1: cc.team1 || "Team 1",
      team2: cc.team2 || "Team 2",
      score1: s1 || "-",
      score2: s2 || "-",
      winner: cc.winner || "",
    };
  }, [colonyData]);

  const colonyEventKeys = useMemo(() => {
    if (!colonyData) return [];
    return Object.keys(colonyData).filter((k) => k !== "Colony Cup");
  }, [colonyData]);

  // ─── Classic dropdown change handler ────────────────────────────────────────
  const onSelectChange = (e) => {
    const newTable = e.target.value;
    setLoadingTable(true);
    setErrorTable(null);
    setTableData(null);
    setSelectedTable(newTable);
  };

  // ─── Colony dropdown change handler ─────────────────────────────────────────
  const onCupEventChange = (e) => {
    setSelectedCupEvent(e.target.value);
  };

  // ─── Classic table renderer (unchanged) ─────────────────────────────────────
  const renderClassicTables = () => {
    if (loadingTable) return <p className="loading-text">Loading results…</p>;
    if (errorTable) return <p className="error-text">{errorTable}</p>;

    if (selectedTable === "net") {
      if (!Array.isArray(tableData)) return <p className="loading-text">Loading results…</p>;
      return (
        <table className="results-table net-table">
          <thead>
            <tr>
              <th>
                <span className="full-header">Place</span>
                <span className="abbr-header">Pl</span>
              </th>
              <th>Player</th>
              <th>
                <span className="full-header">Total</span>
                <span className="abbr-header">Tot</span>
              </th>
              <th>
                <span className="full-header">Strokes</span>
                <span className="abbr-header">Str</span>
              </th>
              <th>
                <span className="full-header">Points</span>
                <span className="abbr-header">Pts</span>
              </th>
            </tr>
          </thead>
          <tbody>
            {tableData.length === 0 ? (
              <tr>
                <td colSpan="5" style={{ textAlign: "center" }}>
                  No data available.
                </td>
              </tr>
            ) : (
              tableData.map((row, idx) => (
                <tr key={idx}>
                  <td>{row.rank}</td>
                  <td>
                    {row.scorecardUrl ? (
                      <a
                        href={row.scorecardUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="results-link"
                      >
                        {row.player}
                      </a>
                    ) : (
                      row.player
                    )}
                  </td>
                  <td style={{ textAlign: "center" }}>{row.total}</td>
                  <td style={{ textAlign: "center" }}>{row.strokes}</td>
                  <td style={{ textAlign: "center" }}>{row.points}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      );
    }

    if (selectedTable === "gross") {
      if (!Array.isArray(tableData)) return <p className="loading-text">Loading results…</p>;
      return (
        <table className="results-table gross-table">
          <thead>
            <tr>
              <th>
                <span className="full-header">Place</span>
                <span className="abbr-header">Pl</span>
              </th>
              <th>Player</th>
              <th>
                <span className="full-header">Total</span>
                <span className="abbr-header">Tot</span>
              </th>
              <th>
                <span className="full-header">Strokes</span>
                <span className="abbr-header">Str</span>
              </th>
            </tr>
          </thead>
          <tbody>
            {tableData.length === 0 ? (
              <tr>
                <td colSpan="4" style={{ textAlign: "center" }}>
                  No data available.
                </td>
              </tr>
            ) : (
              tableData.map((row, idx) => (
                <tr key={idx}>
                  <td>{row.rank}</td>
                  <td>
                    {row.scorecardUrl ? (
                      <a
                        href={row.scorecardUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="results-link"
                      >
                        {row.player}
                      </a>
                    ) : (
                      row.player
                    )}
                  </td>
                  <td style={{ textAlign: "center" }}>{row.total}</td>
                  <td style={{ textAlign: "center" }}>{row.strokes}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      );
    }

    if (selectedTable === "teams") {
      if (!Array.isArray(tableData)) return <p className="loading-text">Loading results…</p>;

      const hasTotalColumn = tableData.every(
        (row) => row.total !== null && row.total !== undefined && row.total !== ""
      );

      return (
        <table className="results-table teams-table">
          <thead>
            <tr>
              <th>
                <span className="full-header">Place</span>
                <span className="abbr-header">Pl</span>
              </th>
              <th>Team</th>
              {hasTotalColumn && (
                <th>
                  <span className="full-header">Total</span>
                  <span className="abbr-header">Tot</span>
                </th>
              )}
              <th>
                <span className="full-header">Strokes</span>
                <span className="abbr-header">Str</span>
              </th>
            </tr>
          </thead>
          <tbody>
            {tableData.length === 0 ? (
              <tr>
                <td colSpan={hasTotalColumn ? 4 : 3} style={{ textAlign: "center" }}>
                  No data available.
                </td>
              </tr>
            ) : (
              tableData.map((row, idx) => (
                <tr key={idx}>
                  <td>{row.rank}</td>
                  <td>{row.team}</td>
                  {hasTotalColumn && (
                    <td style={{ textAlign: "center" }}>{row.total}</td>
                  )}
                  <td style={{ textAlign: "center" }}>{row.strokes}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      );
    }

    if (selectedTable === "wgr") {
      if (!Array.isArray(tableData)) return <p className="loading-text">Loading results…</p>;
      return (
        <table className="results-table net-table">
          <thead>
            <tr>
              <th>
                <span className="full-header">Place</span>
                <span className="abbr-header">Pl</span>
              </th>
              <th>Player</th>
              <th>
                <span className="full-header">Total</span>
                <span className="abbr-header">Tot</span>
              </th>
              <th>
                <span className="full-header">Strokes</span>
                <span className="abbr-header">Str</span>
              </th>
              <th>
                <span className="full-header">Points</span>
                <span className="abbr-header">Pts</span>
              </th>
            </tr>
          </thead>
          <tbody>
            {tableData.length === 0 ? (
              <tr>
                <td colSpan="5" style={{ textAlign: "center" }}>
                  No data available.
                </td>
              </tr>
            ) : (
              tableData.map((row, idx) => (
                <tr key={idx}>
                  <td>{row.rank}</td>
                  <td>
                    {row.scorecardUrl ? (
                      <a
                        href={row.scorecardUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="results-link"
                      >
                        {row.player}
                      </a>
                    ) : (
                      row.player
                    )}
                  </td>
                  <td style={{ textAlign: "center" }}>{row.total}</td>
                  <td style={{ textAlign: "center" }}>{row.strokes}</td>
                  <td style={{ textAlign: "center" }}>{row.points}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      );
    }

    if (selectedTable === "skins") {
      if (!tableData || !Array.isArray(tableData.players) || !Array.isArray(tableData.holes)) {
        return <p className="loading-text">Loading results…</p>;
      }

      const players = tableData.players;
      const holes = tableData.holes;

      return (
        <>
          {/* Player‐based Skins */}
          <table className="results-table skins-player-table">
            <thead>
              <tr>
                <th>
                  <span className="full-header">Place</span>
                  <span className="abbr-header">Pl</span>
                </th>
                <th>Player</th>
                <th>Skins</th>
              </tr>
            </thead>
            <tbody>
              {players.length === 0 ? (
                <tr>
                  <td colSpan="3" style={{ textAlign: "center" }}>
                    No player data.
                  </td>
                </tr>
              ) : (
                players.map((row, idx) => (
                  <tr key={idx}>
                    <td>{row.rank}</td>
                    <td>
                      {row.scorecardUrl ? (
                        <a
                          href={row.scorecardUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="results-link"
                        >
                          {row.player}
                        </a>
                      ) : (
                        row.player
                      )}
                    </td>
                    <td style={{ textAlign: "center" }}>{row.skins}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>

          {/* Hole‐by‐hole Skins */}
          <table className="results-table skins-hole-table skins-margin">
            <thead>
              <tr>
                <th>
                  <span className="full-header">Hole</span>
                  <span className="abbr-header">Hl</span>
                </th>
                <th>Par</th>
                <th>
                  <span className="full-header">Score</span>
                  <span className="abbr-header">Scr</span>
                </th>
                <th>Won</th>
                <th>Tie</th>
              </tr>
            </thead>
            <tbody>
              {holes.length === 0 ? (
                <tr>
                  <td colSpan="5" style={{ textAlign: "center" }}>
                    No hole data.
                  </td>
                </tr>
              ) : (
                holes.map((row, idx) => (
                  <tr key={idx}>
                    <td style={{ textAlign: "center" }}>{row.hole}</td>
                    <td style={{ textAlign: "center" }}>{row.par}</td>
                    <td style={{ textAlign: "center" }}>{row.score}</td>
                    <td style={{ textAlign: "left" }}>{row.won}</td>
                    <td style={{ textAlign: "left" }}>{row.tie}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </>
      );
    }

    return null;
  };

  // ─── Colony Cup renderer ────────────────────────────────────────────────────
  const renderColonyCup = () => {
    if (loadingColony) return <p className="loading-text">Loading Colony Cup…</p>;
    if (errorColony) return <p className="error-text">{errorColony}</p>;
    if (!colonyData) return null;

    const overview = colonyOverview;
    const matches = (selectedCupEvent && Array.isArray(colonyData[selectedCupEvent]))
      ? colonyData[selectedCupEvent]
      : [];

    return (
      <>
        {/* ===== A) Overall score box ===== */}
        {overview && (
          <div className="colony-overview">
            <div className="colony-overview-row">
              <div className="colony-team">
                <span className="colony-team-name">
                {overview.winner === overview.team1 && "🏆 "}
				{overview.team1}
				</span>
                <span className="colony-team-score">{overview.score1}</span>
              </div>
              <div className="colony-team">
                <span className="colony-team-score">{overview.score2}</span>
                <span className="colony-team-name">
                {overview.winner === overview.team2 && "🏆 "}
                {overview.team2}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* ===== B) Event dropdown ===== */}
        <div className="results-dropdown-container results-dropdown-width">
          <select
            id="colony-select"
            className="results-dropdown schedule-dropdown"
            value={selectedCupEvent}
            onChange={onCupEventChange}
          >
            {colonyEventKeys.map((k) => (
              <option key={k} value={k}>{k}</option>
            ))}
          </select>
        </div>

        {/* ===== C) Matches table ===== */}
        <table className="results-table colony-matches-table">
          <thead>
            <tr>
              <th>{overview.team1}</th>
              <th>Score</th>
              <th>{overview.team2}</th>
            </tr>
          </thead>
          <tbody>
            {matches.length === 0 ? (
              <tr>
                <td colSpan={3} style={{ textAlign: "center" }}>No matches.</td>
              </tr>
            ) : (
              matches.map((m, idx) => (
                <tr key={idx}>
                  <td>{m.team1}</td>
                  <td style={{ textAlign: "center" }}>
                      <div style={{ display: "inline-flex", alignItems: "center", justifyContent: "center" }}>
					  <span className="red-winner" style={{ width: "1em" }}>
					  {m.winner === m.team1 && "✓"}
					</span>
					<span style={{ minWidth: "3em", textAlign: "center"}}>
					  {m.score}
					</span>
					<span className="blue-winner" style={{ width: "1em" }}>
					  {m.winner === m.team2 && "✓"}
					</span>
					</div>
					</td>
                  <td>{m.team2}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </>
    );
  };

  return (
    <div className="full-bleed results-content">
      <div className="content-container">
        {loadingEvent && (
          <p className="loading-text">Loading event information…</p>
        )}
        {errorEvent && <p className="error-text">{errorEvent}</p>}

        {!loadingEvent && !errorEvent && eventData && (
          <>
            {/* ===== 1) Event Header (exactly like Schedule.jsx) ===== */}
            <div className="result-event-item">
              <div className="event-left">
                <img
                  className="thumbnail"
                  src={getImageUrl(`/api/events/${eventID}/thumbnail`)}
                  alt={`${eventData.name} thumbnail`}
                  onError={(e) => {
                    e.currentTarget.onerror = null;
                    e.currentTarget.src = "/images/default-logo.png";
                  }}
                />
                <div className="event-info">
                  <div className="event-name">{eventData.name}</div>
                  <div className="event-meta">
                    {formatDateWithoutYear(eventData.date)} &nbsp;|&nbsp; {eventData.course}
                    <br />
                    {eventData.town}, {eventData.state}
                  </div>
                  <div className="event-meta">
                    {eventData.handicapAllowance} Handicap Allowance
                  </div>
                </div>
              </div>
            </div>

            {/* ===== 2) Body switches between Classic vs Colony Cup ===== */}
            {isColonyCup ? (
              // Colony Cup specific body
              <div className="results-table-container">
                {renderColonyCup()}
              </div>
            ) : (
              <>
                {/* Classic dropdown */}
                <div className="results-dropdown-container results-dropdown-width">
                  <select
                id="results-select"
                className="results-dropdown schedule-dropdown"
                value={selectedTable}
                onChange={onSelectChange}
              >
                {eventData.netLeaderboardUrl && (
                  <option value="net">Net</option>
                )}
                {eventData.grossLeaderboardUrl && (
                  <option value="gross">Gross</option>
                )}
                {eventData.skinsLeaderboardUrl && (
                  <option value="skins">Skins</option>
                )}
                {eventData.teamsLeaderboardUrl && (
                  <option value="teams">Teams</option>
                )}
                {eventData.wgrLeaderboardUrl && (
                  <option value="wgr">WGR</option>
                )}
              </select>
                </div>

                {/* Classic results */}
                <div className="results-table-container">{renderClassicTables()}</div>
              </>
            )}
          </>
        )}
      </div>
    </div>
  );
}

