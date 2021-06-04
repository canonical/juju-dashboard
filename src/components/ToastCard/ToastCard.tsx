import "./_toast-card.scss";

type Props = {
  type: string;
  message: string;
};

export default function ToastCard({ type, message }: Props) {
  return (
    <div
      className="toast-card"
      data-type={type}
      dangerouslySetInnerHTML={{ __html: message }}
    ></div>
  );
}
