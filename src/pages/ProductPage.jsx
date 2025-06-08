import React, { useState, useEffect } from 'react';
import { useParams }            from 'react-router-dom';
import './ProductPage.css';

const SHOP_DOMAIN      = 'chad-622.myshopify.com';
const STOREFRONT_TOKEN = 'cfed2819f4fda26e6be3560f1f4c9198';

export default function ProductPage() {
  const { handle } = useParams();
  const [product, setProduct]           = useState(null);
  const [selectedOptions, setSelectedOptions] = useState({});
  const [quantity, setQuantity]         = useState(1);
  const [loading, setLoading]           = useState(true);
  const [error, setError]               = useState('');

  useEffect(() => {
    let active = true;
    async function fetchProduct() {
      try {
        const res = await fetch(
          `https://${SHOP_DOMAIN}/api/2024-10/graphql.json`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'X-Shopify-Storefront-Access-Token': STOREFRONT_TOKEN
            },
            body: JSON.stringify({
              query: `
                query GetByHandle($handle: String!) {
                  productByHandle(handle: $handle) {
                    id
                    title
                    descriptionHtml
                    featuredImage { url altText }
                    options { name values }
                    variants(first: 250) {
                      edges { node {
                        id
                        selectedOptions { name value }
                        availableForSale
                        price { amount currencyCode }
                      } }
                    }
                    date: metafield(namespace: "event", key: "date") {
                      value
                    }
                    course: metafield(namespace: "event", key: "course") {
                      value
                    }
                    town: metafield(namespace: "event", key: "town") {
                      value
                    }
                    state: metafield(namespace: "event", key: "state") {
                      value
                    }
                  }
                }
              `,
              variables: { handle }
            })
          }
        );
        const { data, errors } = await res.json();
        if (!active) return;
        if (errors?.length) throw new Error(errors.map(e => e.message).join('; '));
        const p = data?.productByHandle;
        if (!p) throw new Error('Product not found');

        // init selectedOptions
        const init = {};
        p.options.forEach(opt => { init[opt.name] = opt.values[0]; });

        setSelectedOptions(init);
        setProduct(p);
      } catch (e) {
        if (active) setError(e.message);
      } finally {
        if (active) setLoading(false);
      }
    }
    fetchProduct();
    return () => { active = false };
  }, [handle]);

  if (loading) return <div className="product-page">Loading…</div>;
  if (error)   return <div className="product-page error">{error}</div>;

  // pull out metafield values
  const rawDate   = product.date?.value;
  const course    = product.course?.value;
  const town      = product.town?.value;
  const state     = product.state?.value;
  const formattedDate = rawDate
    ? new Date(rawDate).toLocaleDateString('en-US', {
        month: 'short', day: 'numeric', year: 'numeric'
      })
    : null;

  // find matching variant
  const variants = product.variants.edges.map(e => e.node);
  const selectedVariant = variants.find(v =>
    v.selectedOptions.every(
      ({ name, value }) => selectedOptions[name] === value
    )
  ) || variants[0];

  // format price
  const price = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: selectedVariant.price.currencyCode
  }).format(parseFloat(selectedVariant.price.amount));

  const handleOptionChange = (name, value) =>
    setSelectedOptions(prev => ({ ...prev, [name]: value }));

  return (
    <div className="product-page-container">
      {/* LEFT: IMAGE */}
      <div className="product-image-column">
        <img
          className="product-image"
          src={product.featuredImage?.url}
          alt={product.featuredImage?.altText || product.title}
        />
      </div>

      {/* RIGHT: INFO */}
      <div className="product-info-column">
        <h1 className="product-title">{product.title}</h1>

        {/* DATE | COURSE */}
        {(formattedDate || course) && (
          <div className="tournament-meta">
            <div className="tournament-date-course">
              {formattedDate}
              {formattedDate && course ? '  |  ' : ''}
              {course}
            </div>
            {(town || state) && (
              <div className="tournament-location">
                {town}{town && state ? ', ' : ''}{state}
              </div>
            )}
          </div>
        )}

        <div className="product-price">{price}</div>

        {/* OPTIONS */}
        {product.options.map(opt => (
          <div key={opt.name} className="option-group">
            <div className="option-label">
              {opt.name !== 'Title' ? opt.name : 'Choose'}
            </div>
            <div className="option-buttons">
              {opt.values.map(val => {
                if (val === 'Default Title') return null;
                const isActive = selectedOptions[opt.name] === val;
                if (opt.name.toLowerCase() === 'color') {
                  return (
                    <button
                      key={val}
                      className={`color-swatch ${isActive ? 'active' : ''}`}
                      style={{ backgroundColor: val }}
                      onClick={() => handleOptionChange(opt.name, val)}
                    />
                  );
                }
                return (
                  <button
                    key={val}
                    className={`option-button ${isActive ? 'active' : ''}`}
                    onClick={() => handleOptionChange(opt.name, val)}
                  >
                    {val}
                  </button>
                );
              })}
            </div>
          </div>
        ))}

        {/* ADD TO CART */}
        <button
          className="add-to-cart-button"
          disabled={!selectedVariant.availableForSale}
          onClick={() => alert(`Add ${quantity}× ${selectedVariant.id}`)}
        >
          {selectedVariant.availableForSale ? 'Add to Cart' : 'Sold Out'}
        </button>

        {/* SHOP PAY */}
        {selectedVariant.availableForSale && (
		  <button
			className="shop-pay-button"
			onClick={() => alert('Redirect to checkout')}
		  >
			Buy with <img src="/Shop-Pay-Logo-white.svg" alt="Shop Pay" />
		  </button>
		)}

        {/* DESCRIPTION */}
        <div
          className="product-description"
          dangerouslySetInnerHTML={{ __html: product.descriptionHtml }}
        />
      </div>
    </div>
  );
}

