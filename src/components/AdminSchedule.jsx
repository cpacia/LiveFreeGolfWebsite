// AdminSchedule.jsx
import React, { useState, useEffect, useRef } from 'react';
import './AdminSchedule.css';

export default function AdminSchedule() {
  // 1) State for list of events, loading/error, inline editing, and new-event counter
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Which eventID is currently in edit mode (or null if none)
  const [editingId, setEditingId] = useState(null);

  // The draft copy of the event being edited
  const [draftEvent, setDraftEvent] = useState(null);

  // The selected thumbnail File, if any, during edit
  const [thumbnailFile, setThumbnailFile] = useState(null);

  // Counter for generating temporary IDs for new events
  const [newCount, setNewCount] = useState(0);

  // File input ref for thumbnail selection
  const fileInputRef = useRef();

  // 2) Fetch existing events on mount
  useEffect(() => {
    fetch('http://localhost:8080/events', { credentials: 'include' })
      .then((res) => {
        if (!res.ok) {
          throw new Error(`HTTP ${res.status} – ${res.statusText}`);
        }
        return res.json();
      })
      .then((data) => {
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

  // 5) Handler for Add Event button
  const handleAddEvent = () => {
    const tempId = `__new__${newCount + 1}`;
    setNewCount((n) => n + 1);

    // Create a blank placeholder with default/empty fields
    const blank = {
      eventID: tempId,
      name: '',
      date: new Date().toISOString().slice(0, 10), // default today
      course: '',
      town: '',
      state: '',
      handicapAllowance: '',
      blueGolfUrl: '',
      thumbnail: '', // no preview yet
      registrationOpen: false,
      isComplete: false,
      netLeaderboardUrl: '',
      grossLeaderboardUrl: '',
      skinsLeaderboardUrl: '',
      teamsLeaderboardUrl: '',
      wgrLeaderboardUrl: '',
    };

    // Insert placeholder at the top of the list (or bottom—choose as desired)
    setEvents((prev) => [blank, ...prev]);

    // Enter edit mode with that placeholder
    setEditingId(tempId);
    setDraftEvent(blank);
    setThumbnailFile(null);
  };

  // 6) Handler for thumbnail file selection (in edit mode)
  const handleThumbnailChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setThumbnailFile(file);

      // Immediately update preview URL in draftEvent.thumbnail
      const previewURL = URL.createObjectURL(file);
      setDraftEvent((prev) => ({
        ...prev,
        thumbnail: previewURL,
      }));
    }
  };

  // 7) Render the list of event “card‐tables”
  return (
    <>
      {/* Page header */}
      <div className="schedule-header">
        <h1>Schedule – 2025</h1>
        <button className="btn-add-event" onClick={handleAddEvent}>
          Add Event
        </button>
      </div>

      {events.length === 0 ? (
        <p>No events found for this year.</p>
      ) : (
        events.map((evt) => {
          const isEditing = editingId === evt.eventID;
          const isNew = evt.eventID.startsWith('__new__');

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
                  placeholder="Event Name"
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
                          {/* Preview (or default) + clickable to open file chooser */}
                          <img
                            src={
                              draftEvent.thumbnail ||
                              '/images/default-image.webp'
                            }
                            alt={`${draftEvent.name} thumbnail`}
                            className="event-thumbnail clickable-image"
                            onClick={() => fileInputRef.current.click()}
                          />
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
                          src={`http://localhost:8080/events/${evt.eventID}/thumbnail`}
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
                          placeholder="https://..."
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
                              // Build FormData: "event" + optional "thumbnail"
                              const form = new FormData();
                              // Copy draftEvent and remove preview URL
                              const eventCopy = { ...draftEvent };
                              form.append('event', JSON.stringify(eventCopy));
                              if (thumbnailFile) {
                                form.append('thumbnail', thumbnailFile);
                              }

                              // Determine POST vs PUT
                              const url = isNew
                                ? 'http://localhost:8080/events'
                                : `http://localhost:8080/events/${draftEvent.eventID}`;
                              const method = isNew ? 'POST' : 'PUT';

                              fetch(url, {
                                method,
                                credentials: 'include',
                                body: form,
                              })
                                .then((res) => {
                                  if (!res.ok) {
                                    throw new Error(`HTTP ${res.status}`);
                                  }
                                  return res.json();
                                })
                                .then((returnedEvt) => {
                                  setEvents((prev) => {
                                    if (isNew) {
                                      // Remove any other __new__ placeholders and prepend the real event
                                      const filtered = prev.filter(
                                        (e) => !e.eventID.startsWith('__new__')
                                      );
                                      return [returnedEvt, ...filtered];
                                    } else {
                                      // Replace existing event
                                      return prev.map((e) =>
                                        e.eventID === returnedEvt.eventID
                                          ? {
                                              ...returnedEvt,
                                              date: returnedEvt.date || '',
                                            }
                                          : e
                                      );
                                    }
                                  });
                                  setEditingId(null);
                                  setDraftEvent(null);
                                  setThumbnailFile(null);
                                })
                                .catch((err) => {
                                  console.error('Save failed:', err);
                                  // Optionally show an error toast
                                });
                            }}
                          >
                            Save
                          </button>
                          <button
                            className="btn-cancel"
                            onClick={() => {
                              // If it was a new placeholder, remove it entirely
                              if (isNew) {
                                setEvents((prev) =>
                                  prev.filter((e) => e.eventID !== evt.eventID)
                                );
                              }
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
                          placeholder="Course name"
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
                          placeholder="https://..."
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
                          placeholder="Town"
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
                          placeholder="https://..."
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
                          placeholder="https://..."
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
                          placeholder="State"
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
                          placeholder="https://..."
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
                          placeholder="e.g. 80%"
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
                          placeholder="https://..."
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



