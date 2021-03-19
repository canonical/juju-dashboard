type Props = {
  description: string;
};

export default function DescriptionSummary({
  description,
}: Props): JSX.Element {
  // 30 is a magic number, the width of the available text area of the field
  // If the width of the actions area increases then this number will need
  // to be adjusted accordingly.
  if (description.length > 30) {
    return (
      <details className="radio-input-box__details">
        <summary className="radio-input-box__summary">
          <span className="radio-input-box__summary-description">
            {description}
          </span>
          &nbsp;
        </summary>
        <span className="radio-input-box__details-description">
          {description}
        </span>
      </details>
    );
  }
  return <span>{description}</span>;
}
