// BlogList.jsx
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import './Blog.css';

const SHOP_DOMAIN       = 'chad-622.myshopify.com';
const STOREFRONT_TOKEN  = 'cfed2819f4fda26e6be3560f1f4c9198';
const BLOG_HANDLE       = 'walker-and-blais-blaze-through-the-field-on-way-to-victory';
const PAGE_SIZE         = 20;
const POSTS_CONFIG_URL  = '/posts.json';

// Default image overrides
const OVERRIDE_IMAGES = {
  'lfg-match-play-selection-show': '/logo-black.png',
  'levenson-wins-2024-lfg-title': '/logo-black.png',
  'memorial-day-odds': '/vegas-odds.png',
  'the-impact-fire-open-odds': '/vegas-odds.png'
};

export default function BlogList() {
  const [articles, setArticles]         = useState([]);
  const [cursor, setCursor]             = useState(null);
  const [hasNextPage, setHasNextPage]   = useState(false);
  const [loading, setLoading]           = useState(false);
  const [overrides, setOverrides]       = useState({});

  // Load per-article config from posts.json
  useEffect(() => {
    fetch(POSTS_CONFIG_URL)
      .then(r => r.ok ? r.json() : [])
      .then(list => {
        const map = {};
        list.forEach(item => {
          if (item.slug) map[item.slug] = item;
        });
        setOverrides(map);
      })
      .catch(err => console.error('Failed to load posts.json:', err));
  }, []);

  // Fetch a page of articles; if afterCursor is null it grabs the first batch
  const fetchArticles = async (afterCursor = null) => {
    setLoading(true);

    const query = `
      query BlogArticles($after: String) {
        blog(handle: "${BLOG_HANDLE}") {
          articles(first: ${PAGE_SIZE}, reverse: true, after: $after) {
            pageInfo { hasNextPage endCursor }
            edges { node { id title handle publishedAt contentHtml image { url altText } } }
          }
        }
      }
    `;

    try {
      const res = await fetch(`https://${SHOP_DOMAIN}/api/2024-10/graphql.json`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Shopify-Storefront-Access-Token': STOREFRONT_TOKEN
        },
        body: JSON.stringify({ query, variables: { after: afterCursor } })
      });
      const { data } = await res.json();
      const connection = data.blog.articles;
      const newEdges = connection.edges.map(e => e.node);

      setArticles(prev => afterCursor ? [...prev, ...newEdges] : newEdges);
      setCursor(connection.pageInfo.endCursor);
      setHasNextPage(connection.pageInfo.hasNextPage);
    } catch (err) {
      console.error('Failed to fetch articles:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchArticles(); }, []);

  // Strip HTML for excerpt
  const stripHtml = html => {
    const tmp = document.createElement('div');
    tmp.innerHTML = html;
    return tmp.textContent || tmp.innerText || '';
  };

  return (
    <div className="blog-list-wrapper">
      <div className="blog-list">
        {articles.map(article => {
          const config = overrides[article.handle] || {};

          // Determine image URL (override-image, then default overrides, then Shopify)
          const imgUrl = config['replacement-image']
            || OVERRIDE_IMAGES[article.handle]
            || article.image?.url;

          // Determine objectPosition
          const position = config['header-pos']
            ? `center ${config['header-pos']}`
            : 'center center';

          return (
            <article key={article.id} className="blog-card">
              {imgUrl && (
                <img
                  src={imgUrl}
                  alt={article.image?.altText || article.title}
                  className="blog-card-image"
                  style={{ objectPosition: position }}
                />
              )}

              <div className="blog-card-body">
                <h2 className="blog-card-title">
                  <Link to={`/blog/${article.handle}`}>{article.title}</Link>
                </h2>

                <p className="blog-card-excerpt">
                  {stripHtml(article.contentHtml).slice(0, 200).trim()}…
                </p>

                <Link to={`/blog/${article.handle}`} className="blog-card-readmore">
                  Read More →
                </Link>
              </div>
            </article>
          );
        })}
      </div>

      {hasNextPage && (
        <button
          className="load-more-button"
          onClick={() => fetchArticles(cursor)}
          disabled={loading}
        >
          {loading ? 'Loading…' : 'Load More'}
        </button>
      )}
    </div>
  );
}

