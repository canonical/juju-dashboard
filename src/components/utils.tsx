import { parseISO, formatDistanceToNow } from "date-fns";

export const isSet = (val: unknown) => !!val || val !== undefined;

/**
  @returns Returns the current viewport width
*/
export const getViewportWidth = () => {
  const de = document.documentElement;
  return Math.max(de.clientWidth, window.innerWidth || 0);
};

export const formatFriendlyDateToNow = (date: string) => {
  const formattedDate = formatDistanceToNow(parseISO(date));
  return formattedDate.concat(" ago");
};

export const copyToClipboard = (text: string) => {
  const input = document.createElement("input");
  input.setAttribute("value", text);
  document.body.appendChild(input);
  input.select();
  document.execCommand("copy");
  document.body.removeChild(input);
};
