import classNames from "classnames";

import type { Chip } from "./types";

type Props = {
  chips?: Chip | null;
  className?: string | null;
  descriptor?: string | null;
};

const ChipGroup = ({ chips, className, descriptor }: Props) => {
  const getLabelType = (labelDescriptor?: string | null) => {
    let label;
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
          {labelType && (
            <strong className="chip-group__descriptor">
              {`${numberOfChips} ${labelType}`}
            </strong>
          )}
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
