import React from 'react';

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div
          style={{
            minHeight: '100vh',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            background: '#08090D',
            color: '#F5F5F7',
            padding: '2rem',
            textAlign: 'center',
            fontFamily: 'sans-serif',
          }}
        >
          <div
            style={{
              maxWidth: '540px',
              background: 'rgba(255, 255, 255, 0.045)',
              backdropFilter: 'blur(18px)',
              borderRadius: '16px',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              padding: '2.5rem 2rem',
              boxShadow: '0 20px 40px rgba(0,0,0,0.8)',
            }}
          >
            <h2
              style={{
                fontSize: '1.75rem',
                marginBottom: '1rem',
                color: '#63E6D1',
                letterSpacing: '0.05em',
                textTransform: 'uppercase',
              }}
            >
              System Recalibration
            </h2>
            <p
              style={{
                color: '#A1A6B3',
                fontSize: '0.95rem',
                lineHeight: 1.6,
                marginBottom: '1.8rem',
              }}
            >
              An unexpected interface anomaly occurred while loading this view. The system has safely isolated the component.
            </p>
            <button
              onClick={() => {
                this.setState({ hasError: false, error: null });
                window.location.href = '/';
              }}
              style={{
                background: '#63E6D1',
                color: '#08090D',
                padding: '0.75rem 1.75rem',
                borderRadius: '8px',
                fontWeight: 700,
                fontSize: '0.9rem',
                cursor: 'pointer',
                border: 'none',
                boxShadow: '0 4px 16px rgba(99, 230, 209, 0.3)',
                transition: 'transform 0.2s ease',
              }}
            >
              Return to HackFest 3.0 Home
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
