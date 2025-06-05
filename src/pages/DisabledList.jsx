import React, { useState, useEffect } from "react";
import "./DisabledList.css";

export default function DisabledGolfers() {
  const [disabledList, setDisabledList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch the list of disabled golfers on mount
  useEffect(() => {
    const fetchDisabled = async () => {
      setLoading(true);
      setError(null);

      try {
        const resp = await fetch("http://localhost:8080/disabled-golfers");
        if (!resp.ok) {
          throw new Error(`HTTP ${resp.status}`);
        }
        const data = await resp.json();
        // Expecting data = [ { name, reason, duration }, … ]
        setDisabledList(Array.isArray(data) ? data : []);
      } catch (e) {
        console.error(e);
        setError("Failed to load disabled golfers.");
      } finally {
        setLoading(false);
      }
    };

    fetchDisabled();
  }, []);

  return (
    <div className="full-bleed disabled-content">
      <div className="dl-content-container">
        {loading && <p className="disabled-loading-text">Loading…</p>}
        {error && <p className="disabled-error-text">{error}</p>}

        {!loading && !error && (
          <>
            {/* Heading */}
            <h2 className="disabled-heading">Disabled Golfers</h2>

            {/* Optional blurb/explanatory text */}
            <p className="disabled-blurb">
              Below is a list of players who are currently on the disabled list.
            </p>

            {/* Table */}
            <table className="disabled-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Reason</th>
                  <th>Duration</th>
                </tr>
              </thead>
              <tbody>
                {disabledList.length === 0 ? (
                  <tr>
                    <td colSpan="3" style={{ textAlign: "center" }}>
                      No disabled golfers found.
                    </td>
                  </tr>
                ) : (
                  disabledList.map((golfer, idx) => (
                    <tr key={idx}>
                      <td>{golfer.name}</td>
                      <td>{golfer.reason}</td>
                      <td>{golfer.duration}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </>
        )}
      </div>
    </div>
  );
}
