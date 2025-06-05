// src/pages/Courses.jsx
import React, { useEffect, useState } from "react";
import "./Courses.css";

export default function Courses() {
  const [courses, setCourses] = useState([]);

  useEffect(() => {
    fetch("/courses.json")
      .then((res) => res.json())
      .then((data) => setCourses(data))
      .catch((err) => console.error("Failed to load courses:", err));
  }, []);

  return (
    <div className="courses-wrapper">
      <main className="courses-page">
        <h1 className="page-title">Courses We’ve Played</h1>
        <div className="courses-grid">
          {courses.map((course) => (
            <div className="course-card" key={course.id}>
              {course.link && (
                <a
                  href={course.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-secondary"
                >
                  <img
                    src={`/images/courses/${course.thumbnail}`}
                    alt={course.name}
                    className="course-image"
                  />
                </a>
              )}
              <div className="course-info">
                <h3>{course.name}</h3>
                <p className="location">
                  {course.city}, {course.state}
                </p>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
