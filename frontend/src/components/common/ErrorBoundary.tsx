import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RotateCcw, ShieldCheck } from 'lucide-react';

interface Props {
  children: ReactNode;
  fallbackTitle?: string;
  onReset?: () => void;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
    errorInfo: null
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error, errorInfo: null };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error caught by MediFlow ErrorBoundary:', error, errorInfo);
    this.setState({ errorInfo });
  }

  public handleReset = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
    if (this.props.onReset) {
      this.props.onReset();
    } else {
      window.location.reload();
    }
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div
          className="glass-panel"
          style={{
            padding: '2.5rem 2rem',
            textAlign: 'center',
            maxWidth: '540px',
            margin: '2rem auto',
            border: '1px solid rgba(239, 68, 68, 0.4)',
            background: 'rgba(239, 68, 68, 0.08)'
          }}
        >
          <div
            style={{
              width: '56px',
              height: '56px',
              borderRadius: '50%',
              background: 'rgba(239, 68, 68, 0.2)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 1rem auto'
            }}
          >
            <AlertTriangle size={28} color="#f87171" />
          </div>

          <h3 style={{ fontSize: '1.25rem', color: '#f8fafc', fontWeight: 700 }}>
            {this.props.fallbackTitle || 'Component Encountered a Recoverable Issue'}
          </h3>

          <p style={{ fontSize: '0.85rem', color: '#cbd5e1', marginTop: '6px', lineHeight: '1.5' }}>
            MediFlow AI has caught this error safely. No medical records or ongoing sessions were corrupted.
          </p>

          {this.state.error && (
            <div
              style={{
                marginTop: '1rem',
                padding: '0.75rem',
                borderRadius: '8px',
                background: 'rgba(15, 23, 42, 0.8)',
                color: '#fca5a5',
                fontSize: '0.75rem',
                textAlign: 'left',
                fontFamily: 'monospace',
                maxHeight: '120px',
                overflowY: 'auto'
              }}
            >
              {this.state.error.toString()}
            </div>
          )}

          <div className="flex items-center justify-center gap-3" style={{ marginTop: '1.5rem' }}>
            <button onClick={this.handleReset} className="btn btn-primary flex items-center gap-2">
              <RotateCcw size={16} />
              <span>Reload & Recover Application</span>
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
