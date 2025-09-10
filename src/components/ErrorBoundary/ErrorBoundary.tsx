import {
  CodeSnippet,
  CodeSnippetBlockAppearance,
  Notification as ReactNotification,
  Strip,
} from "@canonical/react-components";
import * as Sentry from "@sentry/browser";
import type { Extras } from "@sentry/core";
import type { JSX, PropsWithChildren } from "react";
import { Component } from "react";

import { externalURLs } from "urls";

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

  static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      error,
    };
  }

  componentDidCatch(error: Error, info: unknown): void {
    if (
      import.meta.env.PROD &&
      Boolean(window.jujuDashboardConfig?.analyticsEnabled)
    ) {
      Sentry.withScope((scope) => {
        scope.setExtras(info as Extras);
        const eventId = Sentry.captureException(error);
        this.setState({ eventId });
      });
    }
  }

  render(): JSX.Element {
    const { error = null, hasError } = this.state;
    const { children } = this.props;
    const body = encodeURIComponent(
      `\`\`\`\n${error?.stack ?? "No stack track"}\n\`\`\``,
    );
    const url = `${
      externalURLs.newIssue
    }?assignees=&labels=&template=bug_report.md&title=Dashboard error: ${encodeURIComponent(
      error?.message ?? "No error",
    )}&body=${body}`;
    if (hasError) {
      return (
        <Strip>
          <ReactNotification severity="negative" title="Error">
            Something has gone wrong. If this issue persists,{" "}
            <a href={url} rel="noopener noreferrer" target="_blank">
              please raise an issue on GitHub.
            </a>
          </ReactNotification>
          <CodeSnippet
            blocks={[
              ...(error !== null && Boolean(error?.message)
                ? [
                    {
                      title: "Error",
                      appearance: CodeSnippetBlockAppearance.NUMBERED,
                      wrapLines: true,
                      code: error.message,
                    },
                  ]
                : []),
              ...(error !== null && Boolean(error?.stack)
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
              href={externalURLs.troubleshootDeployment}
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
