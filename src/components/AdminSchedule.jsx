// AdminSchedule.jsx
import './AdminSchedule.css'; // optional: only if you want schedule‑specific tweaks

export default function AdminSchedule() {
  return (
    <>
      {/* Page title + “Add Event” button */}
      <div className="schedule-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h1>Schedule – 2025</h1>
        <button className="btn-add-event">Add Event</button>
      </div>

      {/* Example card wrapper: you can loop/map your actual events here */}
      <div className="schedule-cards">
        <div className="card">
          <div className="card-image">
            {/* Example placeholder */}
            <img
              src="/path/to/placeholder.png"
              alt="placeholder"
              style={{ width: '120px', height: '120px', objectFit: 'cover', borderRadius: '4px' }}
            />
          </div>
          <div className="card-content">
            <h2>Spring Classic</h2>
            <p>2025-04-15 | Whispering Pines, Greenville, TX</p>
            <p>
              <strong>Handicap:</strong> 80%  
              <span style={{ color: 'green' }}>&#9679; Registration: Open</span>  
              <span style={{ color: 'red' }}>&#9679; Complete: No</span>
            </p>
            <div className="leaderboards">
              <p><strong>Leaderboards:</strong></p>
              <p>Net:   <a href="https://bluegolf.com/net" target="_blank">https://bluegolf.com/net</a></p>
              <p>Gross: <a href="https://bluegolf.com/gross" target="_blank">https://bluegolf.com/gross</a></p>
              <p>Skins: <a href="https://bluegolf.com/skins" target="_blank">https://bluegolf.com/skins</a></p>
              <p>Teams: <a href="https://bluegolf.com/teams" target="_blank">https://bluegolf.com/teams</a></p>
              <p>WGR:   <a href="https://bluegolf.com/wgr" target="_blank">https://bluegolf.com/wgr</a></p>
              <p>BlueGolf: <a href="https://bluegolf.com/spring-classic" target="_blank">https://bluegolf.com/spring-classic</a></p>
            </div>
            <div className="card-buttons" style={{ marginTop: '1rem' }}>
              <button className="btn-edit">Edit</button>
              <button className="btn-delete">Delete</button>
            </div>
          </div>
        </div>
        {/* Repeat <div className="card">…</div> for each event */}
      </div>
    </>
  );
}

