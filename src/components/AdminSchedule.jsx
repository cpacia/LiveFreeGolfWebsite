// AdminSchedule.jsx
import React, { useState, useEffect, useRef } from 'react';
import './AdminSchedule.css';

export default function AdminSchedule() {
  // 1) State for list of events, loading/error, and inline editing
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // editingId = eventID of the row currently being edited (or null if none)
  const [editingId, setEditingId] = useState(null);

  // draftEvent holds the temporary edited values when editingId !== null
  const [draftEvent, setDraftEvent] = useState(null);

  // thumbnailFile holds the File object selected by the user (if any) during edit
  const [thumbnailFile, setThumbnailFile] = useState(null);

  // For triggering the hidden file input click
  const fileInputRef = useRef();

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
        // The API returns { calendarYear: ..., additionalYears: [...], events: [...] }
        if (Array.isArray(data.events)) {
          setEvents(data.events);
        } else {
          console.warn('Unexpected payload:', data);
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

  // 3) Loading / Error UI
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

  // 4) Helper to strip protocol for display
  function stripProtocol(url) {
    return url.replace(/^https?:\/\//, '');
  }

  // 5) Handler for when user selects a new thumbnail file
  const handleThumbnailChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setThumbnailFile(file);

      // Create a temporary preview URL and store it in draftEvent.thumbnail for immediate preview
      const previewURL = URL.createObjectURL(file);
      setDraftEvent((prev) => ({
        ...prev,
        thumbnail: previewURL,
      }));
    }
  };

  // 6) Render the list of event “card‐tables”
  return (
    <>
      {/* Page header */}
      <div className="schedule-header">
        <h1>Schedule – 2025</h1>
        <button className="btn-add-event">Add Event</button>
      </div>

      {events.length === 0 ? (
        <p>No events found for this year.</p>
      ) : (
        events.map((evt) => {
          const isEditing = editingId === evt.eventID;

          return (
            <div
              className={`card-table-container ${isEditing ? 'editing' : ''}`}
              key={evt.eventID}
            >
              {/* ───────────────────────────────────────────────────────
                  1) HEADER BAR: Event Name or Editable Input
              ─────────────────────────────────────────────────────── */}
              {isEditing ? (
                <input
                  type="text"
                  className="header-input"
                  value={draftEvent.name}
                  onChange={(e) =>
                    setDraftEvent({ ...draftEvent, name: e.target.value })
                  }
                />
              ) : (
                <div className="card-table-header">{evt.name}</div>
              )}

              {/* ───────────────────────────────────────────────────────
                  2) EVENT DETAILS TABLE (5 rows) 
              ─────────────────────────────────────────────────────── */}
              <table className="event-table">
                <tbody>
                  {/* Row 1: Date | Registration | Skins URL | Buttons */}
                  <tr>
                    {/* Column 1: Thumbnail (spans 5 rows) */}
                    <td className="cell-image" rowSpan="5">
                      {isEditing ? (
                        <>
                          {/* Show preview (or existing) and allow click to open file picker */}
                          <img
                            src={
                              draftEvent.thumbnail ||
                              '/images/default-image.webp'
                            }
                            alt={`${draftEvent.name} thumbnail`}
                            className="event-thumbnail clickable-image"
                            onClick={() => fileInputRef.current.click()}
                          />
                          {/* Hidden file input */}
                          <input
                            type="file"
                            accept="image/*"
                            style={{ display: 'none' }}
                            ref={fileInputRef}
                            onChange={handleThumbnailChange}
                          />
                        </>
                      ) : (
                        <img
                          src={"http://localhost:8080/events/"+evt.eventID+"/thumbnail" || '/images/default-image.webp'}
                          alt={`${evt.name} thumbnail`}
                          className="event-thumbnail"
                        />
                      )}
                    </td>

                    {/* Date */}
                    <td className="cell-label">Date</td>
                    <td className="cell-value">
                      {isEditing ? (
                        <input
                          type="date"
                          value={draftEvent.date}
                          onChange={(e) =>
                            setDraftEvent({
                              ...draftEvent,
                              date: e.target.value,
                            })
                          }
                        />
                      ) : (
                        evt.date
                      )}
                    </td>

                    {/* Registration */}
                    <td className="cell-label">Registration</td>
                    <td className="cell-value">
                      {isEditing ? (
                        <select
                          value={draftEvent.registrationOpen ? 'open' : 'closed'}
                          onChange={(e) =>
                            setDraftEvent({
                              ...draftEvent,
                              registrationOpen: e.target.value === 'open',
                            })
                          }
                        >
                          <option value="open">Open</option>
                          <option value="closed">Closed</option>
                        </select>
                      ) : evt.registrationOpen ? (
                        <span className="status-open">Open</span>
                      ) : (
                        <span className="status-closed">Closed</span>
                      )}
                    </td>

                    {/* Skins URL */}
                    <td className="cell-label">Skins URL</td>
                    <td className="cell-value">
                      {isEditing ? (
                        <input
                          type="text"
                          className="url-input"
                          value={draftEvent.skinsLeaderboardUrl || ''}
                          onChange={(e) =>
                            setDraftEvent({
                              ...draftEvent,
                              skinsLeaderboardUrl: e.target.value,
                            })
                          }
                        />
                      ) : evt.skinsLeaderboardUrl ? (
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

                    {/* Column 4: Edit/Save/Cancel & Delete (spans 5 rows) */}
                    <td className="cell-actions" rowSpan="5">
                      {isEditing ? (
                        <>
                          <button
                            className="btn-save"
                            onClick={() => {
                              // 1) Send PUT to API using FormData with both "event" and "thumbnail"
                              const form = new FormData();
                              // Append JSON under key "event"
                              const eventCopy = { ...draftEvent };
                              // We don't want to send the preview URL as thumbnail
                              delete eventCopy.thumbnail;
                              form.append('event', JSON.stringify(eventCopy));
                              // If user selected a new file, append under key "thumbnail"
                              if (thumbnailFile) {
                                form.append('thumbnail', thumbnailFile);
                              }

                              fetch(
                                `http://localhost:8080/events/${draftEvent.eventID}`,
                                {
                                  method: 'PUT',
                                  credentials: 'include',
                                  body: form,
                                }
                              )
                                .then((res) => {
                                  if (!res.ok) {
                                    throw new Error(`HTTP ${res.status}`);
                                  }
                                  return res.json();
                                })
                                .then((updatedEvt) => {
                                  // 2) Merge updatedEvt into local events array
                                  setEvents((prev) =>
                                    prev.map((e) =>
                                      e.eventID === updatedEvt.eventID
                                        ? {
                                            ...updatedEvt,
                                            date:
                                              updatedEvt.date || '',
                                          }
                                        : e
                                    )
                                  );
                                  // 3) Exit edit mode and reset thumbnailFile
                                  setEditingId(null);
                                  setDraftEvent(null);
                                  setThumbnailFile(null);
                                })
                                .catch((err) => {
                                  console.error('Save failed:', err);
                                  // Optionally show an error message
                                });
                            }}
                          >
                            Save
                          </button>
                          <button
                            className="btn-cancel"
                            onClick={() => {
                              setEditingId(null);
                              setDraftEvent(null);
                              setThumbnailFile(null);
                            }}
                          >
                            Cancel
                          </button>
                        </>
                      ) : (
                        <button
                          className="btn-edit"
                          onClick={() => {
                            setEditingId(evt.eventID);
                            setDraftEvent({ ...evt, date: evt.date });
                          }}
                        >
                          Edit
                        </button>
                      )}
                    </td>
                  </tr>

                  {/* Row 2: Course | Complete | Teams URL */}
                  <tr>
                    <td className="cell-label">Course</td>
                    <td className="cell-value">
                      {isEditing ? (
                        <input
                          type="text"
                          value={draftEvent.course || ''}
                          onChange={(e) =>
                            setDraftEvent({ ...draftEvent, course: e.target.value })
                          }
                          className="cell-input"
                        />
                      ) : (
                        evt.course || '—'
                      )}
                    </td>

                    <td className="cell-label">Complete</td>
                    <td className="cell-value">
                      {isEditing ? (
                        <select
                          value={draftEvent.isComplete ? 'yes' : 'no'}
                          onChange={(e) =>
                            setDraftEvent({
                              ...draftEvent,
                              isComplete: e.target.value === 'yes',
                            })
                          }
                        >
                          <option value="yes">Yes</option>
                          <option value="no">No</option>
                        </select>
                      ) : evt.isComplete ? (
                        <span className="status-open">Yes</span>
                      ) : (
                        <span className="status-closed">No</span>
                      )}
                    </td> 

                    <td className="cell-label">Teams URL</td>
                    <td className="cell-value">
                      {isEditing ? (
                        <input
                          type="text"
                          className="url-input"
                          value={draftEvent.teamsLeaderboardUrl || ''}
                          onChange={(e) =>
                            setDraftEvent({
                              ...draftEvent,
                              teamsLeaderboardUrl: e.target.value,
                            })
                          }
                        />
                      ) : evt.teamsLeaderboardUrl ? (
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

                  {/* Row 3: Town | BlueGolf URL | WGR URL */}
                  <tr>
                    <td className="cell-label">Town</td>
                    <td className="cell-value">
                      {isEditing ? (
                        <input
                          type="text"
                          value={draftEvent.town || ''}
                          onChange={(e) =>
                            setDraftEvent({ ...draftEvent, town: e.target.value })
                          }
                          className="cell-input"
                        />
                      ) : (
                        evt.town || '—'
                      )}
                    </td>

                    <td className="cell-label">BlueGolf URL</td>
                    <td className="cell-value">
                      {isEditing ? (
                        <input
                          type="text"
                          className="url-input"
                          value={draftEvent.blueGolfUrl || ''}
                          onChange={(e) =>
                            setDraftEvent({
                              ...draftEvent,
                              blueGolfUrl: e.target.value,
                            })
                          }
                        />
                      ) : evt.blueGolfUrl ? (
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
                      {isEditing ? (
                        <input
                          type="text"
                          className="url-input"
                          value={draftEvent.wgrLeaderboardUrl || ''}
                          onChange={(e) =>
                            setDraftEvent({
                              ...draftEvent,
                              wgrLeaderboardUrl: e.target.value,
                            })
                          }
                        />
                      ) : evt.wgrLeaderboardUrl ? (
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

                  {/* Row 4: State | Net URL */}
                  <tr>
                    <td className="cell-label">State</td>
                    <td className="cell-value">
                      {isEditing ? (
                        <input
                          type="text"
                          value={draftEvent.state || ''}
                          onChange={(e) =>
                            setDraftEvent({ ...draftEvent, state: e.target.value })
                          }
                          className="cell-input"
                        />
                      ) : (
                        evt.state || '—'
                      )}
                    </td>

                    <td className="cell-label">Net URL</td>
                    <td className="cell-value">
                      {isEditing ? (
                        <input
                          type="text"
                          className="url-input"
                          value={draftEvent.netLeaderboardUrl || ''}
                          onChange={(e) =>
                            setDraftEvent({
                              ...draftEvent,
                              netLeaderboardUrl: e.target.value,
                            })
                          }
                        />
                      ) : evt.netLeaderboardUrl ? (
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

                    {/* Empty cells for alignment */}
                    <td className="cell-label">&nbsp;</td>
                    <td className="cell-value">&nbsp;</td>
                  </tr>

                  {/* Row 5: Handicap | Gross URL */}
                  <tr>
                    <td className="cell-label">Handicap</td>
                    <td className="cell-value">
                      {isEditing ? (
                        <input
                          type="text"
                          value={draftEvent.handicapAllowance || ''}
                          onChange={(e) =>
                            setDraftEvent({
                              ...draftEvent,
                              handicapAllowance: e.target.value,
                            })
                          }
                          className="cell-input"
                        />
                      ) : (
                        evt.handicapAllowance || '—'
                      )}
                    </td>

                    <td className="cell-label">Gross URL</td>
                    <td className="cell-value">
                      {isEditing ? (
                        <input
                          type="text"
                          className="url-input"
                          value={draftEvent.grossLeaderboardUrl || ''}
                          onChange={(e) =>
                            setDraftEvent({
                              ...draftEvent,
                              grossLeaderboardUrl: e.target.value,
                            })
                          }
                        />
                      ) : evt.grossLeaderboardUrl ? (
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

                    {/* Empty cells for alignment */}
                    <td className="cell-label">&nbsp;</td>
                    <td className="cell-value">&nbsp;</td>
                  </tr>
                </tbody>
              </table>
            </div>
          );
        })
      )}
    </>
  );
}


