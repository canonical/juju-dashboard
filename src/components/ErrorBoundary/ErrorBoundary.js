import { Component } from "react";
import * as Sentry from "@sentry/browser";

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
    Sentry.withScope((scope) => {
      scope.setExtras(info);
      const eventId = Sentry.captureException(error);
      this.setState({ eventId });
    });
  }

  render() {
    const { hasError } = this.state;
    const { children } = this.props;
    if (hasError) {
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

    return <>{children}</>;
  }
}
