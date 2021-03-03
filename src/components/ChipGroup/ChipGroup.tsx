import "./_chip-group.scss";

type Chip = {
  label: string;
  count: number;
};

type Props = {
  chips: Chip[];
};

const ChipGroup = ({ chips }: Props) => {
  return (
    chips &&
    Object.values(chips).map(({ label, count }) => {
      return (
        count > 0 && (
          <div className="chip-group">
            <div className="p-chip" key={label}>
              <span
                className={`status-icon is-${label.toLowerCase()}`}
              >{`${count} ${label}`}</span>
            </div>
          </div>
        )
      );
    })
  );
};

export default ChipGroup;
