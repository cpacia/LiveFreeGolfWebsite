import React, { useState, useEffect } from 'react';
import './EventsAndRankingsSection.css';

export default function EventsAndRankingsSection() {
  const [events, setEvents] = useState([]);
  const [rankings, setRankings] = useState([]);

  useEffect(() => {
    // (1) Fetch upcoming events (unchanged)
    fetch('/events.json')
      .then(res => res.json())
      .then(all => {
        const today = new Date();
        const upcoming = all
          .map(e => ({ ...e, dateObj: new Date(e.date + 'T00:00:00') }))
          .filter(e => e.dateObj >= today)
          .sort((a, b) => a.dateObj - b.dateObj)
          .slice(0, 3);
        setEvents(upcoming);
      })
      .catch(console.error);

    // (2) Fetch world golf rankings from our updated /standings endpoint
    fetch('http://localhost:8080/standings')
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json();
      })
      .then((data) => {
        // The API returns an object shaped like:
        // {
        //   calendarYear: null,
        //   additionalYears: [],
        //   season: [],
        //   wgr: [ { eventID, rank, player, total, strokes, points, scorecardUrl, … }, … ]
        // }
        const rawWGR = Array.isArray(data.wgr) ? data.wgr : [];

        const parsed = rawWGR.map((p) => {
          const stripped = p.points.replace(/,/g, '');                // "1,100" → "1100"
          const numPoints = parseFloat(stripped) || 0;                 // 1100
          return {
            ID:             p.ID,
            eventID:        p.eventID,
            rank:           p.rank,
            player:         p.player,
            total:          p.total,
            strokes:        p.strokes,
            originalPoints: p.points,     // keep "1,100" for display
            numericPoints:  numPoints,    // use 1100 for sorting
            scorecardUrl:   p.scorecardUrl,
          };
        });
        
        // Sort by descending points and take top 7
        const top7 = parsed
          .sort((a, b) => b.points - a.points)
          .slice(0, 7);

        setRankings(top7);
      })
      .catch((err) => {
        console.error('Failed to fetch WGR:', err);
        setRankings([]);
      });
  }, []);

  // Helper: format month/day badge
  const monthNames = ['JAN','FEB','MAR','APR','MAY','JUN','JUL','AUG','SEP','OCT','NOV','DEC'];
  const fmtBadge = dateObj => ({
    month: monthNames[dateObj.getMonth()],
    day: dateObj.getDate()
  });

  return (
    <section className="events-wgr-section">
      {/* Upcoming Events Panel */}
      <div className="panel events-panel">
        <h2>Upcoming Events</h2>
        <ul className="events-list">
          {events.map((e) => {
            const { month, day } = fmtBadge(e.dateObj);
            return (
              <li key={e.id} className="event-item">
                <div className="date-badge">
                  <div className="badge-text">
                    <span className="month">{month}</span>
                    <span className="day">{day}</span>
                  </div>
                </div>
                <div className="event-details">
                  <h3 className="event-title">{e.name}</h3>
                  <p className="event-course">{e.course}</p>
                  <a href={e.registrationUrl} className="event-link">
                    Details
                  </a>
                </div>
              </li>
            );
          })}
        </ul>
      </div>

      {/* WGR Panel */}
      <div className="panel wgr-panel">
        <h2>World Golf Rankings</h2>
        <ul className="wgr-list">
          {rankings.map((p) => (
            <li key={p.ID} className="wgr-item">
              <span className="rank">{p.rank}</span>
              <span className="player-name">{p.player}</span>
              {/* Show the original string (e.g. “1,100”) rather than forcing decimals */}
              <span className="points">{p.originalPoints}</span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

