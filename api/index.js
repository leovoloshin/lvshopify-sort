// /api/index.js

const express = require('express');
const cookieParser = require('cookie-parser');
const { shopifyApi, LATEST_API_VERSION } = require('@shopify/shopify-api');
require('dotenv').config();

// --- 1. Shopify API Setup ---
// This is the modern way to initialize the API library for Vercel.
const shopify = shopifyApi({
  apiKey: process.env.SHOPIFY_API_KEY,
  apiSecretKey: process.env.SHOPIFY_API_SECRET,
  scopes: process.env.SCOPES.split(','),
  hostName: new URL(process.env.HOST).hostname,
  apiVersion: LATEST_API_VERSION,
  isEmbeddedApp: true,
  hostScheme: 'https',
  // Use an in-memory session storage, perfect for Vercel's serverless functions.
  sessionStorage: shopifyApi.session.storage.memory.MemorySessionStorage(),
});

const app = express();
app.use(cookieParser());

// --- 2. OAuth Authentication Routes ---
// These handle the app installation process correctly.

app.get('/api/auth', async (req, res) => {
  try {
    const authRoute = await shopify.auth.begin({
      shop: shopify.utils.sanitizeShop(req.query.shop, true),
      callbackPath: '/api/auth/callback',
      isOnline: false,
      rawRequest: req,
      rawResponse: res,
    });
    res.redirect(authRoute);
  } catch (error) {
    console.error('Error during auth begin:', error);
    res.status(500).send(error.message);
  }
});

app.get('/api/auth/callback', async (req, res) => {
  try {
    const session = await shopify.auth.callback({
      rawRequest: req,
      rawResponse: res,
    });
    // Redirect to the app's home page in the Shopify admin
    res.redirect(`/?shop=${session.shop}&host=${req.query.host}`);
  } catch (error)    {
    console.error('Error during auth callback:', error);
    res.status(500).send(error.message);
  }
});


// --- 3. GraphQL Proxy ---
// This middleware proxies GraphQL requests from your frontend to the Shopify Admin API.

// We need to parse the body of the request as raw text for the proxy to work.
app.use('/api/graphql', express.text({ type: '*/*' }));

app.post('/api/graphql', async (req, res) => {
  try {
    // Get the session ID from the request.
    const sessionId = await shopify.session.getCurrentId({
      isOnline: false,
      rawRequest: req,
      rawResponse: res,
    });

    if (!sessionId) {
      return res.status(401).send('Unauthorized: No session ID found.');
    }

    // Load the session from our in-memory storage.
    const session = await shopify.config.sessionStorage.loadSession(sessionId);

    if (!session || !session.accessToken) {
        return res.status(401).send('Unauthorized: No valid session or access token found.');
    }

    // Create a GraphQL client with the session.
    const client = new shopify.clients.Graphql({ session });

    // Send the GraphQL query to Shopify.
    const response = await client.query({
      data: req.body,
    });

    res.status(200).send(response.body);
  } catch (error) {
    console.error('Error proxying GraphQL request:', error);
    if (error.response) {
      res.status(error.response.code).send(error.response.body);
    } else {
      res.status(500).send(error.message);
    }
  }
});


// --- 4. Export the app for Vercel ---
module.exports = app;