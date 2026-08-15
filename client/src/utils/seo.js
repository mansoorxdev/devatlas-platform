/**
 * Construct full environment-aware absolute URLs for canonical links and OpenGraph images.
 */
export function getSeoMetadata({
  title,
  description,
  path = '',
  type = 'website',
  image = '/og-image.png',
}) {
  const rawBaseUrl = import.meta.env.VITE_CLIENT_URL || (typeof window !== 'undefined' ? window.location.origin : '');
  const baseUrl = rawBaseUrl.replace(/\/$/, '');
  const canonicalUrl = `${baseUrl}${path.startsWith('/') ? path : '/' + path}`;
  const imageUrl = image.startsWith('http') ? image : `${baseUrl}${image.startsWith('/') ? image : '/' + image}`;

  return {
    title,
    description,
    canonicalUrl,
    type,
    imageUrl,
  };
}
