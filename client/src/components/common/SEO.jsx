import React, { useEffect } from 'react';

const SEO = ({
  title,
  description,
  keywords,
  image,
  url,
  productSchema,
  articleSchema,
}) => {
  const siteTitle = 'Zoberry Enterprise';
  const defaultDescription = 'Shop best home & kitchen utility products, smart gadgets, organizers, easy home decor, and daily use problem solver essentials online at unbeatable prices on Zoberry Enterprise.';
  const defaultKeywords = 'home and kitchen utility products, smart kitchen gadgets, home decor online india, easy home decor, daily use utility items, kitchen organizers, cleaning essentials, household problem solver gadgets, smart living products, budget home improvement, kitchen accessories, buy home utilities online, Zoberry Enterprise';
  const defaultImage = 'https://www.zoberryenterprise.shop/zoberry_logo.png';
  const baseUrl = 'https://www.zoberryenterprise.shop';

  const fullTitle = title ? title + ' | ' + siteTitle : siteTitle + ' | Smart Living, Home & Kitchen Utility Products & Easy Decor';
  const metaDescription = description || defaultDescription;
  const metaKeywords = keywords || defaultKeywords;
  const metaImage = image ? (image.startsWith('http') ? image : baseUrl + image) : defaultImage;
  const canonicalUrl = url ? baseUrl + url : baseUrl;

  useEffect(() => {
    // 1. Update Title
    document.title = fullTitle;

    // 2. Helper to set/update meta tags
    const setMetaTag = (attr, key, content) => {
      let element = document.querySelector(`meta[${attr}="${key}"]`);
      if (!element) {
        element = document.createElement('meta');
        element.setAttribute(attr, key);
        document.head.appendChild(element);
      }
      element.setAttribute('content', content);
    };

    setMetaTag('name', 'description', metaDescription);
    setMetaTag('name', 'keywords', metaKeywords);
    setMetaTag('property', 'og:title', fullTitle);
    setMetaTag('property', 'og:description', metaDescription);
    setMetaTag('property', 'og:image', metaImage);
    setMetaTag('property', 'og:url', canonicalUrl);
    setMetaTag('name', 'twitter:title', fullTitle);
    setMetaTag('name', 'twitter:description', metaDescription);
    setMetaTag('name', 'twitter:image', metaImage);

    // 3. Update Canonical link
    let canonicalTag = document.querySelector('link[rel="canonical"]');
    if (!canonicalTag) {
      canonicalTag = document.createElement('link');
      canonicalTag.setAttribute('rel', 'canonical');
      document.head.appendChild(canonicalTag);
    }
    canonicalTag.setAttribute('href', canonicalUrl);

    // 4. Update Product JSON-LD Schema if provided
    let schemaScript = document.getElementById('dynamic-page-schema');
    if (productSchema || articleSchema) {
      if (!schemaScript) {
        schemaScript = document.createElement('script');
        schemaScript.id = 'dynamic-page-schema';
        schemaScript.type = 'application/ld+json';
        document.head.appendChild(schemaScript);
      }
      schemaScript.text = JSON.stringify(productSchema || articleSchema);
    } else if (schemaScript) {
      schemaScript.remove();
    }
  }, [fullTitle, metaDescription, metaKeywords, metaImage, canonicalUrl, productSchema, articleSchema]);

  return null;
};

export default SEO;
