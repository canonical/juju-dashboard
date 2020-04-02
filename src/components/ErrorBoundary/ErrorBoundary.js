import React, { Component } from "react";

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error) {
    return {
      hasError: true,
      error,
    };
  }

  componentDidCatch(error, info) {
    // Log to Sentry when enabled
    console.log(error, info); // eslint-disable-line no-console
  }

  render() {
    const { hasError } = this.state;
    const { children } = this.props;
    if (hasError) {
      // Render error notification
      return (
        <div className="p-notification--negative">
          <p className="p-notification__response">
            <span className="p-notification__status">Error: </span>Something has
            gone wrong. If this issue persists,{" "}
            <a href="https://github.com/canonical-web-and-design/jaas-dashboard/issues/new?assignees=&labels=&template=bug_report.md&title=">
              please raise an issue on GitHub.
            </a>
          </p>
        </div>
      );
    }

    return children;
  }
}
