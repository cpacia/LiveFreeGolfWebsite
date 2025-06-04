import React, { useState, useEffect } from 'react';
import './EventsAndRankingsSection.css';

export default function EventsAndRankingsSection() {
  const [events, setEvents] = useState([]);
  const [rankings, setRankings] = useState([]);

  useEffect(() => {
    // ─── “UPCOMING EVENTS” FETCH ────────────────────────────────────────────────
    fetch('http://localhost:8080/events')
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json();
      })
      .then((data) => {
        // The API returns an object:
        // {
        //   calendarYear: null,
        //   additionalYears: [],
        //   events: [
        //     {
        //       eventID: "abc123",
        //       date:    "2025-07-12",   // <-- ISO‐date string (YYYY‑MM‑DD)
        //       name:    "Summer Open",
        //       course:  "Willow Creek",
        //       town:    "...",
        //       state:   "...",
        //       handicapAllowance: "...",
        //       blueGolfUrl:       "...",
        //       shopifyUrl:        "...",
        //       thumbnail:         "...",
        //       registrationOpen:  true/false,
        //       isComplete:        true/false,
        //       netLeaderboardUrl: "...",
        //       grossLeaderboardUrl: "...",
        //       skinsLeaderboardUrl: "...",
        //       teamsLeaderboardUrl: "...",
        //       wgrLeaderboardUrl:  "...",
        //       CreatedAt: "...", UpdatedAt: "...", DeletedAt: null
        //     },
        //     // … more events …
        //   ]
        // }
        const rawEvents = Array.isArray(data.events) ? data.events : [];

        // Convert `date` string → Date object (at midnight)
        const withDateObj = rawEvents.map((e) => ({
          ...e,
          dateObj: new Date(e.date + 'T00:00:00'),
        }));

        // Filter out past events and sort by date ascending
        const today = new Date();
        const upcoming = withDateObj
          .filter((e) => e.dateObj >= today)
          .sort((a, b) => a.dateObj - b.dateObj)
          .slice(0, 3); // only take the next three

        setEvents(upcoming);
      })
      .catch((err) => {
        console.error('Failed to fetch events:', err);
        setEvents([]); // fallback to empty list
      });

    // ─── “WORLD GOLF RANKINGS” FETCH (unchanged) ─────────────────────────────────
    fetch('http://localhost:8080/standings')
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json();
      })
      .then((data) => {
        const rawWGR = Array.isArray(data.wgr) ? data.wgr : [];

        const parsed = rawWGR.map((p) => {
          // strip commas so parseFloat("1,100") → parseFloat("1100")
          const stripped = p.points.replace(/,/g, '');
          const numPoints = parseFloat(stripped) || 0;
          return {
            ID:             p.ID,
            eventID:        p.eventID,
            rank:           p.rank,
            player:         p.player,
            total:          p.total,
            strokes:        p.strokes,
            originalPoints: p.points,   // e.g. "1,100"
            numericPoints:  numPoints,  // e.g. 1100
            scorecardUrl:   p.scorecardUrl,
          };
        });

        const top7 = parsed
          .sort((a, b) => b.numericPoints - a.numericPoints)
          .slice(0, 7);

        setRankings(top7);
      })
      .catch((err) => {
        console.error('Failed to fetch WGR:', err);
        setRankings([]);
      });
  }, []);

  // Helper for converting a Date to { month: "MMM", day: D }
  const monthNames = ['JAN','FEB','MAR','APR','MAY','JUN','JUL','AUG','SEP','OCT','NOV','DEC'];
  const fmtBadge = (dateObj) => ({
    month: monthNames[dateObj.getMonth()],
    day:   dateObj.getDate(),
  });

  return (
    <section className="events-wgr-section">
      {/* ─── UPCOMING EVENTS PANEL ─────────────────────────────────────────────── */}
      <div className="panel events-panel">
        <h2>Upcoming Events</h2>
        <ul className="events-list">
          {events.map((e) => {
            const { month, day } = fmtBadge(e.dateObj);

            // Choose which URL to show as “Details”:
            // In this example, we link to e.blueGolfUrl (if it exists);
            // otherwise fallback to e.shopifyUrl. Adjust as needed.
            const detailsUrl = e.blueGolfUrl || e.shopifyUrl || '#';

            return (
              <li key={e.eventID} className="event-item">
                <div className="date-badge">
                  <div className="badge-text">
                    <span className="month">{month}</span>
                    <span className="day">{day}</span>
                  </div>
                </div>
                <div className="event-details">
                  <h3 className="event-title">{e.name}</h3>
                  <p className="event-course">{e.course}</p>
                  <a href={detailsUrl} className="event-link" target="_blank" rel="noopener noreferrer">
                    Details
                  </a>
                </div>
              </li>
            );
          })}
        </ul>
      </div>

      {/* ─── WGR PANEL ───────────────────────────────────────────────────────────── */}
      <div className="panel wgr-panel">
        <h2>World Golf Rankings</h2>
        <ul className="wgr-list">
          {rankings.map((p) => (
            <li key={p.ID} className="wgr-item">
              <span className="rank">{p.rank}</span>
              <span className="player-name">{p.player}</span>
              <span className="points">{p.originalPoints}</span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

