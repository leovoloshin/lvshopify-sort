require('dotenv').config();
const express = require('express');
const path = require('path');
const { createShopifyAuth, verifyRequest } = require('@shopify/shopify-app-express');
const { MemorySessionStorage } = require('@shopify/shopify-app-session-storage-memory');
const fetch = require('node-fetch');

const app = express();
const PORT = 3000;
app.use(express.json());

const shopify = createShopifyAuth({
  apiKey: process.env.SHOPIFY_API_KEY,
  secret: process.env.SHOPIFY_API_SECRET,
  scopes: process.env.SHOPIFY_SCOPES.split(','),
  host: process.env.HOST,
  afterAuth: (req, res) => {
    res.redirect('/');
  },
  sessionStorage: new MemorySessionStorage(),
});

app.use(shopify);
app.use(verifyRequest());

// GraphQL Proxy
app.post('/graphql', async (req, res) => {
  const { shop, accessToken } = req.session;
  if (!accessToken) return res.status(401).send('Unauthorized');

  try {
    const response = await fetch(`https://${shop}/admin/api/2024-07/graphql.json`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Shopify-Access-Token': accessToken,
      },
      body: JSON.stringify(req.body),
    });
    const data = await response.json();
    res.send(data);
  } catch (error) {
    res.status(500).send(error.message);
  }
});

// Serve frontend static files
app.use(express.static(path.join(__dirname, '../client/build')));

// Catch-all route to serve React app
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../client/build', 'index.html'));
});

module.exports = app;