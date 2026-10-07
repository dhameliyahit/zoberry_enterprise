/**
 * Universal helper to resolve image URLs for local development and live production.
 * If the image is a full URL (https://...), it is returned as is.
 * Otherwise, it prefixes with the appropriate domain (localhost:9000 in dev, https://zoberryenterprise.shop in prod).
 */
export const getImageUrl = (imagePath) => {
  if (!imagePath) return 'https://placehold.co/600x600?text=No+Image';
  
  if (imagePath.startsWith('http://') || imagePath.startsWith('https://') || imagePath.startsWith('data:')) {
    return imagePath;
  }

  const baseUrl = import.meta.env.VITE_API_URL || (import.meta.env.PROD ? 'https://zoberryenterprise.shop' : 'http://localhost:9000');
  const cleanBase = baseUrl.endsWith('/') ? baseUrl.slice(0, -1) : baseUrl;
  const cleanPath = imagePath.startsWith('/') ? imagePath : `/${imagePath}`;

  return `${cleanBase}${cleanPath}`;
};

export default getImageUrl;
