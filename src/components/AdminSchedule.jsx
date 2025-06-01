// AdminSchedule.jsx
import React, { useState, useEffect } from 'react';
import './AdminSchedule.css';

export default function AdminSchedule() {
  // 1) Local state for our fetched events and loading/errors
  const [events, setEvents] = useState([]);     // array of Event objects
  const [loading, setLoading] = useState(true); // true while fetch is in progress
  const [error, setError] = useState(null);     // if something goes wrong

  // 2) Fetch data once on mount
  useEffect(() => {
    fetch('http://localhost:8080/events')
      .then((res) => {
        if (!res.ok) {
          throw new Error(`HTTP ${res.status} – ${res.statusText}`);
        }
        return res.json();
      })
      .then((data) => {
        // The API shape is: { calendarYear: ..., additionalYears: [...], events: [ ... ] }
        if (Array.isArray(data.events)) {
          setEvents(data.events);
        } else {
          console.warn('Unexpected payload shape:', data);
          setEvents([]);
        }
      })
      .catch((err) => {
        console.error('Failed to fetch events:', err);
        setError(err.message || 'Unknown error');
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  // 3) Render loading or error states
  if (loading) {
    return (
      <div className="schedule-header">
        <h1>Schedule – 2025</h1>
        <button className="btn-add-event">Add Event</button>
        <p>Loading events…</p>
      </div>
    );
  }
  if (error) {
    return (
      <div className="schedule-header">
        <h1>Schedule – 2025</h1>
        <button className="btn-add-event">Add Event</button>
        <p style={{ color: 'red' }}>Error loading events: {error}</p>
      </div>
    );
  }

  // 4) Once data is loaded, map over events to render a “card‑table” each
  return (
    <>
      {/* Page header w/ title + Add Event button */}
      <div className="schedule-header">
        <h1>Schedule – 2025</h1>
        <button className="btn-add-event">Add Event</button>
      </div>

      {events.length === 0 ? (
        <p>No events found for this year.</p>
      ) : (
        events.map((evt) => (
          <div className="card-table-container" key={evt.eventID}>
            {/* 1) Green header bar showing the event’s name */}
            <div className="card-table-header">{evt.name}</div>

            {/* 2) Table of event details (5 rows) */}
            <table className="event-table">
              <tbody>
                {/* Row 1: Date | Registration Open | Skins URL | Buttons */}
                <tr>
                  <td className="cell-image" rowSpan="5">
                    <img
                      src={evt.thumbnail || '/images/default-image.webp'}
                      alt={`${evt.name} thumbnail`}
                      className="event-thumbnail"
                    />
                  </td>

                  <td className="cell-label">Date</td>
                  <td className="cell-value">{evt.date || evt.dateString}</td>

                  <td className="cell-label">Registration</td>
                  <td className={`cell-value ${
                    evt.registrationOpen ? 'status-open' : 'status-closed'
                  }`}>
                    {evt.registrationOpen ? 'Open' : 'Closed'}
                  </td>

                  <td className="cell-label">Skins URL</td>
                  <td className="cell-value">
                    {evt.skinsLeaderboardUrl ? (
                      <a
                        href={evt.skinsLeaderboardUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        {stripProtocol(evt.skinsLeaderboardUrl)}
                      </a>
                    ) : (
                      '—'
                    )}
                  </td>

                  <td className="cell-actions" rowSpan="5">
                    <button className="btn-edit">Edit</button>
                    <button className="btn-delete">Delete</button>
                  </td>
                </tr>

                {/* Row 2: Course | Complete | Teams URL */}
                <tr>
                  <td className="cell-label">Course</td>
                  <td className="cell-value">{evt.course || '—'}</td>

                  <td className="cell-label">Complete</td>
                  <td className={`cell-value ${
                    evt.isComplete ? 'status-open' : 'status-closed'
                  }`}>
                    {evt.isComplete ? 'Yes' : 'No'}
                  </td>

                  <td className="cell-label">Teams URL</td>
                  <td className="cell-value">
                    {evt.teamsLeaderboardUrl ? (
                      <a
                        href={evt.teamsLeaderboardUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        {stripProtocol(evt.teamsLeaderboardUrl)}
                      </a>
                    ) : (
                      '—'
                    )}
                  </td>
                </tr>

                {/* Row 3: Town | BlueGolf URL | WGR URL */}
                <tr>
                  <td className="cell-label">Town</td>
                  <td className="cell-value">{evt.town || '—'}</td>

                  <td className="cell-label">BlueGolf URL</td>
                  <td className="cell-value">
                    {evt.blueGolfUrl ? (
                      <a
                        href={evt.blueGolfUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        {stripProtocol(evt.blueGolfUrl)}
                      </a>
                    ) : (
                      '—'
                    )}
                  </td>

                  <td className="cell-label">WGR URL</td>
                  <td className="cell-value">
                    {evt.wgrLeaderboardUrl ? (
                      <a
                        href={evt.wgrLeaderboardUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        {stripProtocol(evt.wgrLeaderboardUrl)}
                      </a>
                    ) : (
                      '—'
                    )}
                  </td>
                </tr>

                {/* Row 4: State | Net URL */}
                <tr>
                  <td className="cell-label">State</td>
                  <td className="cell-value">{evt.state || '—'}</td>

                  <td className="cell-label">Net URL</td>
                  <td className="cell-value">
                    {evt.netLeaderboardUrl ? (
                      <a
                        href={evt.netLeaderboardUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        {stripProtocol(evt.netLeaderboardUrl)}
                      </a>
                    ) : (
                      '—'
                    )}
                  </td>

                  <td className="cell-label">&nbsp;</td>
                  <td className="cell-value">&nbsp;</td>
                </tr>

                {/* Row 5: Handicap | Gross URL */}
                <tr>
                  <td className="cell-label">Handicap</td>
                  <td className="cell-value">{evt.handicapAllowance || '–'}</td>

                  <td className="cell-label">Gross URL</td>
                  <td className="cell-value">
                    {evt.grossLeaderboardUrl ? (
                      <a
                        href={evt.grossLeaderboardUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        {stripProtocol(evt.grossLeaderboardUrl)}
                      </a>
                    ) : (
                      '—'
                    )}
                  </td>

                  <td className="cell-label">&nbsp;</td>
                  <td className="cell-value">&nbsp;</td>
                </tr>
              </tbody>
            </table>
          </div>
        ))
      )}
    </>
  );
}

/**
 * Utility: strip “http://” or “https://” so that link text reads more compactly.
 */
function stripProtocol(url) {
  return url.replace(/^https?:\/\//, '');
}


