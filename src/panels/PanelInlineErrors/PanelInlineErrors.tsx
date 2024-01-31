import { Notification } from "@canonical/react-components";

import ScrollOnRender from "components/ScrollOnRender";

type Props = {
  inlineErrors: (string | null)[] | null;
  scrollArea?: HTMLElement | null;
};

const PanelInlineErrors = ({
  inlineErrors,
  scrollArea,
}: Props): JSX.Element | null =>
  inlineErrors && inlineErrors.some((error) => error) ? (
    <ScrollOnRender scrollArea={scrollArea}>
      {inlineErrors.map((error) =>
        error ? (
          <Notification key={error} severity="negative">
            {error}
          </Notification>
        ) : null,
      )}
    </ScrollOnRender>
  ) : null;

export default PanelInlineErrors;
