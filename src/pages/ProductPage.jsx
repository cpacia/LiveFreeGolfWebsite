// pages/ProductPage.jsx
import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { useCart } from "../context/CartContext";
import "./ProductPage.css";

const SHOP_DOMAIN = "checkout.livefreegolf.com";
const STOREFRONT_TOKEN = "cfed2819f4fda26e6be3560f1f4c9198";

export default function ProductPage() {
  const { handle } = useParams();
  const { addItem } = useCart();
  const [product, setProduct] = useState(null);
  const [mainImage, setMainImage] = useState("");
  const [selectedOptions, setSelectedOptions] = useState({});
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const handleBuyNow = async () => {
    // build the single‐item lines array
    const lines = [
      {
        merchandiseId: selectedVariant.id, // must be the GID string
        quantity: quantity,
      },
    ];

    const mutation = `
     mutation cartCreate($input: CartInput!) {
       cartCreate(input: $input) {
         cart { checkoutUrl }
         userErrors { field message }
       }
     }
   `;

    const res = await fetch(`https://${SHOP_DOMAIN}/api/2024-10/graphql.json`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Shopify-Storefront-Access-Token": STOREFRONT_TOKEN,
      },
      body: JSON.stringify({
        query: mutation,
        variables: { input: { lines } },
      }),
    });

    const { data, errors } = await res.json();
    if (errors?.length || data.cartCreate.userErrors.length) {
      console.error("Cart API error", errors, data.cartCreate.userErrors);
      return;
    }

    // drop into Shopify’s hosted checkout (Shop Pay will be front-and-center)
    window.location.href = data.cartCreate.cart.checkoutUrl;
  };

  useEffect(() => {
    let active = true;
    async function fetchProduct() {
      try {
        const res = await fetch(
          `https://${SHOP_DOMAIN}/api/2024-10/graphql.json`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "X-Shopify-Storefront-Access-Token": STOREFRONT_TOKEN,
            },
            body: JSON.stringify({
              query: `query GetByHandle($handle: String!) { productByHandle(handle: $handle) { id title descriptionHtml images(first:10) { edges { node { url altText } } } featuredImage { url altText } options { name values } variants(first:250) { edges { node { id selectedOptions { name value } availableForSale price { amount currencyCode } } } } date: metafield(namespace: "event", key: "date") { value } course: metafield(namespace: "event", key: "course") { value } town: metafield(namespace: "event", key: "town") { value } state: metafield(namespace: "event", key: "state") { value } } }`,
              variables: { handle },
            }),
          },
        );
        const { data, errors } = await res.json();
        if (!active) return;
        if (errors?.length)
          throw new Error(errors.map((e) => e.message).join("; "));
        const p = data?.productByHandle;
        if (!p) throw new Error("Product not found");

        // initialize options & image
        const init = {};
        p.options.forEach((opt) => (init[opt.name] = opt.values[0]));
        setSelectedOptions(init);
        setMainImage(p.featuredImage?.url || p.images.edges[0]?.node.url);
        setProduct(p);
      } catch (e) {
        if (active) setError(e.message);
      } finally {
        if (active) setLoading(false);
      }
    }
    fetchProduct();
    return () => {
      active = false;
    };
  }, [handle]);

  if (loading) return <div className="product-page">Loading…</div>;
  if (error) return <div className="product-page error">{error}</div>;

  // format data
  const rawDate = product.date?.value;
  const formattedDate = rawDate
  ? new Date(
      ...rawDate.split("-").map((v, i) => (i === 1 ? parseInt(v) - 1 : parseInt(v)))
    ).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    })
  : null;
  const variants = product.variants.edges.map((e) => e.node);
  const selectedVariant =
    variants.find((v) =>
      v.selectedOptions.every(
        ({ name, value }) => selectedOptions[name] === value,
      ),
    ) || variants[0];
  const priceAmount = parseFloat(selectedVariant.price.amount);
  const price = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: selectedVariant.price.currencyCode,
  }).format(priceAmount);

  // handlers
  const handleOptionChange = (name, value) =>
    setSelectedOptions((prev) => ({ ...prev, [name]: value }));
  const onAddToCart = () => {
    addItem(
      {
        id: selectedVariant.id, // used for de-duping in your context
        variantId: selectedVariant.id,
        title: product.title,
        price: priceAmount,
        image: mainImage,
      },
      quantity,
    );
  };

  return (
    <div className="product-page-container">
      {/* left: images */}
      <div className="product-image-column">
        <img className="product-image" src={mainImage} alt={product.title} />
        <div className="thumbnail-list">
          {product.images.edges.map(({ node }, idx) => (
            <button
              key={idx}
              className={`thumbnail-item ${mainImage === node.url ? "active" : ""}`}
              onClick={() => setMainImage(node.url)}
            >
              <img
                src={node.url}
                alt={node.altText || `${product.title} ${idx + 1}`}
              />
            </button>
          ))}
        </div>
      </div>

      {/* right: info */}
      <div className="product-info-column">
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

        <div className="product-price">{price}</div>

        {/* options */}
        {product.options.map((opt) => (
          <div key={opt.name} className="option-group">
            {opt?.name ? (
              <div className="option-label">
                {opt.name === "TITLE" ? "Choose" : ""}
              </div>
            ) : null}
            <div className="option-buttons">
              {opt.values.map((val) => {
                if (val === "Default Title") return null;
                const isActive = selectedOptions[opt.name] === val;
                if (opt.name.toLowerCase() === "color") {
                  return (
                    <button
                      key={val}
                      className={`color-swatch ${isActive ? "active" : ""}`}
                      style={{ backgroundColor: val }}
                      onClick={() => handleOptionChange(opt.name, val)}
                    />
                  );
                }
                return (
                  <button
                    key={val}
                    className={`option-button ${isActive ? "active" : ""}`}
                    onClick={() => handleOptionChange(opt.name, val)}
                  >
                    {val}
                  </button>
                );
              })}
            </div>
          </div>
        ))}

        {/* add to cart */}
        <button
          className="add-to-cart-button"
          disabled={!selectedVariant.availableForSale}
          onClick={onAddToCart}
        >
          {selectedVariant.availableForSale ? "Add to Cart" : "Sold Out"}
        </button>

        {/* shop pay */}
        {selectedVariant.availableForSale && (
          <button className="shop-pay-button" onClick={handleBuyNow}>
            Buy with <img src="/Shop-Pay-Logo-white.svg" alt="Shop Pay" />
          </button>
        )}

        {/* description */}
        <div
          className="product-description"
          dangerouslySetInnerHTML={{ __html: product.descriptionHtml }}
        />
      </div>
    </div>
  );
}
