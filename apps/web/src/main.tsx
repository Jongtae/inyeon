import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';

import App from './App';
import { ErrorBoundary } from './components/ErrorBoundary';
import { PRIVACY_SAFE_ROOT_ERROR_HANDLERS } from './lib/error-handlers';
import './styles.css';

const root = document.getElementById('root');

if (!root) {
  throw new Error('INYEON root element is missing');
}

createRoot(root, PRIVACY_SAFE_ROOT_ERROR_HANDLERS).render(
  <StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </StrictMode>,
);
