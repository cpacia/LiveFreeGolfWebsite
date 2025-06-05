// src/components/Schedule.jsx

import React, { useEffect, useState } from 'react';
import './Schedule.css';

export default function Schedule() {
  const [years, setYears] = useState([]);              // e.g. [2025, 2024, 2023, …]
  const [season, setSeason] = useState(null);          // e.g. 2025
  const [filter, setFilter] = useState('All');         // 'All' | 'Upcoming' | 'Completed'
  const [events, setEvents] = useState([]);            // raw array of Event objects
  const [loading, setLoading] = useState(true);
  
    // ─────── New: helper to format "2025-05-26" as "May 26" ───────
 function formatDateWithoutYear(isoDateString) {
   // Parse the ISO date string (e.g. "2025-05-26")
   const dt = new Date(isoDateString);
   // Use toLocaleDateString to get "May 26"
   return dt.toLocaleDateString('en-US', {
     month: 'short',
     day: 'numeric'
   });
 }


  // Helper: build the URL for a given year (or none for the “current”)
  function buildFetchUrl(year) {
    if (!year) {
      return 'http://localhost:8080/events';
    }
    return `http://localhost:8080/events?year=${year}`;
  }

  // Fetch “current year” on mount
  useEffect(() => {
    setLoading(true);
    fetch(buildFetchUrl(null))
      .then(res => res.json())
      .then(data => {
        // data = { calendarYear: number, additionalYears: number[], events: Event[] }
        const allYears = [data.calendarYear, ...data.additionalYears];
        setYears(allYears);
        setSeason(data.calendarYear);
        setEvents(data.events);
      })
      .catch(err => {
        console.error('Failed to load events:', err);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  // Whenever “season” changes, re‐fetch that year
  useEffect(() => {
    if (season == null) return;
    setLoading(true);
    fetch(buildFetchUrl(season))
      .then(res => res.json())
      .then(data => {
        setEvents(data.events);
      })
      .catch(err => {
        console.error('Failed to load events for year', season, err);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [season]);

  // Compute filtered + sorted events
  const filteredEvents = React.useMemo(() => {
    if (!events) return [];
    const now = new Date();

    // Filter by “All” / “Upcoming” / “Completed”
    let subset = events.filter(evt => {
      if (filter === 'All') return true;
      if (filter === 'Upcoming') {
        // Upcoming = not complete AND event date is >= today
        const evtDate = new Date(evt.date);
        return !evt.isComplete && evtDate >= now;
      }
      if (filter === 'Completed') {
        return evt.isComplete;
      }
      return true;
    });

    // Sort ascending by date
    subset.sort((a, b) => {
      const da = new Date(a.date);
      const db = new Date(b.date);
      return da - db;
    });

    return subset;
  }, [events, filter]);

  // Handler for when user picks a different season
  function onSeasonChange(e) {
    const y = parseInt(e.target.value, 10);
    setSeason(y);
  }

  // Handler for when user picks All / Upcoming / Completed
  function onFilterChange(e) {
    setFilter(e.target.value);
  }

  return (
    <div className="schedule-container">
      {/* ─────── Filters ─────── */}
      <div className="filters">
        <label>
          <span className="visually-hidden">Season:</span>
          <select
            className="schedule-dropdown"
            value={season || ''}
            onChange={onSeasonChange}
          >
            {years.map((y) => (
              <option key={y} value={y}>
                {y}
              </option>
            ))}
          </select>
        </label>

        <label>
          <span className="visually-hidden">View:</span>
          <select
            className="schedule-dropdown"
            value={filter}
            onChange={onFilterChange}
          >
            <option value="All">All</option>
            <option value="Upcoming">Upcoming</option>
            <option value="Completed">Completed</option>
          </select>
        </label>
      </div>

      {/* ─────── Season Header ─────── */}
      {season && <h2 className="season-header">{season} Season</h2>}

      {/* ─────── Loading State ─────── */}
      {loading && <div className="loading">Loading events…</div>}

      {/* ─────── Event List ─────── */}
      {!loading && (
        <div className="schedule-events-list">
          {filteredEvents.length === 0 && (
            <div className="no-events">No events to display.</div>
          )}

          {filteredEvents.map((evt) => (
            <div key={evt.eventID} className="schedule-event-item">
              {/* ─────── Left Side: Thumbnail + Basic Info ─────── */}
              <div className="event-left">
                <img
                  className="thumbnail"
                  src={`http://localhost:8080/events/${evt.eventID}/thumbnail`}
                  alt={`${evt.name} thumbnail`}
                  onError={(e) => {
                    // Remove this handler so we don't loop if default-logo.png also fails
                    e.currentTarget.onerror = null;
                    // Fallback to our local default logo
                    e.currentTarget.src = '/images/default-logo.png';
                  }}
                />

                <div className="event-info">
                  <div className="event-name"><a href={evt.blueGolfUrl} target="_blank" rel="noopener noreferrer">
						{evt.name}
					  </a></div>
                  <div className="event-meta">
                    {formatDateWithoutYear(evt.date)} &nbsp;|&nbsp; {evt.course}
                    <br />
                    {evt.town}, {evt.state}
                  </div>
                  <div className="event-meta">
                    {evt.handicapAllowance} Handicap Allowance
                  </div>
                </div>
              </div>

              {/* ─────── Right Side: Handicap + Conditional Link ─────── */}
              <div className="event-right">
                {evt.isComplete ? (
                  // If event is complete, link to “Results”
                  <div className="results-link">
                    <a
                      href={`/results?eventID=${evt.eventID}`}
                      rel="noopener noreferrer"
                    >
                      Results
                    </a>
                  </div>
                ) : evt.registrationOpen ? (
                  // Not complete + registration is open → “Register”
                  <div className="action-link">
                    <a
                      href={evt.shopifyUrl || evt.blueGolfUrl || '#'}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      Register ▶
                    </a>
                  </div>
                ) : (
                  // Not complete + registration not open → “Registering Soon”
                  <span>Registering Soon</span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

