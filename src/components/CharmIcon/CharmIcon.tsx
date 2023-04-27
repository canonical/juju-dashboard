import type { ImgHTMLAttributes } from "react";
import { useState } from "react";

import defaultCharmIcon from "static/images/icons/default-charm-icon.svg";
import { generateIconPath } from "store/juju/utils/models";

type Props = {
  name: string;
  charmId: string;
} & Partial<ImgHTMLAttributes<HTMLImageElement>>;

const CharmIcon = ({ charmId, name, ...props }: Props) => {
  const src = charmId.startsWith("local:")
    ? defaultCharmIcon
    : generateIconPath(charmId);
  const [imgSrc, setImgSrc] = useState(src);
  const onError = () => setImgSrc(defaultCharmIcon);

  return (
    <img
      alt={name + " icon"}
      className="entity-icon"
      height="24"
      onError={onError}
      src={imgSrc ? imgSrc : defaultCharmIcon}
      title={name}
      width="24"
      {...props}
    />
  );
};

export default CharmIcon;
