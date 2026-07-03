import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import axios from 'axios';
import App from './App';
import './index.css';

// Configure API base URL from Vite env. When deploying (GitHub Pages),
// set VITE_API_URL to your backend (e.g. https://api.your-domain.com)
// Locally, leave it unset so relative `/api` paths work with the dev proxy.
const apiUrl = import.meta.env.VITE_API_URL || '';
if (apiUrl) axios.defaults.baseURL = apiUrl;

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter basename="/ecommercepayment/">
      <App />
    </BrowserRouter>
  </React.StrictMode>
);
