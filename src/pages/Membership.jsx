import React, { useState, useEffect } from "react";
import "./Membership.css";
import { Link } from "react-router-dom";

// Shopify storefront config
const SHOP_DOMAIN = "checkout.livefreegolf.com";
const STOREFRONT_TOKEN = "cfed2819f4fda26e6be3560f1f4c9198";

const tiers = [
  {
    id: "lfg-ghin",
    title: "LFG + GHIN",
    highlights: ["Full league membership", "GHIN handicap included"],
    url: "/listing/ghin-membership",
  },
  {
    id: "lfg-only",
    title: "LFG Only",
    highlights: ["League membership only"],
    url: "/listing/membership",
  },
  {
    id: "ghin-only",
    title: "GHIN Only",
    highlights: ["GHIN handicap only"],
    url: "/listing/ghin-only",
  },
];

export default function Membership() {
  const [prices, setPrices] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  // Initialize with current year as a fallback, then overwrite from API
  const [year, setYear] = useState(new Date().getFullYear());

  useEffect(() => {
    // Fetch the dynamic current year
    async function fetchCurrentYear() {
      try {
        const res = await fetch("/api/current-year");
        if (!res.ok) throw new Error("Failed to fetch current year");
        const data = await res.json();
        setYear(data.calendarYear);
      } catch (e) {
        console.error("Error fetching current year:", e);
      }
    }

    // Fetch membership prices from Shopify Storefront API
    async function fetchPrices() {
      try {
        const query = `query GetMembershipPrices {
          ghin: productByHandle(handle: \"ghin-membership\") {
            variants(first: 1) { edges { node { price { amount currencyCode } } } }
          }
          membership: productByHandle(handle: \"membership\") {
            variants(first: 1) { edges { node { price { amount currencyCode } } } }
          }
          ghinOnly: productByHandle(handle: \"ghin-only\") {
            variants(first: 1) { edges { node { price { amount currencyCode } } } }
          }
        }`;

        const res = await fetch(
          `https://${SHOP_DOMAIN}/api/2024-10/graphql.json`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "X-Shopify-Storefront-Access-Token": STOREFRONT_TOKEN,
            },
            body: JSON.stringify({ query }),
          },
        );

        const { data, errors } = await res.json();
        if (errors) throw new Error(errors.map((e) => e.message).join(", "));

        const raw = {
          "lfg-ghin": data.ghin.variants.edges[0].node.price,
          "lfg-only": data.membership.variants.edges[0].node.price,
          "ghin-only": data.ghinOnly.variants.edges[0].node.price,
        };

        const formatted = {};
        Object.entries(raw).forEach(([key, price]) => {
          // Format with cents then strip .00
          const formattedRaw = new Intl.NumberFormat("en-US", {
            style: "currency",
            currency: price.currencyCode,
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          }).format(parseFloat(price.amount));
          formatted[key] = formattedRaw.replace(/\.[0-9]{2}$/, "");
        });

        setPrices(formatted);
      } catch (e) {
        console.error("Error fetching membership prices:", e);
        setError(e.message);
      } finally {
        setLoading(false);
      }
    }

    fetchCurrentYear();
    fetchPrices();
  }, []);

  return (
    <section className="membership-section2 full-bleed">
      <div className="content-card2">
        <h2 className="section-title">Become a Tour Member</h2>
        {error && <div className="error">{error}</div>}
        <p className="blurb2">
          Purchase one of the membership options below to join the {year} LFG
          Tour. You must have a valid GHIN handicap to compete. If you already
          have one, feel free to purchase the LFG membership only. Otherwise,
          you can purchase a membership and a GHIN and we'll get you a handicap.
        </p>
        <div className="membership-grid2">
          <div className="swiper">
            {tiers.map((tier) => (
              <div key={tier.id} className="tier-card">
                <h3 className="tier-title">{tier.title}</h3>
                <p className="tier-price">
                  {loading ? "Loading..." : prices[tier.id] || "--"}
                </p>
                <ul className="tier-highlights">
                  {tier.highlights.map((h, i) => (
                    <li key={i}>{h}</li>
                  ))}
                </ul>
                <Link to={tier.url} className="btn-primary tier-cta">
                  Sign Up ▶
                </Link>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
