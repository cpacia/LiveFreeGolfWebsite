import React, { useState, useEffect, useRef } from "react";
import "./HeroCarousel.css";
import { Link } from "react-router-dom"

const SHOP_DOMAIN = "chad-622.myshopify.com";
const STOREFRONT_TOKEN = "cfed2819f4fda26e6be3560f1f4c9198";
const BLOG_HANDLE =
  "walker-and-blais-blaze-through-the-field-on-way-to-victory";
const POSTS_CONFIG_URL = "/posts.json";

const staticSlides = [
  {
    id: "blurb", // ← unique key for the static slide
    img: "/images/slide1.png",
    isBlurb: true,
    blurbTitle: "About Live Free Golf",
    blurbText: "…",
    cta: { text: "Learn More", href: "/tour-info" },
  },
];

const rawConfig = await fetch(POSTS_CONFIG_URL)
  .then((r) => (r.ok ? r.json() : []))
  .catch(() => []);
const configMap = {};
rawConfig.forEach((item) => {
  if (item.slug) configMap[item.slug] = item;
});

const stripHtml = (html) => {
  const tmp = document.createElement("div");
  tmp.innerHTML = html;
  return tmp.textContent || tmp.innerText || "";
};

const SLIDE_INTERVAL = 5000;

export default function HeroCarousel() {
  const [slides, setSlides] = useState(staticSlides);
  const [index, setIndex] = useState(0);

  const timeoutRef = useRef(null);
  const intervalRef = useRef(null);

  const prev = () => {
    setIndex((i) => (i === 0 ? slides.length - 1 : i - 1));
    clearTimeout(timeoutRef.current);
  };

  const next = () => {
    setIndex((i) => (i >= slides.length - 1 ? 0 : i + 1));
    clearTimeout(timeoutRef.current);
  };

  const fmt = (date) =>
    new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    }).format(date);

  useEffect(() => {
    const fetchSlides = async () => {
      const today = new Date();
      const newSlides = [staticSlides[0]]; // start with the “About” blurb

      try {
        const eventsRes = await fetch("/api/events");
        const data = await eventsRes.json();
        const allEvents = Array.isArray(data.events) ? data.events : [];

        const upcoming = allEvents
          .map((e) => ({
            ...e,
            dateObj: new Date(e.date + "T00:00:00"),
          }))
          .filter((e) => e.dateObj >= today)
          .sort((a, b) => a.dateObj - b.dateObj);

        const nextEvent = upcoming[0];
        if (nextEvent) {
          newSlides.push({
            id: nextEvent.EventID || `event-${nextEvent.date}`, // ensure it’s never undefined
            img: `/images/slide2.png`,
            isEvent: true,
            label: "Next Event",
            name: nextEvent.name,
            date: nextEvent.dateObj,
            course: nextEvent.course,
          });
        }
      } catch (err) {
        console.error("Failed to load events:", err);
      }

      try {
        const gqlResponse = await fetch(
          `https://${SHOP_DOMAIN}/api/2025-07/graphql.json`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "X-Shopify-Storefront-Access-Token": STOREFRONT_TOKEN,
            },
            body: JSON.stringify({
              query: `
                query LatestPost {
                  blog(handle: "${BLOG_HANDLE}") {
                    articles(first: 1, reverse: true) {
                      edges {
                        node {
                          id
                          title
                          handle
                          publishedAt
                          excerpt: contentHtml
                          image { url altText }
                        }
                      }
                    }
                  }
                }
              `,
            }),
          },
        );

        const gqlJson = await gqlResponse.json();
        const latestNode = gqlJson?.data?.blog?.articles?.edges?.[0]?.node;

        if (latestNode && window.innerWidth > 768) {
          const override = configMap[latestNode.handle] || {};
          const imgUrl = override["replacement-image"] || latestNode.image?.url;
          const headerPos = override["header-pos"] || "center";

          newSlides.push({
            id: latestNode.id || latestNode.handle,
            isPost: true,
            thumbnailUrl: imgUrl,
            img: "/images/slide3.png",
            headerPos: headerPos,
            title: latestNode.title,
            dateObj: new Date(latestNode.publishedAt),
            slug: latestNode.handle,
            excerpt: stripHtml(latestNode.excerpt).slice(0, 200).trim(),
          });
        }
      } catch (err) {
        console.error("Failed to load blog post:", err);
      }
      setSlides(newSlides);
    };

    fetchSlides();
  }, []);

  useEffect(() => {
    if (slides.length <= 1) return;

    intervalRef.current = setInterval(() => {
      setIndex((i) => (i + 1) % slides.length);
    }, SLIDE_INTERVAL);

    return () => clearInterval(intervalRef.current);
  }, [slides]);

  // If slides array changes and `index` is out of range, reset to 0
  useEffect(() => {
    if (index >= slides.length) {
      setIndex(0);
    }
  }, [slides]);

  const resetTimer = () => {
    clearInterval(intervalRef.current);
    intervalRef.current = setInterval(() => {
      setIndex((i) => (i + 1) % slides.length);
    }, SLIDE_INTERVAL);
  };

  return (
    <div
      className="hero-carousel"
      onMouseEnter={() => clearTimeout(timeoutRef.current)}
      onMouseLeave={() => resetTimer()}
    >
      {slides.map((s, i) => (
        // Combine the slide’s id with the index to guarantee uniqueness
        <div
          key={`${s.id}-${i}`}
          className={
            `slide${i === index ? " active" : ""}` +
            (s.isPost ? " post-wrapper" : "")
          }
          style={s.img ? { backgroundImage: `url(${s.img})` } : {}}
        >
          <div className="slide-content">
            <div className="overlay">
              {s.isBlurb ? (
                <div className="blurb-card">
                  <h2>Live Free Golf Tour</h2>
                  <p>New Hampshire amateur golf at its finest!</p>
                  <Link to="/tour-details" className="btn-primary">
                    Learn More ▶
                  </Link>
                </div>
              ) : s.isEvent ? (
                <div className="event-card">
                  <p className="label">{s.label}</p>
                  <p className="title">{s.name}</p>
                  <p className="sub">
                    {fmt(s.date)} | {s.course}
                  </p>
                  <div className="cta-group">
                    <Link to="/schedule" className="btn-secondary">
                      View Schedule
                    </Link>
                    <Link to="/membership" className="btn-primary">
                      Register Now
                    </Link>
                  </div>
                </div>
              ) : s.isPost ? (
                <div className="post-slide">
                  <img
                    src={s.thumbnailUrl}
                    alt={s.title}
                    className="post-image"
                    style={{ objectPosition: `center ${s.headerPos}` }}
                  />
                  <div className="post-text">
                    <h2 className="post-title">{s.title}</h2>
                    <p className="post-date">{fmt(s.dateObj)}</p>
                    <p className="post-excerpt">{s.excerpt}</p>
                    <Link to={`/blog/${s.slug}`} className="btn-primary">
                      Read More ▶
                    </Link>
                  </div>
                </div>
              ) : (
                // If you ever need a generic “headline + multiple CTAs” slide,
                // make sure s.ctas is an array and give each <a> a unique key here:
                <>
                  <h1>{s.headline}</h1>
                  <div className="cta-group">
                    {(s.ctas || []).map((cta, idx) => (
                      <Link
                        key={`${cta.text}-${idx}`}
                        to={cta.href}
                        className="btn-primary"
                      >
                        {cta.text}
                      </Link>
                    ))}
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      ))}

      <button
        className="nav prev"
        onClick={() => {
          prev();
          resetTimer();
        }}
      >
        <span className="chevron">‹</span>
      </button>
      <button
        className="nav next"
        onClick={() => {
          next();
          resetTimer();
        }}
      >
        <span className="chevron">›</span>
      </button>
    </div>
  );
}
