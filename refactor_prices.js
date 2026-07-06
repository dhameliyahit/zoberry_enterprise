const fs = require('fs');
const path = require('path');

const basePath = "e:/work/zoberry/zoberry_enterprise";

const replaceInFile = (filePath, replacements) => {
  const fullPath = path.join(basePath, filePath);
  if (!fs.existsSync(fullPath)) {
    console.log(`File not found: ${fullPath}`);
    return;
  }
  let content = fs.readFileSync(fullPath, 'utf8');
  replacements.forEach(r => {
    content = content.replace(r.search, r.replace);
  });
  fs.writeFileSync(fullPath, content, 'utf8');
  console.log(`Updated: ${filePath}`);
};

// 1. ProductItem.tsx
replaceInFile("src/components/Common/ProductItem.tsx", [
  {
    search: /const discount = item\.price && item\.discountedPrice\n\s*\? Math\.round\(\(\(item\.price - item\.discountedPrice\) \/ item\.price\) \* 100\)\n\s*: 0;/g,
    replace: `const discount = item.compareAtPrice && item.compareAtPrice > item.price\n    ? Math.round(((item.compareAtPrice - item.price) / item.compareAtPrice) * 100)\n    : 0;`
  },
  {
    search: /<span className="text-dark">₹\{item\.discountedPrice\}<\/span>/g,
    replace: `<span className="text-dark">₹{item.price}</span>`
  },
  {
    search: /\{item\.price !== item\.discountedPrice && \(/g,
    replace: `{item.compareAtPrice && item.compareAtPrice > item.price && (`
  },
  {
    search: /<span className="text-dark-4 line-through text-sm">₹\{item\.price\}<\/span>/g,
    replace: `<span className="text-dark-4 line-through text-sm">₹{item.compareAtPrice}</span>`
  }
]);

// 2. BestSeller/SingleItem.tsx
replaceInFile("src/components/Home/BestSeller/SingleItem.tsx", [
  {
    search: /const discount = item\.price && item\.discountedPrice\n\s*\? Math\.round\(\(\(item\.price - item\.discountedPrice\) \/ item\.price\) \* 100\)\n\s*: 0;/g,
    replace: `const discount = item.compareAtPrice && item.compareAtPrice > item.price\n    ? Math.round(((item.compareAtPrice - item.price) / item.compareAtPrice) * 100)\n    : 0;`
  },
  {
    search: /<span className="text-dark">₹\{item\.discountedPrice\}<\/span>/g,
    replace: `<span className="text-dark">₹{item.price}</span>`
  },
  {
    search: /\{item\.price !== item\.discountedPrice && \(/g,
    replace: `{item.compareAtPrice && item.compareAtPrice > item.price && (`
  },
  {
    search: /<span className="text-dark-4 line-through text-sm">₹\{item\.price\}<\/span>/g,
    replace: `<span className="text-dark-4 line-through text-sm">₹{item.compareAtPrice}</span>`
  }
]);

// 3. ShopDetails/index.tsx
replaceInFile("src/components/ShopDetails/index.tsx", [
  {
    search: /const displayPrice = selectedVariant\?\.price \?\? product\.discountedPrice \?\? product\.price;/g,
    replace: `const displayPrice = selectedVariant?.price ?? product.price;`
  },
  {
    search: /\{product\.price > product\.discountedPrice && \(/g,
    replace: `{product.compareAtPrice && product.compareAtPrice > product.price && (`
  },
  {
    search: /\{Math\.round\(\(\(product\.price - product\.discountedPrice\) \/ product\.price\) \* 100\)\}% OFF/g,
    replace: `{Math.round(((product.compareAtPrice - product.price) / product.compareAtPrice) * 100)}% OFF`
  },
  {
    search: /Sales \{product\.price > product\.discountedPrice \? Math\.round\(\(\(product\.price - product\.discountedPrice\) \/ product\.price\) \* 100\) : 30\}% Off Use Code: PROMO\{product\.price > product\.discountedPrice \? Math\.round\(\(\(product\.price - product\.discountedPrice\) \/ product\.price\) \* 100\) : 30\}/g,
    replace: `Sales {product.compareAtPrice && product.compareAtPrice > product.price ? Math.round(((product.compareAtPrice - product.price) / product.compareAtPrice) * 100) : 30}% Off Use Code: PROMO{product.compareAtPrice && product.compareAtPrice > product.price ? Math.round(((product.compareAtPrice - product.price) / product.compareAtPrice) * 100) : 30}`
  }
]);

// 4. QuickViewModal.tsx
replaceInFile("src/components/Common/QuickViewModal.tsx", [
  {
    search: /\{product\?\.price > product\?\.discountedPrice && \(/g,
    replace: `{product?.compareAtPrice && product?.compareAtPrice > product?.price && (`
  },
  {
    search: /\{Math\.round\(\(\(product\.price - product\.discountedPrice\) \/ product\.price\) \* 100\)\}% OFF/g,
    replace: `{Math.round(((product.compareAtPrice - product.price) / product.compareAtPrice) * 100)}% OFF`
  },
  {
    search: /₹\{product\?\.discountedPrice\}/g,
    replace: `₹{product?.price}`
  },
  {
    search: /<span className="text-sm font-medium text-gray-4 line-through">\s*₹\{product\?\.price\}\s*<\/span>/g,
    replace: `<span className="text-sm font-medium text-gray-4 line-through">\\n                      {product?.compareAtPrice && product?.compareAtPrice > product?.price && "₹" + product?.compareAtPrice}\\n                    </span>`
  }
]);

// 5. Shop/SingleGridItem.tsx
replaceInFile("src/components/Shop/SingleGridItem.tsx", [
  {
    search: /<span className="text-dark">₹\{item\.discountedPrice\}<\/span>/g,
    replace: `<span className="text-dark">₹{item.price}</span>`
  },
  {
    search: /\{item\.price !== item\.discountedPrice && \(/g,
    replace: `{item.compareAtPrice && item.compareAtPrice > item.price && (`
  },
  {
    search: /<span className="text-dark-4 line-through text-sm">₹\{item\.price\}<\/span>/g,
    replace: `<span className="text-dark-4 line-through text-sm">₹{item.compareAtPrice}</span>`
  }
]);

// 6. Shop/SingleListItem.tsx
replaceInFile("src/components/Shop/SingleListItem.tsx", [
  {
    search: /<span className="text-dark">₹\{item\.discountedPrice\}<\/span>/g,
    replace: `<span className="text-dark">₹{item.price}</span>`
  },
  {
    search: /\{item\.price !== item\.discountedPrice && \(/g,
    replace: `{item.compareAtPrice && item.compareAtPrice > item.price && (`
  },
  {
    search: /<span className="text-dark-4 line-through text-sm">₹\{item\.price\}<\/span>/g,
    replace: `<span className="text-dark-4 line-through text-sm">₹{item.compareAtPrice}</span>`
  }
]);

// 7. Cart/SingleItem.tsx
replaceInFile("src/components/Cart/SingleItem.tsx", [
  {
    search: /<p className="text-dark">₹\{item\.discountedPrice\}<\/p>/g,
    replace: `<p className="text-dark">₹{item.price}</p>`
  },
  {
    search: /<p className="text-dark">₹\{item\.discountedPrice \* quantity\}<\/p>/g,
    replace: `<p className="text-dark">₹{item.price * quantity}</p>`
  }
]);

// 8. CartSidebarModal/SingleItem.tsx
replaceInFile("src/components/Common/CartSidebarModal/SingleItem.tsx", [
  {
    search: /<p className="text-custom-sm mb-2">Price: ₹\{item\.discountedPrice\}<\/p>/g,
    replace: `<p className="text-custom-sm mb-2">Price: ₹{item.price}</p>`
  }
]);

// 9. Wishlist/SingleItem.tsx
replaceInFile("src/components/Wishlist/SingleItem.tsx", [
  {
    search: /<p className="text-dark">₹\{item\.discountedPrice\}<\/p>/g,
    replace: `<p className="text-dark">₹{item.price}</p>`
  }
]);

// 10. OrderSummary.tsx
replaceInFile("src/components/Cart/OrderSummary.tsx", [
  {
    search: /₹\{item\.discountedPrice \* item\.quantity\}/g,
    replace: `₹{item.price * item.quantity}`
  }
]);

// 11. Checkout/index.tsx (bonus)
replaceInFile("src/components/Checkout/index.tsx", [
  {
    search: /price: item\.discountedPrice !== null && item\.discountedPrice !== undefined \? item\.discountedPrice : item\.price,/g,
    replace: `price: item.price,`
  },
  {
    search: /item\.discountedPrice !== null &&\s*item\.discountedPrice !== undefined\s*\? item\.discountedPrice\s*: item\.price/g,
    replace: `item.price`
  }
]);

// 12. usePopulatedCart.ts (bonus)
replaceInFile("src/hooks/usePopulatedCart.ts", [
  {
    search: /const itemPrice = item\.discountedPrice !== undefined && item\.discountedPrice !== null \? item\.discountedPrice : item\.price;/g,
    replace: `const itemPrice = item.price;`
  }
]);

