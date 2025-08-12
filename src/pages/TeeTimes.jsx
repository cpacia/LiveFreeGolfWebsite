// pages/TeeTimesPage.jsx
import React, { useEffect, useMemo, useState } from "react";
import { useParams, useLocation } from "react-router-dom";
import "./ProductPage.css"; // reuse the existing layout & typography
import "./TeeTimes.css";

const SHOP_DOMAIN = "checkout.livefreegolf.com";
const STOREFRONT_TOKEN = "cfed2819f4fda26e6be3560f1f4c9198";

export default function TeeTimesPage() {
  const { handle } = useParams();
  const { search } = useLocation();
  const params = new URLSearchParams(search);
  const eventID = params.get("eventID");

  const [product, setProduct] = useState(null);
  const [mainImage, setMainImage] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [teeTimes, setTeeTimes] = useState([]);
  const [teeTimesLoading, setTeeTimesLoading] = useState(true);
  const [teeTimesError, setTeeTimesError] = useState("");

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        setLoading(true);
        setError("");
        const res = await fetch(`https://${SHOP_DOMAIN}/api/2024-10/graphql.json`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "X-Shopify-Storefront-Access-Token": STOREFRONT_TOKEN,
          },
          body: JSON.stringify({
            query: `query GetByHandle($handle: String!) {
              productByHandle(handle: $handle) {
                id
                title
                images(first: 10) { edges { node { url altText } } }
                featuredImage { url altText }
                date: metafield(namespace: "event", key: "date") { value }
                course: metafield(namespace: "event", key: "course") { value }
                town: metafield(namespace: "event", key: "town") { value }
                state: metafield(namespace: "event", key: "state") { value }
              }
            }`,
            variables: { handle },
          }),
        });
        const { data, errors } = await res.json();
        if (!active) return;
        if (errors?.length) throw new Error(errors.map((e) => e.message).join("; "));
        const p = data?.productByHandle;
        if (!p) throw new Error("Event not found");
        setProduct(p);
        setMainImage(p.featuredImage?.url || p.images.edges[0]?.node.url || "");
      } catch (e) {
        if (active) setError(e.message || "Failed to load event");
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => {
      active = false;
    };
  }, [handle]);

  useEffect(() => {
    if (!eventID) return;
    let active = true;
    (async () => {
      try {
        setTeeTimesLoading(true);
        setTeeTimesError("");
        const res = await fetch(`/api/tee-times/${encodeURIComponent(eventID)}`);
        if (!res.ok) throw new Error(`Tee times request failed (${res.status})`);
        const data = await res.json();
        if (!active) return;
        setTeeTimes(Array.isArray(data) ? data : []);
      } catch (e) {
        if (active) setTeeTimesError(e.message || "Failed to load tee times");
      } finally {
        if (active) setTeeTimesLoading(false);
      }
    })();
    return () => {
      active = false;
    };
  }, [eventID]);

  const formattedDate = useMemo(() => {
    const raw = product?.date?.value;
    if (!raw) return null;
    const parts = raw.split("-").map((v, i) => (i === 1 ? parseInt(v) - 1 : parseInt(v)));
    const d = new Date(parts[0], parts[1], parts[2]);
    return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  }, [product]);

  const teeTimesByRound = useMemo(() => {
    const map = new Map();
    for (const t of teeTimes) {
      const key = t.round ?? t.Round ?? 0;
      if (!map.has(key)) map.set(key, []);
      map.get(key).push({
        time: t.time ?? t.Time,
        hole: t.hole ?? t.Hole,
        players: t.players ?? t.Players ?? [],
      });
    }
    return [...map.entries()].sort((a, b) => Number(a[0]) - Number(b[0]));
  }, [teeTimes]);

  if (loading) return <div className="product-page-container">Loading event…</div>;
  if (error) return <div className="product-page-container">{error}</div>;

  return (
    <div className="product-page-container">
      <div className="product-image-column">
        {mainImage && <img className="product-image" src={mainImage} alt={product.title} />}
        <div className="thumbnail-list">
          {product.images.edges.map(({ node }, idx) => (
            <button
              key={idx}
              className={`thumbnail-item ${mainImage === node.url ? "active" : ""}`}
              onClick={() => setMainImage(node.url)}
            >
              <img src={node.url} alt={node.altText || `${product.title} ${idx + 1}`} />
            </button>
          ))}
        </div>
      </div>

      <div className="teetime-info-column">
        <h1 className="product-title">{product.title}</h1>
        {(formattedDate || product.course?.value) && (
          <div className="tournament-meta">
            <div className="tournament-date-course">
              {formattedDate}
              {formattedDate && product.course?.value ? " | " : ""}
              {product.course?.value}
            </div>
            {(product.town?.value || product.state?.value) && (
              <div className="tournament-location">
                {product.town?.value}
                {product.town?.value && product.state?.value ? ", " : ""}
                {product.state?.value}
              </div>
            )}
          </div>
        )}

        <div style={{ marginTop: "1rem" }}>
          {teeTimesLoading && <div>Loading tee times…</div>}
          {teeTimesError && <div style={{ color: "#b00020" }}>{teeTimesError}</div>}
          {!teeTimesLoading && !teeTimesError && teeTimesByRound.length === 0 && (
            <div>No tee times are available yet. Please check back closer to the event.</div>
          )}

          {teeTimesByRound.map(([roundNum, items]) => (
            <div key={roundNum} style={{ marginBottom: "1.5rem" }}>
              <div style={{
                fontWeight: 600,
                color: "#163627",
                marginBottom: "0.5rem",
                borderBottom: "1px solid #e5e7eb",
                paddingBottom: "0.25rem",
              }}>
                {`Round ${roundNum || 1}`}
              </div>
              <div style={{ overflowX: "auto" }}>
                <table className="teetime-table">
                  <thead>
                    <tr>
                      <th>Time</th>
                      <th>Hole</th>
                      <th>Players</th>
                    </tr>
                  </thead>
                  <tbody>
                    {items.map((t, idx) => (
                      <tr key={idx}>
                        <td>{t.time || ""}</td>
                        <td>{t.hole || ""}</td>
                        <td>{(t.players || []).join(", ")}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

