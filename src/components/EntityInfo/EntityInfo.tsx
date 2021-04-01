import "./_entity-info.scss";

type Props = {
  data: { [key: string]: string | JSX.Element };
};

export default function EntityInfo({ data }: Props): JSX.Element {
  return (
    <div className="entity-info__grid">
      {Object.entries(data).map(([label, value]) => {
        return (
          <div className="entity-info__grid-item" key={label}>
            <h4 className="p-muted-heading">{label}</h4>
            <p data-name={label}>{value}</p>
          </div>
        );
      })}
    </div>
  );
}
