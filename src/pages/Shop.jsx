import React, { useState, useEffect } from 'react';
import { Link }                         from 'react-router-dom';
import './Shop.css';

const SHOP_DOMAIN      = 'chad-622.myshopify.com';
const STOREFRONT_TOKEN = 'cfed2819f4fda26e6be3560f1f4c9198';
const COLLECTION_HANDLE = 'lfg-gear';

export default function ShopPage() {
  const [products, setProducts] = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [error,    setError]    = useState(null);

  useEffect(() => {
    async function fetchProducts() {
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
                query CollectionProducts($handle: String!) {
                  collectionByHandle(handle: $handle) {
                    title
                    products(first: 250) {
                      edges {
                        node {
                          id
                          title
                          handle
                          featuredImage { url altText }
                          priceRange {
                            minVariantPrice { amount currencyCode }
                          }
                        }
                      }
                    }
                  }
                }
              `,
              variables: { handle: COLLECTION_HANDLE }
            })
          }
        );

        const { data, errors } = await res.json();
        if (errors?.length) throw new Error(errors.map(e => e.message).join(', '));

        const edges = data.collectionByHandle?.products.edges || [];
        setProducts(edges.map(e => e.node));
      } catch (e) {
        setError(e.message);
      } finally {
        setLoading(false);
      }
    }

    fetchProducts();
  }, []);

  if (loading) return <div className="shop-page">Loading…</div>;
  if (error)   return <div className="shop-page error">{error}</div>;

  return (
    <div className="shop-page">
      <h1 className="shop-title">LFG Gear</h1>
      <div className="product-grid">
        {products.map(product => {
          const price = new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: product.priceRange.minVariantPrice.currencyCode
          }).format(parseFloat(product.priceRange.minVariantPrice.amount));

          return (
            <div key={product.id} className="product-card">
              <Link to={`/listing/${product.handle}`} className="product-card-link">
                <img
                  src={product.featuredImage?.url}
                  alt={product.featuredImage?.altText || product.title}
                  className="product-card-image"
                />
                <h2 className="product-card-title">{product.title}</h2>
                <div className="product-card-price">{price}</div>
              </Link>
            </div>
          );
        })}
      </div>
    </div>
  );
}

