import { Link } from 'react-router-dom';
import './AdminPanel.css';

export default function AdminPanel() {
  return (
    <div className="admin-layout">
      <nav className="admin-sidebar">
        <h2>Admin</h2>
        <ul>
          <li><Link to="/admin/schedule">Schedule</Link></li>
          <li><Link to="/admin/standings">Standings</Link></li>
          <li><Link to="/admin/match-play">Match Play</Link></li>
          <li><Link to="/admin/colony-cup">Colony Cup</Link></li>
          <li><Link to="/admin/disabled-list">Disabled List</Link></li>
          <li><Link to="/admin/change-password">Change Password</Link></li>
          <li><Link to="/admin/logout">Logout</Link></li>
        </ul>
      </nav>

      <main className="admin-content">
		  <div className="admin-inner">
			<h1>Welcome to the Admin Panel</h1>
			<p>Select a section from the menu.</p>
		  </div>
	 </main>
    </div>
  );
}
