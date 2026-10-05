import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { ApolloClient, InMemoryCache, ApolloProvider, createHttpLink } from '@apollo/client';
import { setContext } from '@apollo/client/link/context';
import { GoogleOAuthProvider } from '@react-oauth/google';
import 'primereact/resources/themes/lara-light-indigo/theme.css';
import 'primereact/resources/primereact.min.css';
import 'primeicons/primeicons.css';
import './index.css'
import App from './App.jsx'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:9000';

const httpLink = createHttpLink({
  uri: `${API_URL}/graphql`,
});

const authLink = setContext((_, { headers }) => {
  const token = localStorage.getItem('token');
  return {
    headers: {
      ...headers,
      authorization: token ? `Bearer ${token}` : "",
    }
  }
});

const client = new ApolloClient({
  link: authLink.concat(httpLink),
  cache: new InMemoryCache()
});

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ApolloProvider client={client}>
      <GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID || '1234567890-mockclientid.apps.googleusercontent.com'}>
        <App />
      </GoogleOAuthProvider>
    </ApolloProvider>
  </StrictMode>,
)
