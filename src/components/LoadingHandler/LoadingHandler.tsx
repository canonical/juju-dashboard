import Spinner from "@canonical/react-components/dist/components/Spinner/Spinner";

type LoadingHandlerProps = {
  children?: JSX.Element;
  data: any;
  loading: boolean;
};

export default function LoadingHandler({
  data,
  loading,
  children,
}: LoadingHandlerProps): JSX.Element {
  if (!data) {
    if (loading) {
      return <Spinner />;
    } else {
      return <div>This charm has not provided any actions.</div>;
    }
  } else {
    return <div>{children}</div>;
  }
}
