
import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App.tsx';

console.log("🚀 Explore Ease: Starting boot sequence...");

const rootElement = document.getElementById('root');

if (!rootElement) {
  const err = "❌ Explore Ease: Critical Error - Root element not found.";
  console.error(err);
} else {
  try {
    const root = ReactDOM.createRoot(rootElement);
    root.render(
      <React.StrictMode>
        <BrowserRouter>
          <App />
        </BrowserRouter>
      </React.StrictMode>
    );
    console.log("✅ Explore Ease: React DOM mounted successfully.");
  } catch (error) {
    console.error("❌ Explore Ease: Mounting failed.", error);
    rootElement.innerHTML = `<div style="padding: 2rem; color: #ef4444; font-family: sans-serif;">Mount Failure: ${error instanceof Error ? error.message : 'Unknown error'}</div>`;
  }
}
