import React, { Component } from "react";

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }
  static getDerivedStateFromError(error) {
    return {
      hasError: true,
      error
    };
  }

  componentDidCatch(error, info) {
    // Log to Sentry when enabled
    console.log(error, info);
  }

  render() {
    if (this.state.hasError) {
      // Render error notification
      return (
        <div className="p-notification--negative">
          <p className="p-notification__response">
            <span className="p-notification__status">Error: </span>Something has
            went wrong. If this issue persists,{" "}
            <a href="https://github.com/canonical-web-and-design/jaas-dashboard/issues?q=is%3Aissue+is%3Aopen+sort%3Aupdated-desc">
              please raise an issue on Github.
            </a>
          </p>
        </div>
      );
    }

    return this.props.children;
  }
}
