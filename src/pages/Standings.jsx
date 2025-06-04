import React, { useState, useEffect } from 'react';
import './Standings.css';

export default function Standings() {
  // Holds the JSON response:
  // {
  //   calendarYear: "2025",
  //   additionalYears: ["2024", "2023", …],
  //   season: [ { year, player, rank, events, points }, … ],
  //   wgr: [ { year, player, rank, events, points }, … ]
  // }
  const [calendarYear, setCalendarYear] = useState('');
  const [additionalYears, setAdditionalYears] = useState([]);
  const [seasonData, setSeasonData] = useState([]);
  const [wgrData, setWgrData] = useState([]);
  const [activeTab, setActiveTab] = useState('season'); // 'season' or 'wgr'
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch for a given year (or current if yearParam is null/empty)
  const fetchStandings = async (yearParam = '') => {
    setLoading(true);
    setError(null);
    try {
      const url = yearParam
        ? `http://localhost:8080/standings?year=${yearParam}`
        : `http://localhost:8080/standings`;
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
      setError('Failed to load standings.');
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

  // Choose which data to render in the table
  const tableRows = activeTab === 'season' ? seasonData : wgrData;

  // Column headers are always: Rank, Player, Events, Points
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
              className={`tab ${activeTab === 'season' ? 'tab-active' : ''}`}
              onClick={() => handleTabClick('season')}
            >
              Season Standings
            </button>
            <button
              className={`tab ${activeTab === 'wgr' ? 'tab-active' : ''}`}
              onClick={() => handleTabClick('wgr')}
            >
              World Golf Rankings
            </button>
          </div>

          {/* 2) Heading for the current calendar year */}
          <h2 className="standings-year-heading">
            {calendarYear}{' '}
            {activeTab === 'season'
              ? 'Season Standings'
              : 'World Golf Rankings'}
          </h2>

          {/* 3) Blurb/about text */}
          <p className="standings-blurb">
            {activeTab === 'season' ? (
              <>Players earn points toward the season standings based on how they finish in each event. Only each player’s top six point results will count toward their total, so consistent high finishes are crucial. For a full breakdown of how points are awarded, see the <a href="http://localhost:5173/tour-details#points">Point System</a>.</>
            ) : (
              <>The World Golf Rankings use a different points system than the season standings. Players are ranked based on their results from the last two seasons, with a 70% handicap allowance applied to each event score. </>
            )}
          </p>

          {/* 4) Table */}
          <table className="standings-table">
            <thead>
              <tr>
                <th>Rank</th>
                <th>Player</th>
                <th>Events</th>
                <th>Points</th>
              </tr>
            </thead>
            <tbody>
              {tableRows.length === 0 ? (
                <tr>
                  <td colSpan="4" style={{ textAlign: 'center' }}>
                    No data available.
                  </td>
                </tr>
              ) : (
                tableRows.map((row, idx) => (
                  <tr key={idx}>
                    <td>{row.rank}</td>
                    <td>{row.player}</td>
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
					<a href={`?year=${yr}`}>{yr}</a>
				  )}
				</React.Fragment>
			  ))}
			</div>
        </>
      )}
    </div>
    </div>
  );
}

