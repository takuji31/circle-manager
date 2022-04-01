import { Alert, AlertIcon } from '@chakra-ui/react';
import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  error: Error | null;
}

class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    // Update state so the next render will show the fallback UI.
    return { error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo);
  }

  public render() {
    if (this.state.error != null) {
      return (
        <Alert status="error">
          <AlertIcon />
          エラー： {this.state.error.message}
        </Alert>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
