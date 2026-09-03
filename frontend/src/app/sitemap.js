export default async function sitemap() {
  const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000').replace(/\/$/, '');
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

  const staticRoutes = [
    {
      url: `${siteUrl}`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1.0,
    },
    {
      url: `${siteUrl}/shop`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.9,
    },
    {
      url: `${siteUrl}/login`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.5,
    },
    {
      url: `${siteUrl}/register`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.5,
    },
    {
      url: `${siteUrl}/forgot-password`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.3,
    },
  ];

  let productRoutes = [];
  try {
    const res = await fetch(`${apiUrl}/products`, { next: { revalidate: 3600 } });
    if (res.ok) {
      const products = await res.json();
      if (Array.isArray(products)) {
        productRoutes = products.map((p) => ({
          url: `${siteUrl}/shop/${p.id}`,
          lastModified: p.updatedAt ? new Date(p.updatedAt) : new Date(),
          changeFrequency: 'weekly',
          priority: 0.8,
        }));
      }
    }
  } catch {
    // Graceful fallback if backend is unavailable during static site generation
    productRoutes = [];
  }

  return [...staticRoutes, ...productRoutes];
}

