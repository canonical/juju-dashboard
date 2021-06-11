import toast from "react-hot-toast";

import "./_toast-card.scss";

type ToastInstance = {
  createdAt: number;
  duration?: number | undefined;
  id: string;
  message: any;
  pauseDuration: number;
  type: string;
  visible: boolean;
};

type Props = {
  toastInstance: ToastInstance;
  type: "positive" | "caution" | "negative";
  text: string;
};

export default function ToastCard({ toastInstance, type, text }: Props) {
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

  const handleClose = (id: string) => {
    toast.remove(id);
  };

  return (
    <div
      className="toast-card"
      data-type={type}
      role="status"
      aria-live="polite"
    >
      {iconName && <i className={`p-icon--${iconName}`}>Success</i>}
      <div
        className="toast-card__message"
        dangerouslySetInnerHTML={{ __html: text }}
      ></div>
      <i
        className="p-icon--close"
        onClick={() => handleClose(toastInstance.id)}
        onKeyPress={() => handleClose(toastInstance.id)}
        role="button"
        tabIndex={0}
      >
        Close
      </i>
    </div>
  );
}
