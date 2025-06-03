// src/components/AdminSchedule.jsx
import React, { useState, useEffect, useRef } from 'react';
import './AdminSchedule.css';

export default function AdminSchedule() {
  // 1) State for list of events, loading/error, inline editing, and new-event counter
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Which eventID is currently in edit mode (or null if none)
  const [editingId, setEditingId] = useState(null);

  // The draft copy of the event being edited (excluding thumbnail preview)
  const [draftEvent, setDraftEvent] = useState(null);

  // Local preview URL (blob string) for the newly picked image file
  const [previewURL, setPreviewURL] = useState(null);

  // The selected thumbnail File, if any, during edit
  const [thumbnailFile, setThumbnailFile] = useState(null);

  // Counter for generating temporary IDs for new events
  const [newCount, setNewCount] = useState(0);

  // File input ref for thumbnail selection
  const fileInputRef = useRef();

  // State for season navigation
  const [calendarYear, setCalendarYear] = useState(null);
  const [additionalYears, setAdditionalYears] = useState([]);

  // Extract "year" from query parameters
  const params = new URLSearchParams(window.location.search);
  const yearParam = params.get('year') || '';

  // 2) Fetch existing events on mount or when yearParam changes
  useEffect(() => {
    setLoading(true);
    fetch(`http://localhost:8080/events?year=${yearParam}`, {
      credentials: 'include',
    })
      .then((res) => {
        if (!res.ok) {
          throw new Error(`HTTP ${res.status} – ${res.statusText}`);
        }
        return res.json();
      })
      .then((data) => {
        if (Array.isArray(data.events)) {
          // Attach a cacheKey based on current timestamp so we can bust the cache when updating
          const withCacheKeys = data.events.map((ev) => ({
            ...ev,
            cacheKey: Date.now(),
          }));
          setEvents(withCacheKeys);
        } else {
          console.warn('Unexpected payload:', data);
          setEvents([]);
        }
        setCalendarYear(data.calendarYear);
        setAdditionalYears(data.additionalYears || []);
      })
      .catch((err) => {
        console.error('Failed to fetch events:', err);
        setError(err.message || 'Unknown error');
      })
      .finally(() => {
        setLoading(false);
      });
  }, [yearParam]);

  // 3) Loading / Error UI
  if (loading) {
    return (
      <div className="schedule-header">
        <h1>Schedule – {yearParam || calendarYear || ''}</h1>
        <button className="btn-add-event">Add Event</button>
        <p>Loading events…</p>
      </div>
    );
  }
  if (error) {
    return (
      <div className="schedule-header">
        <h1>Schedule – {yearParam || calendarYear || ''}</h1>
        <button className="btn-add-event">Add Event</button>
        <p style={{ color: 'red' }}>Error loading events: {error}</p>
      </div>
    );
  }

  // 4) Helper to strip protocol for display
  function stripProtocol(url) {
    const withoutProto = url.replace(/^https?:\/\//, '');
    const MAX = 25;
    return withoutProto.length <= MAX
      ? withoutProto
      : withoutProto.slice(0, MAX - 1) + '...';
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
      thumbnail: '',
      registrationOpen: false,
      isComplete: false,
      netLeaderboardUrl: '',
      grossLeaderboardUrl: '',
      skinsLeaderboardUrl: '',
      teamsLeaderboardUrl: '',
      wgrLeaderboardUrl: '',
      cacheKey: Date.now(),
    };

    setEvents((prev) => [blank, ...prev]);
    setEditingId(tempId);
    setDraftEvent(blank);
    setThumbnailFile(null);
    setPreviewURL(null);
  };

  // 6) Handler for thumbnail file selection (in edit mode)
  const handleThumbnailChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setThumbnailFile(file);
      // Immediately update local preview URL
      const objectUrl = URL.createObjectURL(file);
      setPreviewURL(objectUrl);
    }
  };

  // 7) Handler for Delete button (with confirmation dialog)
  const handleDelete = (evt) => {
    const isNew = evt.eventID.startsWith('__new__');
    if (isNew) {
      // Simply remove the placeholder
      setEvents((prev) => prev.filter((e) => e.eventID !== evt.eventID));
    } else {
      // Ask for confirmation
      const confirmed = window.confirm(
        `Are you sure you want to delete event "${evt.name}"?`
      );
      if (!confirmed) return;

      // Send DELETE to API
      fetch(`http://localhost:8080/events/${evt.eventID}`, {
        method: 'DELETE',
        credentials: 'include',
      })
        .then((res) => {
          if (!res.ok) {
            return res.text().then((text) => {
              throw new Error(text || `HTTP ${res.status}`);
            });
          }
          // Remove from state on success
          setEvents((prev) => prev.filter((e) => e.eventID !== evt.eventID));
        })
        .catch((err) => {
          console.error('Delete failed:', err);
          window.alert(`Delete failed: ${err.message}`);
        });
    }
  };

  // 8) Build a sorted list of all seasons (years) latest→oldest
  let seasons = [];
  if (calendarYear !== null) {
    seasons = [calendarYear, ...additionalYears];
    seasons = Array.from(new Set(seasons.map(Number))).sort((a, b) => b - a);
  }

  // 9) Render the list of event “card‐tables” and season links
  return (
    <>
      {/* Page header */}
      <div className="schedule-header">
        <h1>Schedule – {calendarYear}</h1>
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
                  {/* Row 1: Date | Registration | Gross URL | Buttons */}
                  <tr>
                    {/* Column 1: Thumbnail (spans 5 rows) */}
                    <td className="cell-image" rowSpan="5">
                      {isEditing ? (
                        <>
                          {/* 
                            1) If a new file was picked, use previewURL.
                            2) Else if event has a thumbnail, load server URL (with cacheBust).
                            3) Else show default.
                            onError → fallback to default if server image fails.
                          */}
                          <img
                            src={
                              previewURL
                                ? previewURL
                                : evt.thumbnail
                                ? `http://localhost:8080/events/${evt.eventID}/thumbnail?ck=${evt.cacheKey}`
                                : '/images/default-image.webp'
                            }
                            alt={`${draftEvent.name} thumbnail`}
                            className="event-thumbnail clickable-image"
                            onClick={() => fileInputRef.current.click()}
                            onError={(e) => {
                              e.currentTarget.onerror = null;
                              e.currentTarget.src = '/images/default-image.webp';
                            }}
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
                        // Read‑only mode: always load the server URL, with cacheBust
                        <img
                          src={`http://localhost:8080/events/${evt.eventID}/thumbnail?ck=${evt.cacheKey}`}
                          alt={`${evt.name} thumbnail`}
                          className="event-thumbnail"
                          onError={(e) => {
                            e.currentTarget.onerror = null;
                            e.currentTarget.src = '/images/default-image.webp';
                          }}
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

                    {/* Gross URL */}
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

                    {/* Column 4: Edit/Save/Cancel/Delete (spans 5 rows) */}
                    <td className="cell-actions" rowSpan="5">
                      {isEditing ? (
                        <>
                          <button
                            className="btn-save"
                            onClick={() => {
                              // Build FormData: "event" + optional "thumbnail"
                              const form = new FormData();
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
                                    return res.text().then((text) => {
                                      throw new Error(text || `HTTP ${res.status}`);
                                    });
                                  }
                                  return res.json();
                                })
                                .then((returnedEvt) => {
                                  setEvents((prev) => {
                                    if (isNew) {
                                      // Remove placeholders and prepend the real event
                                      const filtered = prev.filter(
                                        (e) => !e.eventID.startsWith('__new__')
                                      );
                                      return [
                                        { ...returnedEvt, cacheKey: Date.now() },
                                        ...filtered,
                                      ];
                                    } else {
                                      // Replace existing event, update cacheKey
                                      return prev.map((e) =>
                                        e.eventID === returnedEvt.eventID
                                          ? {
                                              ...returnedEvt,
                                              date: returnedEvt.date || '',
                                              cacheKey: Date.now(),
                                            }
                                          : e
                                      );
                                    }
                                  });
                                  setEditingId(null);
                                  setDraftEvent(null);
                                  setThumbnailFile(null);
                                  setPreviewURL(null);
                                })
                                .catch((err) => {
                                  console.error('Save failed:', err);
                                  window.alert(`Save failed: ${err.message}`);
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
                              setPreviewURL(null);
                            }}
                          >
                            Cancel
                          </button>
                        </>
                      ) : (
                        <>
                          <button
                            className="btn-edit"
                            onClick={() => {
                              setEditingId(evt.eventID);
                              setDraftEvent({ ...evt, date: evt.date });
                              setPreviewURL(null);
                            }}
                          >
                            Edit
                          </button>
                          <button
                            className="btn-delete"
                            onClick={() => handleDelete(evt)}
                          >
                            Delete
                          </button>
                        </>
                      )}
                    </td>
                  </tr>

                  {/* Row 2: Course | Complete | Skins URL */}
                  <tr>
                    <td className="cell-label">Course</td>
                    <td className="cell-value">
                      {isEditing ? (
                        <input
                          type="text"
                          value={draftEvent.course || ''}
                          onChange={(e) =>
                            setDraftEvent({
                              ...draftEvent,
                              course: e.target.value,
                            })
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
                  </tr>

                  {/* Row 3: Town | BlueGolf URL | Teams URL */}
                  <tr>
                    <td className="cell-label">Town</td>
                    <td className="cell-value">
                      {isEditing ? (
                        <input
                          type="text"
                          value={draftEvent.town || ''}
                          onChange={(e) =>
                            setDraftEvent({
                              ...draftEvent,
                              town: e.target.value,
                            })
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

                  {/* Row 4: State | Shopify URL | WGR URL */}
                  <tr>
                    <td className="cell-label">State</td>
                    <td className="cell-value">
                      {isEditing ? (
                        <input
                          type="text"
                          value={draftEvent.state || ''}
                          onChange={(e) =>
                            setDraftEvent({
                              ...draftEvent,
                              state: e.target.value,
                            })
                          }
                          className="cell-input"
                          placeholder="State"
                        />
                      ) : (
                        evt.state || '—'
                      )}
                    </td>

                    <td className="cell-label">Shopify URL</td>
                    <td className="cell-value">
                      {isEditing ? (
                        <input
                          type="text"
                          className="url-input"
                          value={draftEvent.shopifyUrl || ''}
                          onChange={(e) =>
                            setDraftEvent({
                              ...draftEvent,
                              shopifyUrl: e.target.value,
                            })
                          }
                          placeholder=""
                        />
                      ) : evt.shopifyUrl ? (
                        <a
                          href={evt.shopifyUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          {stripProtocol(evt.shopifyUrl)}
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

                    {/* Empty cells for alignment */}
                    
                  </tr>

                  {/* Row 5: Handicap | Net URL */}
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
                </tbody>
              </table>
            </div>
          );
        })
      )}

      {/* Season Navigation */}
      <div className="season-links">
        Seasons:&nbsp;
        {seasons.map((yr, idx) => (
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
  );
}

