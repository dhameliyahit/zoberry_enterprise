const express = require('express');
const { ApolloServer } = require('@apollo/server');
const { expressMiddleware } = require('@as-integrations/express5');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const multer = require('multer');
const path = require('path');
const { processAndSaveImage } = require('./helpers/imageHelper');
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

    // 5. Setup REST API route for image uploads
    // We use multer memory storage so we can process the buffer directly with sharp
    const upload = multer({ storage: multer.memoryStorage() });
    
    app.post('/api/upload', upload.single('image'), async (req, res) => {
      try {
        if (!req.file) {
          return res.status(400).json({ error: 'No image file provided' });
        }
        
        // Process the image and get the saved URL path
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
        // Extract the token from the Authorization header (Format: "Bearer <token>")
        const authHeader = req.headers.authorization || '';
        const token = authHeader.split(' ')[1];
        
        let authenticatedUser = null;
        
        if (token) {
          try {
            // Verify the token using the secret key
            authenticatedUser = jwt.verify(token, process.env.JWT_SECRET);
          } catch (error) {
            console.error('Invalid or expired authentication token provided.');
          }
        }
        
        // Pass the user information to all GraphQL resolvers
        return { user: authenticatedUser };
      },
    }));

    // 7. Serve static files from the built client (production)
    const clientBuildPath = path.join(__dirname, '..', 'client', 'dist');
    app.use(express.static(clientBuildPath));

    // 8. Handle client-side routing - serve index.html for all non-API/GraphQL routes
    app.get('/{*path}', (req, res) => {
      // Don't intercept API or GraphQL routes
      if (req.path.startsWith('/api') || req.path.startsWith('/graphql') || req.path.startsWith('/uploads')) {
        return;
      }
      res.sendFile(path.join(clientBuildPath, 'index.html'));
    });

    // 5. Start listening for incoming requests
    app.listen(PORT, () => {
      console.log(`Server is running and listening at http://localhost:${PORT}/graphql`);
    });

  } catch (error) {
    console.error('Failed to initialize the server:', error);
    process.exit(1);
  }
};

initializeServer();
