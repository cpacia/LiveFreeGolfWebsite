// src/components/AdminChangePassword.jsx
import React, { useState } from 'react';
import './AdminStandings.css'; // Reuse the same CSS for card & table styling

export default function AdminChangePassword() {
  // State for each field
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // Track whether we're “in edit mode” (always true here since user must edit)
  const [isEditing, setIsEditing] = useState(true);

  // When saving, we disable the button until response returns
  const [saving, setSaving] = useState(false);

  // Handle “Save” click: validate locally, then POST to backend
  const handleSave = () => {
    // 1) Simple client‐side check: new vs confirm must match
    if (newPassword !== confirmPassword) {
      window.alert('New password and confirmation do not match.');
      return;
    }
    if (!currentPassword || !newPassword) {
      window.alert('Please fill out all fields.');
      return;
    }

    setSaving(true);
    fetch('http://localhost:8080/change-password', {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        currentPassword,
        newPassword,
        confirmPassword,
      }),
    })
      .then((res) => {
        if (!res.ok) {
          return res.text().then((text) => {
            throw new Error(text || `HTTP ${res.status}`);
          });
        }
        return null;
      })
      .then((data) => {
        // You can customize this success message as needed
        window.alert('Password changed successfully.');
        // Optionally clear the form
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
      })
      .catch((err) => {
        console.error('Change password failed:', err);
        window.alert(`Error: ${err.message}`);
      })
      .finally(() => setSaving(false));
  };

  // Handle “Cancel”: simply clear all fields
  const handleCancel = () => {
    if (
      !window.confirm(
        'Discard all changes to your password fields and reset form?'
      )
    ) {
      return;
    }
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
  };

  return (
    <div className="change-password-page">
      {/* Header Bar */}
      <div className="card-table-header card-table-header-width" style={{ marginBottom: '1rem' }}>
        Change Password
      </div>

      <div className={`card-table-container card-table-width ${isEditing ? 'editing' : ''}`}>
        <table className="admin-standings-table">
          <tbody>
            {/* Row 1: Current Password + Actions (rowSpan=3) */}
            <tr>
              <td className="cell-label">Current Password</td>
              <td className="cell-value">
                <input
                  type="password"
                  className="cell-input"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder="••••••••"
                />
              </td>
              <td className="cell-actions" rowSpan="3">
                <button
                  className="btn-save"
                  onClick={handleSave}
                  disabled={saving}
                  style={{ marginBottom: '0.5rem' }}
                >
                  {saving ? 'Saving…' : 'Save'}
                </button>
                <button
                  className="btn-cancel"
                  onClick={handleCancel}
                  disabled={saving}
                >
                  Cancel
                </button>
              </td>
            </tr>

            {/* Row 2: New Password */}
            <tr>
              <td className="cell-label">New Password</td>
              <td className="cell-value">
                <input
                  type="password"
                  className="cell-input"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="••••••••"
                />
              </td>
            </tr>

            {/* Row 3: Confirm New Password */}
            <tr>
              <td className="cell-label">Confirm Password</td>
              <td className="cell-value">
                <input
                  type="password"
                  className="cell-input"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                />
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}

