import { Notification as ReactNotification } from "@canonical/react-components";
import type { JSX, ReactNode } from "react";

import ScrollOnRender from "components/ScrollOnRender";

type Props = {
  inlineErrors: ReactNode[] | null;
  scrollArea?: HTMLElement | null;
};

const PanelInlineErrors = ({
  inlineErrors,
  scrollArea,
}: Props): JSX.Element | null =>
  inlineErrors && inlineErrors.some((error = null) => error !== null) ? (
    <ScrollOnRender scrollArea={scrollArea}>
      {inlineErrors.map((error, index) =>
        error !== null ? (
          <ReactNotification key={index} severity="negative">
            {error}
          </ReactNotification>
        ) : null,
      )}
    </ScrollOnRender>
  ) : null;

export default PanelInlineErrors;
