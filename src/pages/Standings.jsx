import React, { useState, useEffect } from "react";
import "./Standings.css";
import { Link } from "react-router-dom";
import { format, parseISO } from "date-fns";

export default function Standings() {
  // Holds the JSON response:
  // {
  //   calendarYear: "2025",
  //   additionalYears: ["2024", "2023", …],
  //   season: [ { year, player, user, rank, events, points }, … ],
  //   wgr:    [ { year, player, user, rank, events, points }, … ]
  // }
  const [calendarYear, setCalendarYear] = useState("");
  const [additionalYears, setAdditionalYears] = useState([]);
  const [seasonData, setSeasonData] = useState([]);
  const [wgrData, setWgrData] = useState([]);
  const [activeTab, setActiveTab] = useState("season"); // 'season' or 'wgr'
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Modal state
  const [modalOpen, setModalOpen] = useState(false);
  const [modalLoading, setModalLoading] = useState(false);
  const [modalError, setModalError] = useState(null);
  const [modalTitle, setModalTitle] = useState("");
  const [modalRows, setModalRows] = useState([]); // [{ date, usedInCalc, scores, name, lscore, place }]

  // Fetch for a given year (or current if yearParam is null/empty)
  const fetchStandings = async (yearParam = "") => {
    setLoading(true);
    setError(null);
    try {
      const url = yearParam
        ? `/api/standings?year=${yearParam}`
        : `/api/standings`;
      const resp = await fetch(url);
      if (!resp.ok) {
        throw new Error(`HTTP ${resp.status}`);
      }
      const data = await resp.json();
      // data.calendarYear, data.additionalYears, data.season, data.wgr
      setCalendarYear(data.calendarYear);
      setAdditionalYears(data.additionalYears || []);
      setSeasonData(data.season || []);
      setWgrData(data.wgr || []);
    } catch (e) {
      console.error(e);
      setError("Failed to load standings.");
    } finally {
      setLoading(false);
    }
  };

  // On mount, load current‐year standings
  useEffect(() => {
    fetchStandings();
  }, []);

  // Handler: when user clicks a different year
  const handleYearClick = (year) => {
    if (year === calendarYear) return;
    fetchStandings(year);
  };

  // Handler: switch tabs
  const handleTabClick = (tab) => {
    setActiveTab(tab);
  };

  // When a player's name is clicked
  const handlePlayerClick = async (row) => {
    // Expect `row.user` to exist per new API shape
    if (!row || !row.user) return;
    setModalTitle(
      `${row.player} — ${activeTab === "season" ? "Season" : "WGR"} Results`,
    );
    setModalRows([]);
    setModalError(null);
    setModalLoading(true);
    setModalOpen(true);
    try {
      const endpoint = `/api/standings-data/${activeTab}/${encodeURIComponent(row.player)}?year=${encodeURIComponent(calendarYear)}`;
      const resp = await fetch(endpoint);
      if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
      const data = await resp.json();
      setModalRows(Array.isArray(data) ? data : []);
    } catch (e) {
      console.error(e);
      setModalError("Failed to load player details.");
    } finally {
      setModalLoading(false);
    }
  };

  // Choose which data to render in the table
  const tableRows = activeTab === "season" ? seasonData : wgrData;

  return (
    <div className="full-bleed standings-content">
      <div className="content-container">
        {loading && <p className="loading-text">Loading…</p>}
        {error && <p className="error-text">{error}</p>}
        {!loading && !error && (
          <>
            {/* 1) Tabs */}
            <div className="standings-tabs">
              <button
                className={`tab ${activeTab === "season" ? "tab-active" : ""}`}
                onClick={() => handleTabClick("season")}
              >
                Season Standings
              </button>
              <button
                className={`tab ${activeTab === "wgr" ? "tab-active" : ""}`}
                onClick={() => handleTabClick("wgr")}
              >
                World Golf Rankings
              </button>
            </div>

            {/* 2) Heading for the current calendar year */}
            <h2 className="standings-year-heading">
              {calendarYear}{" "}
              {activeTab === "season"
                ? "Season Standings"
                : "World Golf Rankings"}
            </h2>

            {/* 3) Blurb/about text */}
            <p className="standings-blurb">
              {activeTab === "season" ? (
                <>
                  Players earn points toward the season standings based on how
                  they finish in each event. Only each player’s top six point
                  results will count toward their total, so consistent high
                  finishes are crucial. For a full breakdown of how points are
                  awarded, see the{" "}
                  <Link to="/tour-details#points">Point System</Link>.
                </>
              ) : (
                <>
                  The World Golf Rankings use a different points system than the
                  season standings. Players are ranked based on their results
                  from the last two seasons, with typically a 60% handicap
                  allowance applied to each event score.{" "}
                </>
              )}
            </p>

            {/* 4) Table */}
            <table className="standings-table">
              <thead>
                <tr>
                  <th>
                    <span className="full-header">Rank</span>
                    <span className="abbr-header">Rk</span>
                  </th>
                  <th>Player</th>
                  <th>
                    <span className="full-header">Events</span>
                    <span className="abbr-header">Evts</span>
                  </th>
                  <th>
                    <span className="full-header">Points</span>
                    <span className="abbr-header">Pts</span>
                  </th>
                </tr>
              </thead>
              <tbody>
                {tableRows.length === 0 ? (
                  <tr>
                    <td colSpan="4" style={{ textAlign: "center" }}>
                      No data available.
                    </td>
                  </tr>
                ) : (
                  tableRows.map((row, idx) => (
                    <tr key={idx}>
                      <td>{row.rank}</td>
                      <td>
                        {/* Name becomes a hyperlink-like button that triggers the modal fetch */}
                        <button
                          className="link-button"
                          onClick={() => handlePlayerClick(row)}
                          title={`View ${row.player} details`}
                        >
                          {row.player}
                        </button>
                      </td>
                      <td>{row.events}</td>
                      <td>{row.points}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>

            {/* 5) Year links (re-styled using the existing “season-links” CSS) */}
            <div className="season-links">
              {[calendarYear, ...additionalYears].map((yr, idx) => (
                <React.Fragment key={yr}>
                  {idx > 0 && <>|&nbsp;</>}
                  {yr === calendarYear ? (
                    <span className="current-year">{yr}</span>
                  ) : (
                    <Link
                      to={`?year=${yr}`}
                      onClick={(e) => {
                        e.preventDefault();
                        handleYearClick(yr);
                      }}
                    >
                      {yr}
                    </Link>
                  )}
                </React.Fragment>
              ))}
            </div>
          </>
        )}
      </div>

      {/* Modal for player details */}
      {modalOpen && (
        <div className="modal-backdrop" onClick={() => setModalOpen(false)}>
          <div
            className="modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="player-details-title"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-header">
              <h3 id="player-details-title">{modalTitle}</h3>
              <button
                className="modal-close"
                onClick={() => setModalOpen(false)}
                aria-label="Close"
              >
                ×
              </button>
            </div>
            <div className="modal-body">
              {modalLoading && <p className="loading-text">Loading…</p>}
              {modalError && <p className="error-text">{modalError}</p>}
              {!modalLoading && !modalError && (
                <table className="modal-table details-table">
                  <thead>
                    <tr>
                      <th>
                        <span className="full-header">Date</span>
                        <span className="abbr-header">Date</span>
                      </th>
                      <th>{/* blank column for * */}</th>
                      <th>
                        <span className="full-header">Tournament</span>
                        <span className="abbr-header">Tourn</span>
                      </th>
                      <th>
                        <span className="full-header">Score</span>
                        <span className="abbr-header">Scr</span>
                      </th>
                      <th>
                        <span className="full-header">Place</span>
                        <span className="abbr-header">Pl</span>
                      </th>
                      <th>
                        <span className="full-header">Points</span>
                        <span className="abbr-header">Pts</span>
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {modalRows.length === 0 ? (
                      <tr>
                        <td colSpan="6" style={{ textAlign: "center" }}>
                          No results.
                        </td>
                      </tr>
                    ) : (
                      modalRows.map((r, i) => (
                        <tr key={i}>
                          <td>{format(parseISO(r.date), "MMM d")}</td>
                          <td>{r.usedInCalc ? "*" : ""}</td>
                          <td>{r.name}</td>
                          <td>{r.score}</td>
                          <td>{r.place}</td>
                          <td>{r.points}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
