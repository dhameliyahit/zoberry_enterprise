const fs = require('fs');
const path = require('path');
const { ProductModel, CategoryModel } = require('../models');

// Bot User Agents
const BOT_USER_AGENTS = [
  'googlebot', 'bingbot', 'yandexbot', 'duckduckbot', 'slurp',
  'baiduspider', 'facebot', 'facebookexternalhit', 'twitterbot',
  'rogerbot', 'linkedinbot', 'embedly', 'quora link preview',
  'showyoubot', 'outbrain', 'pinterest', 'slackbot', 'vkShare',
  'w3c_validator', 'whatsapp'
];

function isBot(userAgent = '') {
  const ua = userAgent.toLowerCase();
  return BOT_USER_AGENTS.some(bot => ua.includes(bot));
}

// Generate dynamic sitemap.xml
async function generateSitemapXml(baseUrl = 'https://www.zoberryenterprise.shop') {
  try {
    const products = await ProductModel.findAll({
      where: { isActive: true },
      attributes: ['slug', 'updatedAt']
    });

    const categories = await CategoryModel.findAll({
      attributes: ['slug', 'updatedAt']
    });

    let xml = `<?xml version="1.0" encoding="UTF-8"?>\n`;
    xml += `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n`;

    // Static pages
    const staticPages = [
      { path: '', priority: '1.0', changefreq: 'daily' },
      { path: '/products', priority: '0.9', changefreq: 'daily' },
      { path: '/about', priority: '0.7', changefreq: 'monthly' },
      { path: '/contact', priority: '0.7', changefreq: 'monthly' }
    ];

    staticPages.forEach(p => {
      xml += `  <url>\n    <loc>${baseUrl}${p.path}</loc>\n    <changefreq>${p.changefreq}</changefreq>\n    <priority>${p.priority}</priority>\n  </url>\n`;
    });

    // Categories
    categories.forEach(cat => {
      xml += `  <url>\n    <loc>${baseUrl}/products?category=${cat.slug}</loc>\n    <changefreq>weekly</changefreq>\n    <priority>0.8</priority>\n  </url>\n`;
    });

    // Products
    products.forEach(prod => {
      const lastMod = prod.updatedAt ? new Date(prod.updatedAt).toISOString().split('T')[0] : new Date().toISOString().split('T')[0];
      xml += `  <url>\n    <loc>${baseUrl}/product/${prod.slug}</loc>\n    <lastmod>${lastMod}</lastmod>\n    <changefreq>daily</changefreq>\n    <priority>0.9</priority>\n  </url>\n`;
    });

    xml += `</urlset>`;
    return xml;
  } catch (err) {
    console.error('Error generating sitemap:', err);
    return null;
  }
}

// Render dynamic metadata into index.html
async function renderHtmlWithSSRMeta(req, defaultHtml) {
  const baseUrl = 'https://www.zoberryenterprise.shop';
  const urlPath = req.path;
  const userAgent = req.headers['user-agent'] || '';
  const botRequest = isBot(userAgent);

  let title = 'Zoberry Enterprise | Smart Living, Home & Kitchen Utility Products & Easy Decor';
  let description = 'Shop best home & kitchen utility products, smart gadgets, organizers, easy home decor, and daily use problem solver essentials online at unbeatable prices.';
  let image = `${baseUrl}/zoberry_logo.png`;
  let canonicalUrl = `${baseUrl}${urlPath}`;
  let extraSchema = '';
  let botContentHtml = '';

  // Check if product detail route: /product/:slug
  if (urlPath.startsWith('/product/')) {
    const slug = urlPath.replace('/product/', '').split('/')[0];
    try {
      const product = await ProductModel.findOne({
        where: { slug },
        include: [{ model: CategoryModel, as: 'category' }]
      });

      if (product) {
        title = `${product.name} | Zoberry Enterprise`;
        description = product.shortDescription || product.description || `Buy ${product.name} online at best price on Zoberry Enterprise. High quality home and kitchen utility essentials.`;
        
        if (product.images && product.images.length > 0) {
          const firstImg = product.images[0];
          image = firstImg.startsWith('http') ? firstImg : `${baseUrl}${firstImg}`;
        }

        // Generate Structured Data Schema for Google Product Rich Snippets
        const productSchema = {
          "@context": "https://schema.org/",
          "@type": "Product",
          "name": product.name,
          "image": product.images || [],
          "description": description,
          "sku": `ZB-${product.id}`,
          "brand": {
            "@type": "Brand",
            "name": "Zoberry Enterprise"
          },
          "offers": {
            "@type": "Offer",
            "url": canonicalUrl,
            "priceCurrency": "INR",
            "price": product.price,
            "availability": product.stockQuantity > 0 ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
            "seller": {
              "@type": "Organization",
              "name": "Zoberry Enterprise"
            }
          }
        };

        if (product.productVideoUrl) {
          productSchema.video = {
            "@type": "VideoObject",
            "name": `${product.name} Demonstration`,
            "description": `Watch ${product.name} in action`,
            "contentUrl": product.productVideoUrl,
            "uploadDate": product.createdAt || new Date().toISOString()
          };
        }

        extraSchema = `<script type="application/ld+json">${JSON.stringify(productSchema)}</script>`;

        // If a crawler/bot is scraping, inject rich semantic HTML into root
        if (botRequest) {
          botContentHtml = `
            <div style="font-family: sans-serif; padding: 20px;">
              <h1>${product.name}</h1>
              <p><strong>Category:</strong> ${product.category?.name || 'Home & Kitchen'}</p>
              <p><strong>Price:</strong> ₹${product.price} ${product.compareAtPrice ? `(MRP: ₹${product.compareAtPrice})` : ''}</p>
              <p><strong>Availability:</strong> ${product.stockQuantity > 0 ? 'In Stock' : 'Out of Stock'}</p>
              <p>${product.shortDescription || ''}</p>
              <div>${product.description || ''}</div>
              ${product.images ? product.images.map(img => `<img src="${img}" alt="${product.name}" width="300" />`).join('') : ''}
            </div>
          `;
        }
      }
    } catch (err) {
      console.error('SSR product lookup error:', err);
    }
  }

  // Replace Title & Meta Tags in HTML
  let html = defaultHtml;
  
  // Replace <title>...</title>
  html = html.replace(/<title>.*?<\/title>/i, `<title>${title}</title>`);
  
  // Replace or inject meta description
  if (html.includes('<meta name="description"')) {
    html = html.replace(/<meta name="description" content=".*?" \/>/i, `<meta name="description" content="${description}" />`);
  }
  
  // Replace OG Tags
  html = html.replace(/<meta property="og:title" content=".*?" \/>/i, `<meta property="og:title" content="${title}" />`);
  html = html.replace(/<meta property="og:description" content=".*?" \/>/i, `<meta property="og:description" content="${description}" />`);
  html = html.replace(/<meta property="og:image" content=".*?" \/>/i, `<meta property="og:image" content="${image}" />`);
  html = html.replace(/<meta property="og:url" content=".*?" \/>/i, `<meta property="og:url" content="${canonicalUrl}" />`);
  
  // Replace Twitter Tags
  html = html.replace(/<meta name="twitter:title" content=".*?" \/>/i, `<meta name="twitter:title" content="${title}" />`);
  html = html.replace(/<meta name="twitter:description" content=".*?" \/>/i, `<meta name="twitter:description" content="${description}" />`);
  html = html.replace(/<meta name="twitter:image" content=".*?" \/>/i, `<meta name="twitter:image" content="${image}" />`);

  // Inject Schema before </head>
  if (extraSchema) {
    html = html.replace('</head>', `${extraSchema}\n</head>`);
  }

  // Inject bot preview if requested by bot
  if (botContentHtml) {
    html = html.replace('<div id="root"></div>', `<div id="root">${botContentHtml}</div>`);
  }

  return html;
}

module.exports = {
  isBot,
  generateSitemapXml,
  renderHtmlWithSSRMeta
};
