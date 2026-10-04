const sharp = require('sharp');
const path = require('path');
const fs = require('fs');

// Ensure the uploads directory exists
const ensureDirectoryExists = (dirPath) => {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
};

/**
 * Processes an uploaded image buffer, converts it to highly optimized WebP format,
 * and saves it to the local file system.
 * 
 * @param {Buffer} fileBuffer - The image file buffer in memory
 * @param {string} folder - The subfolder name inside uploads (e.g., 'categories')
 * @returns {Promise<string>} - Returns the URL path to the saved image
 */
const processAndSaveImage = async (fileBuffer, folder = 'misc') => {
  try {
    const uploadDir = path.join(__dirname, '..', 'uploads', folder);
    ensureDirectoryExists(uploadDir);

    // Generate a unique filename using timestamp and random number
    const uniqueFilename = `${Date.now()}-${Math.round(Math.random() * 1e9)}.webp`;
    const outputPath = path.join(uploadDir, uniqueFilename);

    // Process the image using Sharp
    await sharp(fileBuffer)
      .resize(800, 800, {
        fit: sharp.fit.inside,
        withoutEnlargement: true // Prevent small images from being stretched
      })
      .webp({ quality: 80 }) // Convert to WebP with 80% quality for optimal balance of size and quality
      .toFile(outputPath);

    // Return the relative URL path so the frontend can access it
    return `/uploads/${folder}/${uniqueFilename}`;
  } catch (error) {
    console.error('Image processing error:', error);
    throw new Error('Failed to process and save image');
  }
};

module.exports = {
  processAndSaveImage,
};
