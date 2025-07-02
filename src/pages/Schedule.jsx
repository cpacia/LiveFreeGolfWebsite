import React, { useEffect, useState } from "react";
import { getImageUrl } from "../lib/api";
import "./Schedule.css";
import { Link } from "react-router-dom";

export default function Schedule() {
  const [years, setYears] = useState([]);
  const [season, setSeason] = useState(null);
  const [filter, setFilter] = useState("All");
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  // Format "2025-05-26" as "May 26"
  function formatDateWithoutYear(isoDateString) {
    const [year, month, day] = isoDateString.split("-").map(Number);
    const dt = new Date(year, month - 1, day);
    return dt.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  }

  function buildFetchUrl(year) {
    return year ? `/api/events?year=${year}` : "/api/events";
  }

  // Initial load
  useEffect(() => {
    setLoading(true);
    fetch(buildFetchUrl(null))
      .then((res) => res.json())
      .then((data) => {
        const allYears = [data.calendarYear, ...data.additionalYears];
        setYears(allYears);
        setSeason(data.calendarYear);
        setEvents(data.events);
      })
      .catch((err) => console.error("Failed to load events:", err))
      .finally(() => setLoading(false));
  }, []);

  // Load when season changes
  useEffect(() => {
    if (season == null) return;
    setLoading(true);
    fetch(buildFetchUrl(season))
      .then((res) => res.json())
      .then((data) => setEvents(data.events))
      .catch((err) =>
        console.error("Failed to load events for year", season, err),
      )
      .finally(() => setLoading(false));
  }, [season]);

  const filteredEvents = React.useMemo(() => {
    if (!events) return [];
    const now = new Date();
    return events
      .filter((evt) => {
        if (filter === "All") return true;
        if (filter === "Upcoming") {
          const evtDate = new Date(evt.date);
          return !evt.isComplete && evtDate >= now;
        }
        if (filter === "Completed") return evt.isComplete;
        return true;
      })
      .sort((a, b) => new Date(a.date) - new Date(b.date));
  }, [events, filter]);

  function onSeasonChange(e) {
    setSeason(parseInt(e.target.value, 10));
  }

  function onFilterChange(e) {
    setFilter(e.target.value);
  }

  return (
    <div className="schedule-container">
      <div className="filters">
        <label>
          <span className="visually-hidden">Season:</span>
          <select
            className="schedule-dropdown"
            value={season || ""}
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

      {season && <h2 className="season-header">{season} Season</h2>}
      {loading && <div className="loading">Loading events…</div>}

      {!loading && (
        <div className="schedule-events-list">
          {filteredEvents.length === 0 && (
            <div className="no-events">No events to display.</div>
          )}

          {filteredEvents.map((evt) => {
            // Compute date-only comparisons
            const now = new Date();
            now.setHours(0, 0, 0, 0);
            const [y, m, d] = evt.date.split("-").map(Number);
            const eventDay = new Date(y, m - 1, d);
            eventDay.setHours(0, 0, 0, 0);

            const weekFromNow = new Date(now);
            weekFromNow.setDate(weekFromNow.getDate() + 7);

            // Coerce registrationOpen to boolean
            const regOpen =
              typeof evt.registrationOpen === "boolean"
                ? evt.registrationOpen
                : evt.registrationOpen === "true";

            return (
              <div key={evt.eventID} className="schedule-event-item">
                <div className="event-left">
                  {evt.isComplete ? (
                    <div>
                      <img
                        className="thumbnail"
                        src={getImageUrl(
                          `/api/events/${evt.eventID}/thumbnail`,
                        )}
                        alt={`${evt.name} thumbnail`}
                        onError={(e) => {
                          e.currentTarget.onerror = null;
                          e.currentTarget.src = "/images/default-logo.png";
                        }}
                      />
                    </div>
                  ) : (
                    <div>
                      <Link
                        to={`/listing/${evt.shopifyUrl}`}
                        rel="noopener noreferrer"
                      >
                        <img
                          className="thumbnail"
                          src={getImageUrl(
                            `/api/events/${evt.eventID}/thumbnail`,
                          )}
                          alt={`${evt.name} thumbnail`}
                          onError={(e) => {
                            e.currentTarget.onerror = null;
                            e.currentTarget.src = "/images/default-logo.png";
                          }}
                        />
                      </Link>
                    </div>
                  )}
                  <div className="event-info">
                    {evt.isComplete ? (
                      <div className="event-name">{evt.name}</div>
                    ) : (
                      <div className="event-name">
                        <Link
                          to={`/listing/${evt.shopifyUrl}`}
                          rel="noopener noreferrer"
                        >
                          {evt.name}
                        </Link>
                      </div>
                    )}
                    <div className="event-meta">
                      {formatDateWithoutYear(evt.date)} &nbsp;|&nbsp;{" "}
                      {evt.course}
                      <br />
                      {evt.town}, {evt.state}
                    </div>
                    <div className="event-meta">
                      {evt.handicapAllowance} Handicap Allowance
                    </div>
                  </div>
                </div>

                <div className="event-right">
                  {evt.isComplete ? (
                    <div className="results-link">
                      <Link
                        to={`/results?eventID=${evt.eventID}`}
                        rel="noopener noreferrer"
                      >
                        Results
                      </Link>
                    </div>
                  ) : regOpen ? (
                    <div className="action-link">
                      <Link
                        to={`/listing/${evt.shopifyUrl}`}
                        rel="noopener noreferrer"
                      >
                        Register ▶
                      </Link>
                    </div>
                  ) : eventDay <= weekFromNow ? (
                    <span>Registration Closed</span>
                  ) : (
                    <span>Registering Soon</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
