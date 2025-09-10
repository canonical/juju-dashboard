import { parseISO, formatDistanceToNow } from "date-fns";

export const isSet = (val: unknown): boolean => val !== undefined;

/**
  @returns Returns the current viewport width
*/
export const getViewportWidth = (): number => {
  const de = document.documentElement;
  return Math.max(de.clientWidth, window.innerWidth || 0);
};

export const formatFriendlyDateToNow = (date: string): string => {
  const formattedDate = formatDistanceToNow(parseISO(date));
  return formattedDate.concat(" ago");
};

export const copyToClipboard = (text: string): void => {
  const input = document.createElement("input");
  input.setAttribute("value", text);
  document.body.appendChild(input);
  input.select();
  document.execCommand("copy");
  document.body.removeChild(input);
};
