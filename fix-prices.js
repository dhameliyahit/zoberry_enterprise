const fs = require('fs');
const path = require('path');

const filesToFix = [
  "src/components/Wishlist/SingleItem.tsx",
  "src/components/Shop/SingleGridItem.tsx",
  "src/components/Shop/SingleListItem.tsx",
  "src/components/Home/BestSeller/SingleItem.tsx",
  "src/components/Cart/SingleItem.tsx",
  "src/components/Common/CartSidebarModal/SingleItem.tsx",
  "src/components/Common/ProductItem.tsx",
];

const basePath = "e:/work/zoberry/zoberry_enterprise";

filesToFix.forEach(file => {
  const filePath = path.join(basePath, file);
  if (fs.existsSync(filePath)) {
    let content = fs.readFileSync(filePath, 'utf8');
    
    // Replace ₹{item.discountedPrice} with ₹{item.discountedPrice ?? item.price}
    content = content.replace(/₹\{item\.discountedPrice\}/g, '₹{item.discountedPrice ?? item.price}');
    
    // Replace {item.price !== item.discountedPrice && ( with {item.discountedPrice != null && item.price !== item.discountedPrice && (
    content = content.replace(/\{item\.price !== item\.discountedPrice && \(/g, '{item.discountedPrice != null && item.price !== item.discountedPrice && (');

    // For QuickViewModal and others that might use product instead of item
    content = content.replace(/₹\{product\?\.discountedPrice\}/g, '₹{product?.discountedPrice ?? product?.price}');
    content = content.replace(/\{product\?\.price > product\?\.discountedPrice && \(/g, '{product?.discountedPrice != null && product?.price > product?.discountedPrice && (');
    
    fs.writeFileSync(filePath, content, 'utf8');
    console.log("Fixed", file);
  }
});
