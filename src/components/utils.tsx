import classNames from "classnames";
import { parseISO, formatDistanceToNow } from "date-fns";
import { ImgHTMLAttributes, useState } from "react";
import defaultCharmIcon from "static/images/icons/default-charm-icon.svg";
import { generateIconPath } from "store/juju/utils/models";
import { ModelData } from "../juju/types";

export function generateEntityIdentifier(
  charmId: string,
  name: string,
  subordinate: boolean
) {
  if (!charmId) {
    return null;
  }

  return (
    <div className="entity-name u-truncate" title={name}>
      {subordinate && <span className="subordinate"></span>}
      {charmId && generateIconImg(name, charmId)}
      {name}
    </div>
  );
}

export const generateStatusElement = (
  status = "unknown",
  count?: number | null,
  useIcon = true,
  actionsLogs = false,
  className: string | null = null
) => {
  let statusClass = status ? `is-${status.toLowerCase()}` : "";
  let countValue = "";
  if (count || count === 0) {
    countValue = ` (${count})`;
  }
  const iconClasses = useIcon ? "status-icon " + statusClass : "";
  // ActionLogs uses a spinner icon if 'running'
  if (actionsLogs && statusClass === "is-running") {
    return (
      <span className="status-icon is-spinner">
        <i className="p-icon--spinner u-animation--spin"></i>
        {status}
      </span>
    );
  }

  return (
    <span className={classNames(iconClasses, className)}>
      {status}
      {countValue}
    </span>
  );
};

export const isSet = (val: unknown) => val || val !== undefined;

/**
  @returns {Int || 0} Returns the current viewport width
*/
export const getViewportWidth = () => {
  const de = document.documentElement;
  return Math.max(de.clientWidth, window.innerWidth || 0);
};

const ImgWithFallback = ({
  src,
  fallback = defaultCharmIcon,
  alt,
  ...props
}: {
  src: string;
  fallback?: string;
  alt: string;
} & Partial<ImgHTMLAttributes<HTMLImageElement>>) => {
  const [imgSrc, setImgSrc] = useState(src);
  const onError = () => setImgSrc(fallback);

  return (
    <img
      alt={alt}
      src={imgSrc ? imgSrc : fallback}
      onError={onError}
      {...props}
    />
  );
};

export const generateIconImg = (name: string, charmId: string) => {
  let iconSrc = defaultCharmIcon;
  if (charmId.indexOf("local:") !== 0) {
    iconSrc = generateIconPath(charmId);
  }
  return (
    <ImgWithFallback
      alt={name + " icon"}
      key={`${name}-${charmId}`}
      title={name}
      width="24"
      height="24"
      className="entity-icon"
      src={iconSrc}
    />
  );
};

export const generateRelationIconImage = (
  applicationName: string,
  applications: ModelData["applications"]
) => {
  const application = applications[applicationName];
  if (!application || !applicationName) {
    return;
  }
  return generateIconImg(applicationName, application["charm-url"]);
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
