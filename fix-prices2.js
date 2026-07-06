const fs = require('fs');
const path = require('path');

const filesToFix = [
  "src/components/Common/QuickViewModal.tsx",
  "src/components/Cart/OrderSummary.tsx",
];

const basePath = "e:/work/zoberry/zoberry_enterprise";

filesToFix.forEach(file => {
  const filePath = path.join(basePath, file);
  if (fs.existsSync(filePath)) {
    let content = fs.readFileSync(filePath, 'utf8');
    
    // For item
    content = content.replace(/₹\{item\.discountedPrice\}/g, '₹{item.discountedPrice ?? item.price}');
    content = content.replace(/\{item\.price !== item\.discountedPrice && \(/g, '{item.discountedPrice != null && item.price !== item.discountedPrice && (');
    content = content.replace(/item\.discountedPrice \* /g, '(item.discountedPrice ?? item.price) * ');

    // For product?
    content = content.replace(/₹\{product\?\.discountedPrice\}/g, '₹{product?.discountedPrice ?? product?.price}');
    content = content.replace(/product\?\.price > product\?\.discountedPrice && \(/g, 'product?.discountedPrice != null && product?.price > product?.discountedPrice && (');
    
    fs.writeFileSync(filePath, content, 'utf8');
    console.log("Fixed", file);
  }
});
