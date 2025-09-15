import { NotificationSeverity } from "@canonical/react-components";
import { buildQueries, within } from "@testing-library/dom";

type Options = {
  appearance?: "banner" | "toast";
  severity?: string;
};

export const queryAllNotificationsByText = (
  container: HTMLElement,
  text: string,
  {
    appearance = "banner",
    severity = NotificationSeverity.NEGATIVE,
  }: Options = {},
): HTMLElement[] => {
  const messages = within(container).queryAllByText(text);
  const notifications: HTMLElement[] = [];
  messages.forEach((message) => {
    const notification: HTMLElement | null = message.closest(
      appearance === "banner"
        ? `.p-notification--${severity}`
        : `.toast-card[data-type="${severity}"]`,
    );
    if (message && notification) {
      notifications.push(notification);
    }
  });
  return notifications;
};

const [
  queryNotificationByText,
  getAllNotificationsByText,
  getNotificationByText,
  findAllNotificationsByText,
  findNotificationByText,
] = buildQueries(
  queryAllNotificationsByText,
  (
    _element,
    text,
    { appearance = "banner", severity = NotificationSeverity.NEGATIVE } = {},
  ) =>
    `More than one ${appearance} notification with severity "${severity}" and text "${text}" was found.`,
  (
    _element,
    text,
    { appearance = "banner", severity = NotificationSeverity.NEGATIVE } = {},
  ) =>
    `A ${appearance} notification with severity "${severity}" and text "${text}" was not found.`,
);

export {
  findAllNotificationsByText,
  findNotificationByText,
  getAllNotificationsByText,
  getNotificationByText,
  queryNotificationByText,
};
