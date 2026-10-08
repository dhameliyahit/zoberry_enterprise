const express = require('express');
const { ApolloServer } = require('@apollo/server');
const { expressMiddleware } = require('@as-integrations/express5');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
require('dotenv').config();

// Load models and define relationships BEFORE syncing the database
require('./models');
const { connectDB } = require('./config/db');
const typeDefs = require('./graphql/typeDefs');
const resolvers = require('./graphql/resolvers');
const { processAndSaveImage, ALLOWED_MIME_TYPES, MAX_FILE_SIZE_BYTES } = require('./helpers/imageHelper');
const { generateSitemapXml, renderHtmlWithSSRMeta } = require('./helpers/ssrHelper');
const { getAuthUserFromReq, expressRequireAdmin } = require('./helpers/authMiddleware');
const { formatGraphQLError } = require('./helpers/errorHelper');
const paymentRoutes = require('./routes/paymentRoutes');

const app = express();
const PORT = process.env.PORT || 9000;

// Main function to initialize and start the server
const initializeServer = async () => {
  try {
    // 1. Connect to MySQL Database safely
    await connectDB();

    // 2. Initialize the Apollo GraphQL Server with custom error formatting
    const graphqlServer = new ApolloServer({
      typeDefs,
      resolvers,
      formatError: formatGraphQLError,
      includeStacktraceInErrorResponses: process.env.NODE_ENV !== 'production',
    });

    await graphqlServer.start();

    // 3. Apply standard Express middlewares
    app.use(cors());
    app.use(express.json());
    app.use(express.urlencoded({ extended: true }));

    // 4. Mount REST Payment Callback Routes
    app.use('/api/payment', paymentRoutes);

    // 4. Serve the uploads folder statically so images can be viewed via URL
    app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

    // 4.5 Dynamic SEO Sitemap Route
    app.get('/sitemap.xml', async (req, res) => {
      try {
        const sitemapXml = await generateSitemapXml();
        if (sitemapXml) {
          res.setHeader('Content-Type', 'application/xml');
          return res.status(200).send(sitemapXml);
        }
        res.status(500).send('Error generating sitemap');
      } catch (err) {
        res.status(500).send('Error generating sitemap');
      }
    });

    // 5. Setup REST API route for image uploads (Protected: Admin Only with strict validation)
    const upload = multer({
      storage: multer.memoryStorage(),
      limits: {
        fileSize: MAX_FILE_SIZE_BYTES, // 5MB max
        files: 20,
      },
      fileFilter: (req, file, cb) => {
        if (ALLOWED_MIME_TYPES.includes(file.mimetype)) {
          cb(null, true);
        } else {
          cb(new Error(`Unsupported file type: ${file.mimetype}. Allowed types: JPEG, PNG, WebP, AVIF, GIF`), false);
        }
      },
    });

    // Single Image Upload (Admin Only)
    app.post('/api/upload', expressRequireAdmin, upload.single('image'), async (req, res) => {
      try {
        if (!req.file) {
          return res.status(400).json({ error: 'No image file provided' });
        }

        const folder = req.body.folder || 'misc';
        const imageUrl = await processAndSaveImage(req.file.buffer, folder);

        return res.status(200).json({ imageUrl });
      } catch (error) {
        console.error('Image upload error:', error.message);
        return res.status(400).json({ error: error.message || 'Image processing failed' });
      }
    });

    // Multiple Image Upload (Admin Only)
    app.post('/api/upload-multiple', expressRequireAdmin, upload.array('images', 20), async (req, res) => {
      try {
        if (!req.files || req.files.length === 0) {
          return res.status(400).json({ error: 'No image files provided' });
        }

        const folder = req.body.folder || 'products';
        const imageUrls = [];

        for (const file of req.files) {
          const imgUrl = await processAndSaveImage(file.buffer, folder);
          imageUrls.push(imgUrl);
        }

        return res.status(200).json({ imageUrls });
      } catch (error) {
        console.error('Multiple image upload error:', error.message);
        return res.status(400).json({ error: error.message || 'Multiple image processing failed' });
      }
    });

    // 6. Setup GraphQL API route with Authentication Context
    app.use('/graphql', expressMiddleware(graphqlServer, {
      context: async ({ req }) => {
        const authenticatedUser = await getAuthUserFromReq(req);
        return { user: authenticatedUser };
      },
    }));

    // 7. Serve static files from the built client (production)
    const clientDistPath = path.join(__dirname, '..', 'client', 'dist');
    const clientDevIndexPath = path.join(__dirname, '..', 'client', 'index.html');

    if (fs.existsSync(clientDistPath)) {
      app.use(express.static(clientDistPath, { index: false }));
    }

    // 8. SSR Meta & Bot Prerender Handler for all Client Routes
    app.use(async (req, res, next) => {
      // Don't intercept API, GraphQL, uploads, or static asset files
      if (
        req.path.startsWith('/api') ||
        req.path.startsWith('/graphql') ||
        req.path.startsWith('/uploads') ||
        req.path.includes('.')
      ) {
        return next();
      }

      try {
        let indexHtmlPath = path.join(clientDistPath, 'index.html');
        if (!fs.existsSync(indexHtmlPath)) {
          indexHtmlPath = clientDevIndexPath;
        }

        if (fs.existsSync(indexHtmlPath)) {
          const rawHtml = fs.readFileSync(indexHtmlPath, 'utf8');
          const renderedHtml = await renderHtmlWithSSRMeta(req, rawHtml);
          res.setHeader('Content-Type', 'text/html; charset=utf-8');
          return res.status(200).send(renderedHtml);
        }

        return res.status(404).send('Client build index.html not found. Run "npm run build" in client directory.');
      } catch (err) {
        console.error('SSR Handler Error:', err);
        return next(err);
      }
    });

    // 9. Start listening for incoming requests
    app.listen(PORT, () => {
      console.log(`🚀 Server is running at http://localhost:${PORT}`);
      console.log(`📊 GraphQL endpoint: http://localhost:${PORT}/graphql`);
      console.log(`🗺️ Dynamic Sitemap: http://localhost:${PORT}/sitemap.xml`);
    });

  } catch (error) {
    console.error('Failed to initialize the server:', error);
    process.exit(1);
  }
};

initializeServer();
