import React from "react";
import AnimatedErrorPage from "../../features/Error/AnimatedErrorPage";

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, info) {
    console.error("Frontend Crash:", error, info);
  }

  render() {
    if (this.state.hasError) {
      return <AnimatedErrorPage />;
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
