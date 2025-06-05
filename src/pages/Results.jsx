// File: Results.jsx
import React, { useState, useEffect } from "react";
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

  // 3) State for which table is selected
  const [selectedTable, setSelectedTable] = useState("net");

  // 4) State for table data + loading / error
  //    tableData will be either:
  //      • an Array (for net/gross/teams/wgr), or
  //      • an Object { players: Array, holes: Array } (for skins),
  //      • or null while loading/cleared
  const [tableData, setTableData] = useState(null);
  const [loadingTable, setLoadingTable] = useState(false);
  const [errorTable, setErrorTable] = useState(null);

  // ─── New: helper to format "2025-05-26" as "May 26"
  function formatDateWithoutYear(isoDateString) {
    if (!isoDateString) return "";
    const dt = new Date(isoDateString);
    return dt.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });
  }

  // 5) Fetch event metadata upon mount (or if eventID changes)
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
        const resp = await fetch(`http://localhost:8080/events/${eventID}`);
        if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
        const data = await resp.json();
        setEventData(data);
      } catch (err) {
        console.error(err);
        setErrorEvent("Failed to load event information.");
      } finally {
        setLoadingEvent(false);
      }
    };

    fetchEvent();
  }, [eventID]);

  // Whenever the user changes the dropdown, *immediately* clear tableData + flip loadingTable
  // so that the next render shows a loading state instead of trying to .map on old data.
  const onSelectChange = (e) => {
    const newTable = e.target.value;
    setLoadingTable(true);
    setErrorTable(null);
    setTableData(null);
    setSelectedTable(newTable);
  };

  // 6) Fetch the selected table’s data whenever selectedTable or eventID changes
  useEffect(() => {
    if (!eventID) return;

    const fetchTable = async () => {
      let url = "";
      switch (selectedTable) {
        case "net":
          url = `http://localhost:8080/results/net/${eventID}`;
          break;
        case "gross":
          url = `http://localhost:8080/results/gross/${eventID}`;
          break;
        case "skins":
          url = `http://localhost:8080/results/skins/${eventID}`;
          break;
        case "teams":
          url = `http://localhost:8080/results/teams/${eventID}`;
          break;
        case "wgr":
          url = `http://localhost:8080/results/wgr/${eventID}`;
          break;
        default:
          setErrorTable("Unknown table selection.");
          setLoadingTable(false);
          return;
      }

      try {
        const resp = await fetch(url);
        if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
        const data = await resp.json();
        console.log("raw data for", selectedTable, data);

        if (selectedTable === "skins") {
          // Expect { players: [...], holes: [...] }
          setTableData({
            players: Array.isArray(data.players) ? data.players : [],
            holes: Array.isArray(data.holes) ? data.holes : [],
          });
        } else {
          // Force an array for net/gross/teams/wgr—even if backend wrapped it in { something: […] }
          let arr = [];
          if (Array.isArray(data)) {
            arr = data;
          } else {
            // find the first array‐valued property:
            const candidates = Object.keys(data).filter((k) =>
              Array.isArray(data[k]),
            );
            if (candidates.length > 0) {
              arr = data[candidates[0]];
            } else {
              console.warn(
                `Unexpected JSON shape for "${selectedTable}". Falling back to empty array.`,
                data,
              );
              arr = [];
            }
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
  }, [selectedTable, eventID]);

  // 7) Helper to render each table by type
  const renderTable = () => {
    // A) If we’re actively fetching, show “Loading…”
    if (loadingTable) {
      return <p className="loading-text">Loading results…</p>;
    }
    // B) If there’s a fetch error, display it
    if (errorTable) {
      return <p className="error-text">{errorTable}</p>;
    }

    // C) Now decide by selectedTable. For each case:
    //    • If tableData is not yet in the correct shape, show “Loading” (or null)
    //    • Otherwise, .map over the array(s).

    if (selectedTable === "net") {
      // We expect tableData to be an Array of NetResult
      if (!Array.isArray(tableData)) {
        return <p className="loading-text">Loading results…</p>;
      }
      return (
        <table className="results-table net-table">
          <thead>
            <tr>
              <th>Rank</th>
              <th>Player</th>
              <th>Total</th>
              <th>Strokes</th>
              <th>Points</th>
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
      // We expect tableData to be an Array of GrossResult
      if (!Array.isArray(tableData)) {
        return <p className="loading-text">Loading results…</p>;
      }
      return (
        <table className="results-table gross-table">
          <thead>
            <tr>
              <th>Rank</th>
              <th>Player</th>
              <th>Total</th>
              <th>Strokes</th>
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
      // We expect tableData to be an Array of TeamResult
      if (!Array.isArray(tableData)) {
        return <p className="loading-text">Loading results…</p>;
      }

      // Determine whether ALL rows have a defined, non‐empty 'total'
      const hasTotalColumn = tableData.every(
        (row) =>
          row.total !== null && row.total !== undefined && row.total !== "",
      );

      return (
        <table className="results-table teams-table">
          <thead>
            <tr>
              <th>Rank</th>
              <th>Team</th>
              {hasTotalColumn && <th>Total</th>}
              <th>Strokes</th>
            </tr>
          </thead>
          <tbody>
            {tableData.length === 0 ? (
              <tr>
                {/* If no rows, colspan should match the number of rendered columns */}
                <td
                  colSpan={hasTotalColumn ? 4 : 3}
                  style={{ textAlign: "center" }}
                >
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
      // We expect tableData to be an Array of WGRResult
      if (!Array.isArray(tableData)) {
        return <p className="loading-text">Loading results…</p>;
      }
      return (
        <table className="results-table net-table">
          <thead>
            <tr>
              <th>Rank</th>
              <th>Player</th>
              <th>Total</th>
              <th>Strokes</th>
              <th>Points</th>
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
      // We expect tableData to be an object { players: Array, holes: Array }
      if (
        !tableData ||
        !Array.isArray(tableData.players) ||
        !Array.isArray(tableData.holes)
      ) {
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
                <th>Rank</th>
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
                <th>Hole</th>
                <th>Par</th>
                <th>Score</th>
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
                  src={`http://localhost:8080/events/${eventID}/thumbnail`}
                  alt={`${eventData.name} thumbnail`}
                  onError={(e) => {
                    e.currentTarget.onerror = null;
                    e.currentTarget.src = "/images/default-logo.png";
                  }}
                />
                <div className="event-info">
                  <div className="event-name">{eventData.name}</div>
                  <div className="event-meta">
                    {formatDateWithoutYear(eventData.date)} &nbsp;|&nbsp;{" "}
                    {eventData.course}
                    <br />
                    {eventData.town}, {eventData.state}
                  </div>
                  <div className="event-meta">
                    {eventData.handicapAllowance} Handicap Allowance
                  </div>
                </div>
              </div>
            </div>

            {/* ===== 2) Dropdown Selector ===== */}
            <div className="results-dropdown-container results-dropdown-width">
              <select
                id="results-select"
                className="results-dropdown schedule-dropdown"
                value={selectedTable}
                onChange={onSelectChange}
              >
                <option value="net">Net</option>
                <option value="gross">Gross</option>
                <option value="skins">Skins</option>
                <option value="teams">Teams</option>
                <option value="wgr">WGR</option>
              </select>
            </div>

            {/* ===== 3) Render the appropriate table(s) ===== */}
            <div className="results-table-container">{renderTable()}</div>
          </>
        )}
      </div>
    </div>
  );
}
