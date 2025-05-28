import React from 'react';
import './BlurbSection.css';

export default function BlurbSection({ title, text, cta }) {
  return (
    <section className="blurb-section">
      <h2>{title}</h2>
      <p>{text}</p>
      {cta && (
        <a href={cta.href} className="btn-secondary">
          {cta.text} ▶
        </a>
      )}
    </section>
  );
}

