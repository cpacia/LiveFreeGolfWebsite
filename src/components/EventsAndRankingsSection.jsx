import React, { useState, useEffect } from 'react';
import './EventsAndRankingsSection.css';

export default function EventsAndRankingsSection() {
  const [events, setEvents] = useState([]);
  const [rankings, setRankings] = useState([]);

  useEffect(() => {
    // Fetch upcoming events
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

    // Fetch world golf rankings
    fetch('/wgr-rankings.json')
      .then(res => res.json())
      .then(all => {
        const top = all
          .sort((a, b) => a.points - b.points)
          .reverse()
          .slice(0, 7);
        setRankings(top);
      })
      .catch(console.error);
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
          {rankings.map((p, i) => (
            <li key={p.id || p.name} className="wgr-item">
              <span className="rank">{p.rank}</span>
              <span className="player-name">{p.name}</span>
              <span className="points">{p.points}</span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

