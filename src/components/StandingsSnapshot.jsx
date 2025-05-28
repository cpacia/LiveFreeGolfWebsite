import React, { useEffect, useState } from 'react';
import './StandingsSnapshot.css';

export default function StandingsSnapshot({ dataEndpoint, top = 3 }) {
  const [standings, setStandings] = useState([]);
  useEffect(() => {
    fetch(dataEndpoint)
      .then((res) => res.json())
      .then((data) => setStandings(data.points.slice(0, top)));
  }, []);

  return (
    <aside className="standings-snapshot">
      <h2>Current Standings</h2>
      <ol>
        {standings.map((p) => (
          <li key={p.player}>
            {p.player} — {p.points}
          </li>
        ))}
      </ol>
      <a href="/standings">View Full Standings ▶</a>
    </aside>
  );
}

