import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import '@fontsource/heebo/400.css';
import '@fontsource/heebo/500.css';
import '@fontsource/heebo/700.css';
import '@fontsource/heebo/900.css';
import './index.css';
import { App } from './App';
import { USE_SOFT_DESIGN } from './lib/design';

if (USE_SOFT_DESIGN) {
  document.documentElement.classList.add('soft-design');
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
