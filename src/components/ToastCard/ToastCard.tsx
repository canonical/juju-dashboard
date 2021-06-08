import "./_toast-card.scss";

type Props = {
  type: "positive" | "caution" | "negative";
  message: string;
};

export default function ToastCard({ type, message }: Props) {
  let iconName;
  switch (type) {
    case "positive":
      iconName = "success";
      break;
    case "caution":
      iconName = "warning";
      break;
    case "negative":
      iconName = "error";
      break;
    default:
      break;
  }
  return (
    <div className="toast-card" data-type={type}>
      {iconName && <i className={`p-icon--${iconName}`}>Success</i>}
      <div
        className="toast-card__message"
        dangerouslySetInnerHTML={{ __html: message }}
      ></div>
    </div>
  );
}
