import "./_radio-input-box.scss";

type Props = {
  name: string;
  description: string;
};

export default function RadioInputBox({
  name,
  description,
}: Props): JSX.Element {
  return (
    <div className="radio-input-box">
      <label className="p-radio">
        <input
          type="radio"
          className="p-radio__input"
          name="radioPattern"
          aria-labelledby="radioExample1"
        />
        <span className="p-radio__label" id="radioExample1">
          {name}
        </span>
      </label>
      <div className="radio-input-box__content">{description}</div>
    </div>
  );
}
