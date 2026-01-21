import {
  CodeSnippet,
  CodeSnippetBlockAppearance,
  Notification,
  Strip,
} from "@canonical/react-components";
import type { PropsWithChildren } from "react";
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

  static getDerivedStateFromError(error: Error) {
    return {
      hasError: true,
      error,
    };
  }

  render() {
    const { error, hasError } = this.state;
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
