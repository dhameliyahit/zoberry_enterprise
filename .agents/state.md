# Project State: Zoberry Enterprise

## Goal
Build a full-featured, highly optimized, SEO-friendly e-commerce website with excellent UI/UX.
The project requires a slow, step-by-step approach, confirming every step before coding.

## Stack
- **Client**: React (Vite), Tailwind CSS v4, React Icons, Zustand, React Router, Apollo Client
- **Server**: Node.js, Express.js, GraphQL (Apollo), MySQL (Sequelize)
- **Uploads**: Local `uploads/` folder

## Code Standards (Strict)
- No emojis in code or logs.
- Clean, understandable variable names (e.g., `userModel`, `userRecord`, `graphqlServer`).
- Modular architecture (e.g., helpers in separate files).
- Clean, simple, and detailed comments explaining business logic.

## Current Progress
- **Backend Core**: Configured `express` with `apollo-server-express` and `sequelize` connected to `zoberry_db`.
- **User Module (Backend)**: 
  - `userModel.js` created with UUIDs, roles, email validation, and flexible auth fields (for Google / guest checkouts).
  - GraphQL `typeDefs` and `resolvers` for complete CRUD and Auth logic (`registerUser`, `loginUser`, `googleLoginUser`).
  - Auth helper `authHelper.js` created for generating non-expiring JWT tokens.
- **Frontend Core**: Initialized Vite React app, configured Tailwind CSS v4, set `<title>` to "Zoberry Enterprise", and cleared default Vite assets.

## Next Steps
- Start the backend server (`node index.js`).
- Test the User GraphQL API (register, login) with real-world test cases.
- Begin frontend implementation of the User module (UI for login/register) based on tested backend.
