import { ReactNode } from "react";
import Spinner from "@canonical/react-components/dist/components/Spinner/Spinner";

import "./_loading-handler.scss";

type LoadingHandlerProps = {
  children?: ReactNode;
  data: any;
  noDataMessage: string;
  loading: boolean;
};

export default function LoadingHandler({
  data,
  noDataMessage,
  loading,
  children,
}: LoadingHandlerProps): JSX.Element {
  const generateContent = () => {
    if (!data) {
      if (loading) {
        return (
          <div className="loading-handler__spinner">
            <div className="loading-handler__spinner-content">
              <Spinner />
            </div>
          </div>
        );
      } else {
        return noDataMessage;
      }
    } else {
      return children;
    }
  };

  return <div className="loading-handler">{generateContent()}</div>;
}
