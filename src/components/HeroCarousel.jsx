import React, { useState, useEffect } from 'react';
import './HeroCarousel.css';

const staticSlides = [
  {
    // This first slide is now your About blurb
    img: '/images/slide1.png',         // same background
    isBlurb: true,                     // flag for custom rendering
    blurbTitle: 'About Live Free Golf',
    blurbText:
      'Live Free Golf is a competitive amateur league in New Hampshire, fostering community, fair play, and fun. Join us for seasonal events, track your standings, and shop LFG gear!',
    cta: { text: 'Learn More', href: '/tour-info' }
  },
  {
    img: '/images/slide2.jpg',
    headline: 'Congrats to Jane Smith, Spring Stroke Play Champion!',
    ctas: [{ text: 'View Results', href: '/schedule#event-123' }],
  },
];

export default function HeroCarousel() {
  const [slides, setSlides] = useState(staticSlides);
  const [index, setIndex] = useState(0);
  
  const slide = slides[index] || staticSlides[0];

  const prev = () => setIndex((i) => (i === 0 ? slides.length - 1 : i - 1));
  const next = () => setIndex((i) => (i === slides.length - 1 ? 0 : i + 1));
  
  const fmt = (date) =>
    new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    }).format(date);
    
  useEffect(() => {
    fetch('/events.json')
      .then((res) => res.json())
      .then((events) => {
        const today = new Date();
        const upcoming = events
          .map((e) => ({ ...e, dateObj: new Date(e.date) }))
          .filter((e) => e.dateObj >= today)
          .sort((a, b) => a.dateObj - b.dateObj);
        const next = upcoming[0];
        if (next) {
          const nextSlide = {
            id: next.id,
            img: `/images/slide2.png`, // your event–specific background
            isEvent: true,
            label: 'Next Event',
            name: next.name,
            date: next.dateObj,
            course: next.course,
          };
          // Build new slides: blurb, nextEvent, then the rest of staticSlides (excluding the blurb at 0)
          setSlides([staticSlides[0], nextSlide, ...staticSlides.slice(1)]);
        }
      })
      .catch(console.error);
  }, []);

  return (
    <div className="hero-carousel">
      <div
        className="slide"
        style={{ backgroundImage: `url(${slide.img})` }}
      >
        <div className="overlay">
		  {slide.isBlurb ? (
			<div className="blurb-card">
			  <h2>Live Free Golf Tour</h2>
			  <p>
				New Hampshire amateur golf at its finest!
			  </p>
			  <a href="/tour-info" className="btn-primary">
				Learn More ▶
			  </a>
			</div>
		  ) : slide.isEvent ? (
		    <div className="event-card">
		      <p className="label">{slide.label}</p>
		      <h1>{slide.name}</h1>
		      <p className="sub">
		        {fmt(slide.date)} | {slide.course}
		      </p>
		      <div className="cta-group">
		        <a href="/schedule" className="btn-secondary">
		          View Schedule
		        </a>
		        <a href="/membership" className="btn-primary">
		          Register Now
		        </a>
		      </div>
		    </div>
		  ) : (
	    <>
	      <h1>{slide.headline}</h1>
	      <div className="cta-group">
		{slide.ctas.map((cta) => (
		  <a key={cta.text} href={cta.href} className="btn-primary">
		    {cta.text}
		  </a>
		))}
	      </div>
	    </>
  )}
</div>
      </div>
      <button
	className="nav prev"
	onClick={() => {
	prev();
	}}
       ><span className="chevron">‹</span></button>
      <button
	className="nav next"
	onClick={() => {
	next();
	}}
       ><span className="chevron">›</span></button>
    </div>
  );
}

