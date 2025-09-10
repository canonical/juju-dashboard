import classNames from "classnames";

import type { Chip } from "./types";

type Props = {
  chips?: Chip | null;
  className?: null | string;
  descriptor?: null | string;
};

const ChipGroup = ({ chips, className, descriptor }: Props) => {
  const getLabelType = (labelDescriptor?: null | string) => {
    let label: null | string = null;
    switch (labelDescriptor) {
      case "localApps":
        label = "Local applications";
        break;
      case "units":
        label = "Units";
        break;
      case "machines":
        label = "Machines";
        break;
      default:
        break;
    }
    return label;
  };

  const getSumTotal = (chipGroup?: Chip | null) => {
    let total = 0;
    chipGroup &&
      Object.values(chipGroup).forEach((chipValue) => {
        total += chipValue;
      });
    return total;
  };

  const numberOfChips = getSumTotal(chips);
  const labelType = getLabelType(descriptor);

  return (
    <>
      {numberOfChips > 0 && (
        <div className={classNames("chip-group", className)}>
          {labelType !== null && labelType ? (
            <strong className="chip-group__descriptor">
              {`${numberOfChips} ${labelType}`}
            </strong>
          ) : null}
          {Object.entries(chips ?? {}).map(([label, count]) => {
            return (
              count > 0 && (
                <div className="p-chip" key={label}>
                  <span
                    className={`status-icon is-${label.toLowerCase()}`}
                  >{`${count} ${label}`}</span>
                </div>
              )
            );
          })}
        </div>
      )}
    </>
  );
};

export default ChipGroup;
