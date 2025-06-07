// BlogPost.jsx
import React, { useState, useEffect } from 'react';
import { useParams }             from 'react-router-dom';
import './BlogPost.css';

const SHOP_DOMAIN       = 'chad-622.myshopify.com';
const STOREFRONT_TOKEN = 'cfed2819f4fda26e6be3560f1f4c9198';
const BLOG_HANDLE      = 'walker-and-blais-blaze-through-the-field-on-way-to-victory';
const POSTS_CONFIG_URL = '/posts.json';

export default function BlogPost() {
  const { slug } = useParams();
  const [article, setArticle] = useState(null);
  const [config,  setConfig]  = useState({});
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState(null);

  useEffect(() => {
    let isActive = true;

    async function load() {
      try {
        // ─── 1) Load overrides config ─────────────────────────────
        const respConfig = await fetch(POSTS_CONFIG_URL);
        const rawList    = respConfig.ok ? await respConfig.json() : [];
        console.log('posts.json:', rawList);
        console.log('URL slug:', slug);

        const matched = rawList.find(item => item.slug === slug) || {};
        console.log('matched config:', matched);
        if (!isActive) return;
        setConfig(matched);

        // ─── 2) Load the Shopify article ──────────────────────────
        const respGQL = await fetch(
          `https://${SHOP_DOMAIN}/api/2025-07/graphql.json`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'X-Shopify-Storefront-Access-Token': STOREFRONT_TOKEN
            },
            body: JSON.stringify({
              query: `
                query BlogPost($blogHandle: String!, $articleHandle: String!) {
                  blogByHandle(handle: $blogHandle) {
                    articleByHandle(handle: $articleHandle) {
                      id
                      title
                      handle
                      publishedAt
                      contentHtml
                      image { url altText }
                      authorV2 { name }
                    }
                  }
                }
              `,
              variables: {
                blogHandle:    BLOG_HANDLE,
                articleHandle: slug
              }
            })
          }
        );
        const json = await respGQL.json();
        console.log('GraphQL response:', json);

        const fetched = json?.data?.blogByHandle?.articleByHandle;
        if (!isActive) return;

        if (fetched) {
          setArticle(fetched);
        } else {
          setError('Post not found');
        }
      } catch (err) {
        if (isActive) setError(err.message);
      } finally {
        if (isActive) setLoading(false);
      }
    }

    load();
    return () => { isActive = false; };
  }, [slug]);

  if (loading) return <div className="blog-post">Loading…</div>;
  if (error)   return <div className="blog-post error">{error}</div>;

  // ─── determine image URL & objectPosition ───────────────────
  const imgUrl = config['replacement-image'] || article.image?.url;
  const pos    = config['header-pos']
    ? `center ${config['header-pos']}`
    : 'center center';

  return (
    <article className="blog-post">
    {imgUrl && (
        <img
          className="blog-post-image"
          src={imgUrl}
          alt={article.image?.altText || article.title}
          style={{ objectPosition: pos }}
        />
      )}
      <h1 className="blog-post-title">{article.title}</h1>
      <div className="blog-post-meta">
        {new Date(article.publishedAt).toLocaleDateString()}
      </div>

      <div
        className="blog-post-content"
        dangerouslySetInnerHTML={{ __html: article.contentHtml }}
      />
    </article>
  );
}

