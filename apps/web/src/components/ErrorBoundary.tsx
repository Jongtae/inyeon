import { Component, type ReactNode } from 'react';

import { BrandMark } from './BrandMark';

interface ErrorBoundaryProps {
  children: ReactNode;
  reloadPage?: () => void;
}

interface ErrorBoundaryState {
  failed: boolean;
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state: ErrorBoundaryState = { failed: false };

  static getDerivedStateFromError(): ErrorBoundaryState {
    return { failed: true };
  }

  componentDidCatch() {
    // Deliberately local and silent: private session data and exception details
    // must not be logged, persisted, or sent to a reporting service.
  }

  private reload = () => {
    (this.props.reloadPage ?? (() => window.location.reload()))();
  };

  private returnHome = () => {
    window.location.hash = '#/';
    this.setState({ failed: false });
  };

  render() {
    if (!this.state.failed) return this.props.children;

    return (
      <div className="site-shell">
        <header className="site-header">
          <span className="brand" aria-label="INYEON">
            <BrandMark />
            <span>
              INYEON<small>인연 · CONNECTION</small>
            </span>
          </span>
        </header>
        <main id="main-content" tabIndex={-1}>
          <section className="detail-page" aria-labelledby="error-title">
            <header className="page-intro">
              <p className="eyebrow">인연 · INYEON</p>
              <h1 id="error-title">This page needs a fresh start.</h1>
              <div className="page-lead">
                <p>
                  Something went wrong in this tab. INYEON did not send an error report or include
                  your private Saju details.
                </p>
              </div>
            </header>
            <div className="result-actions" role="group" aria-label="Recovery options">
              <button className="primary-button" type="button" onClick={this.reload}>
                Reload the page
              </button>
              <button className="clear-button" type="button" onClick={this.returnHome}>
                Return to INYEON home
              </button>
            </div>
          </section>
        </main>
      </div>
    );
  }
}
