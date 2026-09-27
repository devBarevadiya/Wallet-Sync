import React from "react";
import PropTypes from "prop-types";

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("[ErrorBoundary caught an error]:", error, errorInfo);
  }

  handleReset = () => {
    if (this.props.onReset) {
      this.setState({ hasError: false, error: null });
      this.props.onReset();
      return;
    }

    // A render error can leave the component in an unrecoverable state.
    // Reloading gives the app a clean Redux tree and a fresh data bootstrap.
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      const isWidget = this.props.isWidget;

      return (
        <div
          className={`d-flex flex-column align-items-center justify-content-center text-center p-4 ${
            isWidget ? "min-h-200px" : "min-vh-50"
          }`}
        >
          <div className="mb-3">
            <i className="ri-error-warning-line text-color-invalid fs-36"></i>
          </div>
          <h6 className="fs-16 fw-semibold mb-2">Something went wrong</h6>
          <p className="text-color-light-gray fs-13 mb-3 max-w-400">
            {this.props.message ||
              "Unable to display this content. Please try refreshing or checking your connection."}
          </p>
          <button
            onClick={this.handleReset}
            className="btn btn-sm btn-outline-primary br-8 px-3 py-1 fs-13"
          >
            <i className="ri-refresh-line me-1"></i> Retry
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

ErrorBoundary.propTypes = {
  children: PropTypes.node,
  fallback: PropTypes.node,
  message: PropTypes.string,
  isWidget: PropTypes.bool,
  onReset: PropTypes.func,
};

export default ErrorBoundary;
