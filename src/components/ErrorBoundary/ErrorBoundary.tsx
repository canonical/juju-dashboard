import { Component, PropsWithChildren } from "react";
import * as Sentry from "@sentry/browser";
import {
  Notification,
  Strip,
  CodeSnippet,
  CodeSnippetBlockAppearance,
} from "@canonical/react-components";
import { Extras } from "@sentry/types";

type Props = PropsWithChildren;

type State = {
  error?: Error;
  eventId?: string;
  hasError: boolean;
};

export default class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error) {
    return {
      hasError: true,
      error,
    };
  }

  componentDidCatch(error: Error, info: unknown) {
    Sentry.withScope((scope) => {
      scope.setExtras(info as Extras);
      const eventId = Sentry.captureException(error);
      this.setState({ eventId });
    });
  }

  render() {
    const { error, hasError } = this.state;
    const { children } = this.props;
    const body = encodeURIComponent(
      `\`\`\`\n${error?.stack ?? "No stack track"}\n\`\`\``
    );
    const url = `https://github.com/canonical-web-and-design/jaas-dashboard/issues/new?assignees=&labels=&template=bug_report.md&title=Dashboard error: ${encodeURIComponent(
      error?.message ?? "No error"
    )}&body=${body}`;
    if (hasError) {
      return (
        <Strip>
          <Notification severity="negative" title="Error">
            Something has gone wrong. If this issue persists,{" "}
            <a href={url} rel="noopener noreferrer" target="_blank">
              please raise an issue on GitHub.
            </a>
          </Notification>
          <CodeSnippet
            blocks={[
              ...(error?.message
                ? [
                    {
                      title: "Error",
                      appearance: CodeSnippetBlockAppearance.NUMBERED,
                      wrapLines: true,
                      code: error.message,
                    },
                  ]
                : []),
              ...(error?.stack
                ? [
                    {
                      title: "Stack trace",
                      appearance: CodeSnippetBlockAppearance.NUMBERED,
                      wrapLines: true,
                      code: error.stack,
                    },
                  ]
                : []),
            ]}
          />
          <p>
            Further debugging can be done{" "}
            <a
              href="https://juju.is/docs/olm/troubleshooting"
              rel="noopener noreferrer"
              target="_blank"
            >
              via the Juju CLI
            </a>
            .
          </p>
        </Strip>
      );
    }

    return <>{children}</>;
  }
}
