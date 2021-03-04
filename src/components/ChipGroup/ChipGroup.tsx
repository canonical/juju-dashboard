import "./_chip-group.scss";

type Chip = {
  [key: string]: number;
};

type Props = {
  chips: Chip;
  descriptor: string;
};

const ChipGroup = ({ chips, descriptor }: Props) => {
  const getLabelType = (descriptor: string) => {
    let label = undefined;
    switch (descriptor) {
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

  const getSumTotal = (chips: Chip) => {
    let total = 0;
    Object.values(chips).forEach((chipValue) => {
      total = total + chipValue;
    });
    return total;
  };

  const numberOfChips = getSumTotal(chips);
  const labelType = getLabelType(descriptor);
  return (
    <>
      {numberOfChips > 0 && (
        <div className="chip-group">
          {labelType && (
            <strong className="chip-group__descriptor">
              {`${numberOfChips} ${labelType}`}
            </strong>
          )}
          {Object.entries(chips).map(([label, count]) => {
            return (
              // @ts-ignore Can't seem to apply type Chip to [label,count] above?
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
