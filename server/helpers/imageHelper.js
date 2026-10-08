const sharp = require('sharp');
const path = require('path');
const fs = require('fs');

const ALLOWED_FOLDERS = ['categories', 'products', 'misc', 'banners'];
const ALLOWED_MIME_TYPES = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/avif',
  'image/gif',
];
const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024; // 5 MB

// Ensure the directory exists
const ensureDirectoryExists = (dirPath) => {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
};

/**
 * Validates image buffer using Sharp metadata to prevent arbitrary file execution or corrupted files.
 *
 * @param {Buffer} buffer - File buffer
 * @returns {Promise<Object>} - Metadata of image
 */
const validateImageBuffer = async (buffer) => {
  if (!buffer || !Buffer.isBuffer(buffer)) {
    throw new Error('Invalid file buffer provided.');
  }

  if (buffer.length > MAX_FILE_SIZE_BYTES) {
    throw new Error('File size exceeds maximum limit of 5MB.');
  }

  try {
    const metadata = await sharp(buffer).metadata();
    if (!metadata || !metadata.format) {
      throw new Error('Unsupported or corrupted image file.');
    }
    return metadata;
  } catch (err) {
    throw new Error('Invalid image file format. Only JPEG, PNG, WebP, AVIF, and GIF are allowed.');
  }
};

/**
 * Processes an uploaded image buffer, converts it to optimized WebP format,
 * and saves it into the designated uploads subfolder.
 *
 * @param {Buffer} fileBuffer - The image file buffer in memory
 * @param {string} folder - Target folder name (whitelisted)
 * @returns {Promise<string>} - Returns the URL path to the saved WebP image
 */
const processAndSaveImage = async (fileBuffer, folder = 'misc') => {
  // Sanitize and validate target folder name to prevent path traversal attacks
  const safeFolder = ALLOWED_FOLDERS.includes(folder.toLowerCase()) ? folder.toLowerCase() : 'misc';

  // Validate image buffer and format
  await validateImageBuffer(fileBuffer);

  const uploadDir = path.join(__dirname, '..', 'uploads', safeFolder);
  ensureDirectoryExists(uploadDir);

  // Generate safe unique filename using timestamp and high-entropy random suffix
  const uniqueFilename = `${Date.now()}-${Math.round(Math.random() * 1e9)}.webp`;
  const outputPath = path.join(uploadDir, uniqueFilename);

  // Process the image using Sharp: constrain dimensions, strip metadata, convert to WebP
  await sharp(fileBuffer)
    .rotate() // Automatically orient based on EXIF
    .resize(1600, 1600, {
      fit: sharp.fit.inside,
      withoutEnlargement: true, // Prevent small images from being stretched
    })
    .webp({ quality: 82 }) // High visual quality with optimal compression
    .toFile(outputPath);

  // Return the relative URL path for the frontend
  return `/uploads/${safeFolder}/${uniqueFilename}`;
};

module.exports = {
  processAndSaveImage,
  validateImageBuffer,
  ALLOWED_MIME_TYPES,
  ALLOWED_FOLDERS,
  MAX_FILE_SIZE_BYTES,
};
