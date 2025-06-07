import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import './ProductPage.css';

const SHOP_DOMAIN = 'chad-622.myshopify.com';
const STOREFRONT_TOKEN = 'cfed2819f4fda26e6be3560f1f4c9198';

export default function ProductPage() {
  const { handle } = useParams();
  const [product, setProduct] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [selectedVariantId, setSelectedVariantId] = useState(null);

  useEffect(() => {
    async function fetchProduct() {
      const res = await fetch(`https://${SHOP_DOMAIN}/api/2024-10/graphql.json`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Shopify-Storefront-Access-Token': STOREFRONT_TOKEN,
        },
        body: JSON.stringify({
          query: `
            query GetProductByHandle($handle: String!) {
              productByHandle(handle: $handle) {
                id
                title
                descriptionHtml
                featuredImage {
                  url
                  altText
                }
                variants(first: 10) {
                  edges {
                    node {
                      id
                      title
                      availableForSale
                      price {
                        amount
                        currencyCode
                      }
                    }
                  }
                }
              }
            }
          `,
          variables: { handle },
        }),
      });

      const json = await res.json();
      const p = json.data.productByHandle;
      if (p) {
        setProduct(p);
        const defaultVariant = p.variants.edges[0]?.node;
        setSelectedVariantId(defaultVariant?.id);
      }
    }

    fetchProduct();
  }, [handle]);

  if (!product) return <div className="product-page">Loading...</div>;

  const variants = product.variants.edges.map((edge) => edge.node);
  const selectedVariant = variants.find((v) => v.id === selectedVariantId);

  return (
    <div className="product-page-container">
      <div className="product-image-column">
        <img
          src={product.featuredImage?.url}
          alt={product.featuredImage?.altText || product.title}
          className="product-image"
        />
      </div>
      <div className="product-info-column">
        <h1 className="product-title">{product.title}</h1>
        <div className="product-price">
          ${selectedVariant?.price.amount} {selectedVariant?.price.currencyCode}
        </div>

        {variants.length > 1 && (
          <select
            className="variant-select"
            value={selectedVariantId}
            onChange={(e) => setSelectedVariantId(e.target.value)}
          >
            {variants.map((variant) => (
              <option key={variant.id} value={variant.id}>
                {variant.title}
              </option>
            ))}
          </select>
        )}

        <div className="quantity-wrapper">
          <label htmlFor="quantity">Quantity</label>
          <input
            id="quantity"
            type="number"
            min="1"
            value={quantity}
            onChange={(e) => setQuantity(Number(e.target.value))}
          />
        </div>

        <button className="add-to-cart-button" onClick={() => alert('Add to cart logic here')}>
          Add to Cart
        </button>

        <button className="shop-pay-button" onClick={() => alert('Redirect to checkout')}>
          Buy with
          <img src="/Shop-Pay-Logo-white.svg" alt="Shop Pay" />
        </button>

        <div
          className="product-description"
          dangerouslySetInnerHTML={{ __html: product.descriptionHtml }}
        />
      </div>
    </div>
  );
}

