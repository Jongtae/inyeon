import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';

import { MethodologyReviewApp } from './MethodologyReviewApp';
import { ErrorBoundary } from './components/ErrorBoundary';
import { PRIVACY_SAFE_ROOT_ERROR_HANDLERS } from './lib/error-handlers';
import './styles.css';
import './review.css';

const root = document.getElementById('root');
if (!root) throw new Error('INYEON methodology review root is missing');

createRoot(root, PRIVACY_SAFE_ROOT_ERROR_HANDLERS).render(
  <StrictMode>
    <ErrorBoundary>
      <MethodologyReviewApp />
    </ErrorBoundary>
  </StrictMode>,
);
