import React from 'react';
import ReactDOM from 'react-dom';
import { AppProvider } from '@shopify/polaris';
import { Provider as AppBridgeProvider } from '@shopify/app-bridge-react';
import App from './App';
import '@shopify/polaris/build/esm/styles.css';

const config = { apiKey: process.env.REACT_APP_SHOPIFY_API_KEY, host: new URLSearchParams(window.location.search).get('host') };

ReactDOM.render(
  <AppBridgeProvider config={config}>
    <AppProvider i18n={{}}>
      <App />
    </AppProvider>
  </AppBridgeProvider>,
  document.getElementById('root')
);