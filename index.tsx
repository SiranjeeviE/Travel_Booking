import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App.tsx';

console.log("🚀 Explore Ease: Starting boot sequence...");

const init = () => {
  const rootElement = document.getElementById('root');

  if (!rootElement) {
    console.error("❌ Explore Ease: Critical Error - Root element not found.");
    return;
  }

  try {
    const root = ReactDOM.createRoot(rootElement);
    root.render(
      <React.StrictMode>
        <BrowserRouter>
          <App />
        </BrowserRouter>
      </React.StrictMode>
    );
    console.log("✅ Explore Ease: Application mounted successfully.");
  } catch (error) {
    console.error("❌ Explore Ease: Mounting failed.", error);
    rootElement.innerHTML = `
      <div style="padding: 2rem; color: #ef4444; font-family: sans-serif; text-align: center; margin-top: 10vh; background: #0f172a; height: 100vh;">
        <h2 style="font-weight: 800; font-size: 1.5rem; color: #fff;">Mount Failure</h2>
        <p style="color: #94a3b8; margin-top: 1rem; max-width: 400px; margin-left: auto; margin-right: auto;">
          ${error instanceof Error ? error.message : 'Unknown React Error'}
        </p>
        <button onclick="location.reload()" style="margin-top: 2rem; background: #6366f1; color: #fff; padding: 0.5rem 2rem; border-radius: 0.5rem; border: none; cursor: pointer;">Retry</button>
      </div>
    `;
  }
};

// Ensure DOM is ready before mounting
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}