import React from 'react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error("Tool Error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: '2rem', textAlign: 'center', background: 'var(--surface)', borderRadius: '20px', border: '1px solid var(--md-sys-color-error)' }}>
          <span className="material-icons" style={{ fontSize: '3rem', color: 'var(--md-sys-color-error)', marginBottom: '1rem' }}>error_outline</span>
          <h3>Something went wrong</h3>
          <p style={{ opacity: 0.7 }}>The tool crashed during execution. Please try refreshing.</p>
          <button className="btn-primary" onClick={() => window.location.reload()} style={{ marginTop: '1rem' }}>Reload App</button>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
