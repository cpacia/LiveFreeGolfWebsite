import React, { useState, useEffect } from "react";
import "./MembershipSection.css";
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

export default function MembershipSection() {
  const [prices, setPrices] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
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
          }
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
          // Format then manually strip any cents
          const amountNum = parseFloat(price.amount);
          const formattedRaw = new Intl.NumberFormat("en-US", {
            style: "currency",
            currency: price.currencyCode,
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          }).format(amountNum);
          // Remove decimal and everything after
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

    fetchPrices();
  }, []);

  return (
    <section className="membership-section full-bleed">
      <h2 className="section-title">Join the Tour</h2>
      {error && <div className="error">{error}</div>}
      <div className="membership-grid">
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
    </section>
  );
}

