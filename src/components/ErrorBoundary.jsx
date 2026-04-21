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
        <div className="empty-state" style={{ border: '1px solid #BA1A1A', background: '#FFF8F7', borderRadius: '32px' }}>
          <span className="material-icons empty-state-illustration" style={{ color: '#BA1A1A' }}>pest_control</span>
          <h3>A small bug in the forest...</h3>
          <p>This tool encountered a problem. Our digital gardeners are informed.</p>
          <button
            className="btn-primary"
            onClick={() => this.setState({ hasError: false })}
            style={{ marginTop: '1rem', background: '#BA1A1A' }}
          >
            Try Again
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
