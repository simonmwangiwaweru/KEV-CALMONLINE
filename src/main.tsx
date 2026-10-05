import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';

// Register PWA Service Worker for mobile offline capabilities
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').then((registration) => {
      console.log('[Calm Online] PWA ServiceWorker active with scope:', registration.scope);
    }).catch((error) => {
      console.warn('[Calm Online] ServiceWorker registration skipped:', error);
    });
  });
}

createRoot(document.getElementById('root')!).render(<App />);
