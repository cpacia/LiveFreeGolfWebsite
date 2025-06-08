import React, { useEffect, useState } from "react";
import "./EventsPreview.css";
import { Link } from "react-router-dom";

export default function EventsPreview({ limit = 3, eventsEndpoint }) {
  const [events, setEvents] = useState([]);
  useEffect(() => {
    fetch(eventsEndpoint)
      .then((res) => res.json())
      .then((data) => setEvents(data.slice(0, limit)));
  }, []);

  return (
    <section className="events-preview">
      <h2>Upcoming Events</h2>
      <div className="event-cards">
        {events.map((evt) => (
          <div key={evt.id} className="event-card">
            <p className="date">{evt.date}</p>
            <h3>{evt.name}</h3>
            <p>{evt.course}</p>
            <div className="actions">
              <Link to={`/schedule#event-${evt.id}`}>Details ▶</Link>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
