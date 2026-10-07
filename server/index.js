const express = require('express');
const { ApolloServer } = require('@apollo/server');
const { expressMiddleware } = require('@as-integrations/express5');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { processAndSaveImage } = require('./helpers/imageHelper');
const { generateSitemapXml, renderHtmlWithSSRMeta } = require('./helpers/ssrHelper');
require('dotenv').config();

// Load models and define relationships BEFORE syncing the database
require('./models');
const { connectDB } = require('./config/db');
const typeDefs = require('./graphql/typeDefs');
const resolvers = require('./graphql/resolvers');

const app = express();
const PORT = process.env.PORT || 9000;

// Main function to initialize and start the server
const initializeServer = async () => {
  try {
    // 1. Connect to MySQL Database and synchronize models
    await connectDB();

    // 1.5 Seed Admin User
    const bcrypt = require('bcryptjs');
    const UserModel = require('./models/userModel');
    const adminEmail = 'heet@admin.com';
    const adminExists = await UserModel.findOne({ where: { email: adminEmail } });
    if (!adminExists) {
      const hashedPassword = await bcrypt.hash('123456', 10);
      await UserModel.create({
        email: adminEmail,
        password: hashedPassword,
        role: 'admin'
      });
      console.log('Admin user seeded: heet@admin.com / 123456');
    }

    // 2. Initialize the Apollo GraphQL Server
    const graphqlServer = new ApolloServer({
      typeDefs: typeDefs,
      resolvers: resolvers,
    });

    await graphqlServer.start();

    // 3. Apply standard Express middlewares
    app.use(cors());
    app.use(express.json());

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

    // 5. Setup REST API route for image uploads
    const upload = multer({ storage: multer.memoryStorage() });
    
    app.post('/api/upload', upload.single('image'), async (req, res) => {
      try {
        if (!req.file) {
          return res.status(400).json({ error: 'No image file provided' });
        }
        
        const folder = req.body.folder || 'misc';
        const imageUrl = await processAndSaveImage(req.file.buffer, folder);
        
        return res.status(200).json({ imageUrl });
      } catch (error) {
        return res.status(500).json({ error: 'Image processing failed' });
      }
    });

    // 6. Setup GraphQL API route with Authentication Context
    app.use('/graphql', expressMiddleware(graphqlServer, {
      context: async ({ req }) => {
        const authHeader = req.headers.authorization || '';
        const token = authHeader.split(' ')[1];
        
        let authenticatedUser = null;
        
        if (token) {
          try {
            authenticatedUser = jwt.verify(token, process.env.JWT_SECRET);
          } catch (error) {
            console.error('Invalid or expired authentication token provided.');
          }
        }
        
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
